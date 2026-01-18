import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        FactCheck AI
                    </span>
                </div>
                <button
                    onClick={() => navigate('/check')}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium transition-all duration-300"
                >
                    Get Started
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-300">AI-Powered Verification</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    Verify Facts in
                    <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Seconds, Not Hours
                    </span>
                </h1>

                <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
                    Upload your PDF documents and let AI cross-reference every claim against
                    live web data. Get instant verification with confidence scores and source citations.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/check')}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl text-white font-semibold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Fact Checking
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>

                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-semibold text-lg transition-all duration-300">
                        See How It Works
                    </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-12 mt-20">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">99%</div>
                        <div className="text-gray-400">Accuracy Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">&lt;30s</div>
                        <div className="text-gray-400">Avg. Processing</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">1M+</div>
                        <div className="text-gray-400">Claims Verified</div>
                    </div>
                </div>
            </main>

            {/* Feature Cards */}
            <section className="relative z-10 px-8 pb-20">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">PDF Extraction</h3>
                        <p className="text-gray-400">Upload any PDF and we'll automatically extract all verifiable claims, stats, and figures.</p>
                    </div>

                    <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Live Web Search</h3>
                        <p className="text-gray-400">Each claim is verified against current web data using advanced neural search technology.</p>
                    </div>

                    <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-pink-500/50 transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Detailed Reports</h3>
                        <p className="text-gray-400">Get comprehensive reports with confidence scores, source citations, and explanations.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 px-8 py-6">
                <div className="flex items-center justify-center text-gray-500 text-sm">
                    Built with AI • Powered by OpenRouter & Exa
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
