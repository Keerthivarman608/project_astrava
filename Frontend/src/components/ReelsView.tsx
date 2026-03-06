import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Reel } from './Reel';

export const ReelsView: FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const res = await fetch('http://localhost:5001/api/reels');
                const data = await res.json();
                setReels(data);
            } catch (err) {
                console.error("Failed to fetch reels", err);
            } finally {
                setLoading(false);
            }
        };
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
            <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-cyan-500 font-mono text-sm tracking-widest">LOADING REELS...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full md:h-[calc(100vh-40px)] flex justify-center bg-black md:pt-4">
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
