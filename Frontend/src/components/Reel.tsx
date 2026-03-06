import { useState } from 'react';
import type { FC } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Music, Cpu, Scan, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

type ReelProps = {
    reel: {
        id: string;
        user: { username: string; avatar: string };
        videoUrl: string;
        videoOverlayImage?: string;
        caption: string;
        song: string;
        likes: string;
        comments: string;
        shares: string;
    };
};

interface AnalysisResult {
    score: number;
    confidence: string;
    details: string;
    behavioral_score?: number;
    media_score?: number;
    triggered_patterns?: string[];
    gemini_summary?: string;
    gemini_risk?: string;
    gemini_action?: string;
}

const SignalBar: FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="flex flex-col gap-0.5 w-full">
        <div className="flex justify-between text-[10px] text-white/60 font-mono">
            <span>{label}</span>
            <span>{Math.round(value)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full animate-fill-bar ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

export const Reel: FC<ReelProps> = ({ reel }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [showSignals, setShowSignals] = useState(false);
    const [isDeepScan, setIsDeepScan] = useState(false);

    const handleLike = () => setIsLiked(!isLiked);

    const triggerAnalysis = async (force = false) => {
        if (analysisResult && !force) return;

        setIsAnalyzing(true);
        setIsDeepScan(force);
        setAnalysisResult(null);
        setScanProgress(0);
        setShowSignals(false);

        const interval = setInterval(() => {
            setScanProgress(prev => prev >= 95 ? 95 : prev + 3);
        }, 150);

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
            const response = await fetch(`${baseUrl}/api/analyze/reel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reel: {
                        id: reel.id,
                        video_url: reel.videoUrl,
                        username: reel.user.username,
                        caption: reel.caption
                    },
                    deep_scan: force
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            clearInterval(interval);
            setScanProgress(100);

            // Confidence label
            let confidenceStr = "Low";
            if (data.confidence >= 80) confidenceStr = "Very High";
            else if (data.confidence >= 60) confidenceStr = "High";
            else if (data.confidence >= 40) confidenceStr = "Moderate";

            // Build details
            const parts: string[] = [];
            if (data.gemini_insights?.summary && data.gemini_insights.summary !== 'Gemini unavailable') {
                parts.push(data.gemini_insights.summary);
            }
            if (parts.length === 0) {
                parts.push(data.label || "Analysis complete.");
            }

            setTimeout(() => {
                setIsAnalyzing(false);
                setAnalysisResult({
                    score: (data.confidence || 0) / 100,
                    confidence: confidenceStr,
                    details: parts.join(' '),
                    behavioral_score: data.behavioral_score,
                    media_score: data.media_score,
                    triggered_patterns: data.triggered_patterns || [],
                    gemini_summary: data.gemini_insights?.summary,
                    gemini_risk: data.gemini_insights?.risk_factors,
                    gemini_action: data.gemini_insights?.recommendation,
                });
            }, 600);

        } catch (error) {
            console.error('Error analyzing reel:', error);
            clearInterval(interval);
            setScanProgress(100);
            setTimeout(() => {
                setIsAnalyzing(false);
                setAnalysisResult({
                    score: 0.1,
                    confidence: "Low",
                    details: "Offline mode. Detection fidelity limited.",
                });
            }, 600);
        }
    };

    const isAI = analysisResult && analysisResult.score > 0.5;

    return (
        <div className="relative w-full h-[calc(100vh-50px)] md:h-[calc(100vh-80px)] md:max-h-[850px] max-w-[470px] mx-auto bg-black md:rounded-xl overflow-hidden snap-start shrink-0 flex items-center justify-center">

            {/* Background Video/Image */}
            {reel.videoUrl ? (
                <video
                    src={reel.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay loop muted playsInline
                    onDoubleClick={handleLike}
                />
            ) : (
                <img
                    src={reel.videoOverlayImage}
                    alt="Reel content"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    onDoubleClick={handleLike}
                />
            )}

            {/* ── Scanning Overlay ── */}
            {isAnalyzing && (
                <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <div
                            className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)] z-10"
                            style={{ animation: 'scan 1.4s ease-in-out infinite alternate', top: '5%' }}
                        />
                        <Scan size={72} className="text-cyan-400/40" />
                    </div>

                    <div className="text-cyan-400 font-mono text-lg font-bold tracking-widest animate-pulse">
                        {isDeepScan ? 'DEEP SCANNING MEDIA' : 'ANALYZING MEDIA'}
                    </div>
                    {isDeepScan && (
                        <div className="text-cyan-300 text-[10px] font-bold tracking-[0.3em] -mt-2 mb-1 animate-bounce">
                            HIGH-FIDELITY MODE
                        </div>
                    )}

                    <div className="w-60 h-[3px] bg-gray-800 rounded-full overflow-hidden border border-cyan-900/40">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-100 ease-linear"
                            style={{ width: `${scanProgress}%` }}
                        />
                    </div>
                    <div className="text-cyan-400/70 font-mono text-xs">{scanProgress}% COMPLETE</div>
                </div>
            )}

            {/* ── Analysis Result Banner ── */}
            {analysisResult && (
                <div className={`absolute top-14 left-3 right-14 z-20 rounded-2xl border shadow-2xl animate-slide-in-top overflow-hidden
                    ${isAI
                        ? 'bg-rose-950/60 border-rose-500/30 shadow-rose-500/20'
                        : 'bg-emerald-950/60 border-emerald-500/30 shadow-emerald-500/20'}
                    backdrop-blur-md`}
                >
                    {/* Header row */}
                    <div className={`flex items-center gap-2.5 px-4 pt-3.5 pb-2`}>
                        <div className={`p-1.5 rounded-full ${isAI ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {isAI ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-sm leading-tight ${isAI ? 'text-rose-300' : 'text-emerald-300'}`}>
                                {isAI ? 'AI-GENERATED MEDIA DETECTED' : 'HUMAN-GENERATED MEDIA'}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-white/50 text-[10px] font-mono">
                                    Match: {(analysisResult.score * 100).toFixed(1)}%
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono
                                    ${isAI ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                    {analysisResult.confidence}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setAnalysisResult(null)}
                            className="text-white/40 hover:text-white/80 text-lg leading-none shrink-0 transition-colors"
                        >&times;</button>
                    </div>

                    {/* Confidence meter bar */}
                    <div className="px-4 pb-2">
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full animate-fill-bar ${isAI ? 'bg-gradient-to-r from-rose-700 to-rose-400' : 'bg-gradient-to-r from-emerald-700 to-emerald-400'}`}
                                style={{ width: `${analysisResult.score * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Summary text */}
                    {analysisResult.details && (
                        <p className="text-[11px] text-white/70 leading-snug px-4 pb-2">
                            {analysisResult.details}
                        </p>
                    )}

                    {/* Signal breakdown toggle */}
                    {(analysisResult.behavioral_score !== undefined || analysisResult.triggered_patterns?.length! > 0) && (
                        <button
                            onClick={() => setShowSignals(s => !s)}
                            className={`w-full text-[10px] font-bold font-mono border-t py-1.5 transition-colors
                                ${isAI
                                    ? 'border-rose-500/20 text-rose-400/70 hover:text-rose-300'
                                    : 'border-emerald-500/20 text-emerald-400/70 hover:text-emerald-300'}`}
                        >
                            {showSignals ? '▲ HIDE SIGNALS' : '▼ SHOW SIGNALS'}
                        </button>
                    )}

                    {/* Signal detail panel */}
                    {showSignals && (
                        <div className="px-4 pb-3 pt-1 flex flex-col gap-2 border-t border-white/5">
                            {analysisResult.behavioral_score !== undefined && (
                                <SignalBar label="Behavioral" value={analysisResult.behavioral_score} color={analysisResult.behavioral_score > 50 ? 'bg-rose-500' : 'bg-emerald-500'} />
                            )}
                            {analysisResult.media_score !== undefined && analysisResult.media_score > 0 && (
                                <SignalBar label="Media Forensics" value={analysisResult.media_score} color={analysisResult.media_score > 50 ? 'bg-orange-500' : 'bg-sky-500'} />
                            )}
                            {analysisResult.triggered_patterns && analysisResult.triggered_patterns.length > 0 && (
                                <div className="mt-1.5">
                                    <p className="text-[10px] font-mono font-bold text-white/40 uppercase mb-1">Triggered Patterns</p>
                                    <ul className="flex flex-col gap-1">
                                        {analysisResult.triggered_patterns.map((p, i) => (
                                            <li key={i} className="text-[10px] text-white/60 flex gap-1.5 items-start">
                                                <span className="text-rose-400 mt-0.5">•</span>
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {analysisResult.gemini_action && (
                                <div className="mt-1 text-[10px] text-cyan-300/80 border border-cyan-500/20 rounded-lg px-2.5 py-1.5 bg-cyan-950/30">
                                    <span className="font-mono font-bold text-cyan-400">ACTION: </span>
                                    {analysisResult.gemini_action}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ── Gradient overlay ── */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/85 pointer-events-none z-10" />

            {/* ── Header ── */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-auto">
                <span className="font-bold text-xl drop-shadow-md">Reels</span>
            </div>

            {/* ── Bottom info area ── */}
            <div className="absolute bottom-4 left-4 right-16 z-10 flex flex-col gap-3 pointer-events-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                        <img src={reel.user.avatar} alt={reel.user.username} className="w-full h-full" />
                    </div>
                    <span className="font-semibold drop-shadow-md">{reel.user.username}</span>
                    <button className="px-3 py-1 text-sm font-semibold border border-white/80 rounded-lg ml-2 hover:bg-white hover:text-black transition-colors">
                        Follow
                    </button>
                </div>

                <p className="text-sm drop-shadow-md line-clamp-2 pr-4">{reel.caption}</p>

                <div className="flex items-center gap-2 text-sm mt-1 bg-white/10 w-[max-content] px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Music size={14} className="animate-[spin_4s_linear_infinite]" />
                    <span className="truncate max-w-[150px]">{reel.song}</span>
                </div>
            </div>

            {/* ── Right side actions ── */}
            <div className="absolute bottom-4 right-2 z-10 flex flex-col items-center gap-5 pointer-events-auto">

                <div className="flex flex-col items-center gap-1 group">
                    <button onClick={handleLike} className="p-2 transition-transform active:scale-80">
                        <Heart size={28} className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <span className="text-xs font-semibold">{reel.likes}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-2 transition-transform active:scale-80">
                        <MessageCircle size={28} className="text-white" />
                    </button>
                    <span className="text-xs font-semibold">{reel.comments}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-2 transition-transform active:scale-80">
                        <Send size={28} className="text-white -rotate-12" />
                    </button>
                    <span className="text-xs font-semibold">{reel.shares}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-2 transition-transform active:scale-80">
                        <MoreHorizontal size={28} className="text-white" />
                    </button>
                </div>

                {/* AI Eval button */}
                <div className="flex flex-col items-center gap-1 mt-2 relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full scale-150 pointer-events-none" />

                    {analysisResult ? (
                        // Re-analyze button
                        <button
                            onClick={() => triggerAnalysis(true)}
                            className="p-3 bg-gradient-to-tr from-slate-700 to-slate-500 rounded-full transition-all hover:scale-110 active:scale-90 shadow-lg border border-white/20 relative overflow-hidden group"
                            title="Re-analyze"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <RefreshCw size={22} className="text-white relative z-10" />
                        </button>
                    ) : (
                        <button
                            onClick={() => triggerAnalysis()}
                            disabled={isAnalyzing}
                            className="p-3 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-full transition-all hover:scale-110 active:scale-90 shadow-[0_0_18px_rgba(6,182,212,0.5)] border border-cyan-300/30 relative overflow-hidden group disabled:opacity-60"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Cpu size={26} className="text-white relative z-10" />
                        </button>
                    )}
                    <span className="text-[10px] font-bold text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] uppercase">
                        {analysisResult ? 'Re-Eval' : 'AI Eval'}
                    </span>
                </div>
            </div>
        </div>
    );
};
