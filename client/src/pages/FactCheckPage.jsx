import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimCard from '../components/ClaimCard';

const API_BASE = 'https://fackcheck-production.up.railway.app';

function FactCheckPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const resultsEndRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loadingStage, setLoadingStage] = useState('');
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);

    // Load history from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('factCheckHistory');
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load history:', e);
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem('factCheckHistory', JSON.stringify(history));
        }
    }, [history]);

    // Auto-scroll to bottom when new results arrive
    useEffect(() => {
        resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Please upload a PDF file');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile?.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please upload a PDF file');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setProgress(0);
        setLoadingStage('Uploading PDF...');

        try {
            // Step 1: Upload PDF and extract text
            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (!uploadData.success) {
                throw new Error(uploadData.message || 'Failed to upload PDF');
            }

            setProgress(5);
            setLoadingStage('Starting analysis...');

            // Step 2: Stream analysis with progress
            const response = await fetch(`${API_BASE}/api/analyze-stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: uploadData.data.text }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.error) {
                                throw new Error(data.error);
                            }

                            if (data.progress !== undefined) {
                                setProgress(data.progress);
                            }

                            if (data.stage) {
                                setLoadingStage(data.stage);
                            }

                            if (data.done) {
                                result = data;
                            }
                        } catch (e) {
                            if (e.message !== 'Unexpected end of JSON input') {
                                console.error('Parse error:', e);
                            }
                        }
                    }
                }
            }

            if (result) {
                const newEntry = {
                    id: Date.now(),
                    filename: file.name,
                    timestamp: new Date().toISOString(),
                    summary: result.summary,
                    claims: result.verified_claims,
                };

                setHistory(prev => [...prev, newEntry]);
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }

        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            setLoadingStage('');
            setProgress(0);
        }
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('factCheckHistory');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        FactCheck AI
                    </span>
                </button>

                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Clear History
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-8 py-12">
                {/* Upload Section */}
                <div
                    onClick={() => !loading && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative p-12 border-2 border-dashed rounded-3xl transition-all duration-300 ${loading
                            ? 'border-purple-400 bg-purple-500/10 cursor-wait'
                            : isDragging
                                ? 'border-cyan-400 bg-cyan-500/10 cursor-pointer'
                                : file
                                    ? 'border-emerald-400 bg-emerald-500/10 cursor-pointer'
                                    : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 cursor-pointer'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                    />

                    <div className="text-center">
                        {loading ? (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                    <svg className="animate-spin w-8 h-8 text-purple-400" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                                <p className="text-lg text-white font-medium mb-2">{loadingStage}</p>

                                {/* Progress Bar */}
                                <div className="max-w-xs mx-auto">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : file ? (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-lg text-white font-medium">{file.name}</p>
                                <p className="text-sm text-gray-400 mt-1">Ready to analyze • Click to change file</p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <p className="text-lg text-white font-medium">Drop your PDF here</p>
                                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Analyze Button */}
                <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className={`w-full mt-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${file && !loading
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {loading ? 'Analyzing...' : 'Analyze Document'}
                </button>

                {/* Results History */}
                {history.length > 0 && (
                    <div className="mt-16 space-y-8">
                        <h2 className="text-2xl font-bold text-white">Analysis History</h2>

                        {history.map((entry) => (
                            <div key={entry.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden">
                                {/* Entry Header */}
                                <div className="p-6 border-b border-white/10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{entry.filename}</h3>
                                            <p className="text-sm text-gray-400">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                ✓ {entry.summary?.verified || 0}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
                                                ⚠ {entry.summary?.inaccurate || 0}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                                                ✕ {entry.summary?.false || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Claims */}
                                <div className="p-6 space-y-4">
                                    {entry.claims?.map((claim, idx) => (
                                        <ClaimCard
                                            key={idx}
                                            claim={claim.claim}
                                            status={claim.status}
                                            confidence={claim.confidence}
                                            explanation={claim.explanation}
                                            sources={claim.sources}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div ref={resultsEndRef} />
                    </div>
                )}

                {/* Empty State */}
                {history.length === 0 && !loading && (
                    <div className="mt-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400">Upload a PDF to start fact-checking</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default FactCheckPage;
