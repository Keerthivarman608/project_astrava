import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Reel } from './Reel';

export const ReelsView: FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReels = async () => {
        setLoading(true);
        setError(null);
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001';
            console.log("Fetching reels from:", `${baseUrl}/api/reels`);
            const res = await fetch(`${baseUrl}/api/reels`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            console.log("Fetched reels data:", data);
            setReels(data);
        } catch (err: any) {
            console.error("Failed to fetch reels:", err);
            setError(err.message || "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    // Arrow key navigation
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                container.scrollBy({ top: container.clientHeight, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                container.scrollBy({ top: -container.clientHeight, behavior: 'smooth' });
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-cyan-500 font-mono text-sm tracking-widest uppercase">Initializing Reels...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full min-h-screen flex items-center justify-center bg-black p-6">
                <div className="flex flex-col items-center gap-6 max-w-sm text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <span className="text-red-500 text-3xl font-bold">!</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-white font-bold text-lg">Connection Failed</h3>
                        <p className="text-gray-400 text-sm">{error}</p>
                        <p className="text-gray-500 text-xs mt-2 italic">Ensure your backend server is running on port 5001</p>
                    </div>
                    <button 
                        onClick={fetchReels}
                        className="bg-white text-black font-bold py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="w-full h-full min-h-screen flex items-center justify-center bg-black">
                <span className="text-gray-500 font-mono text-sm tracking-widest uppercase">No Reels Found</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-screen md:h-[calc(100vh-40px)] flex justify-center bg-black md:pt-4">
            <div
                ref={scrollRef}
                className="w-full max-w-[470px] h-full overflow-y-scroll snap-y snap-mandatory pb-20 md:pb-0 relative scrollbar-none"
            >
                {reels.map((reel) => (
                    <Reel key={reel.id} reel={reel} />
                ))}
            </div>
        </div>
    );
};
