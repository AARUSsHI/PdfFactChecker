function ClaimCard({ claim, status, confidence, explanation, sources }) {
    const statusColors = {
        verified: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            label: 'Verified'
        },
        inaccurate: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/30',
            text: 'text-amber-400',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            label: 'Inaccurate'
        },
        false: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
            label: 'False'
        }
    };

    const statusStyle = statusColors[status] || statusColors.false;
    const confidencePercent = Math.round((confidence || 0) * 100);

    return (
        <div className={`p-5 rounded-2xl ${statusStyle.bg} border ${statusStyle.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text} text-sm font-medium`}>
                    {statusStyle.icon}
                    <span>{statusStyle.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${statusStyle.text.replace('text-', 'bg-')} transition-all duration-500`}
                            style={{ width: `${confidencePercent}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-400">{confidencePercent}%</span>
                </div>
            </div>

            {/* Claim Text */}
            <p className="text-white text-lg font-medium mb-3 leading-relaxed">
                "{claim}"
            </p>

            {/* Explanation */}
            {explanation && (
                <p className="text-gray-400 text-sm mb-4">
                    {explanation}
                </p>
            )}

            {/* Sources */}
            {sources && sources.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-4">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Sources</h4>
                    <div className="space-y-2">
                        {sources.slice(0, 3).map((source, index) => (
                            <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                            >
                                <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs text-gray-400">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm text-white truncate group-hover:text-cyan-400 transition-colors">
                                        {source.title || 'Source'}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {source.url}
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClaimCard;
