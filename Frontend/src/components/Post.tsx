import { useState } from 'react';
import type { FC } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import type { mockPosts } from '../data/mock';

type PostProps = {
    post: typeof mockPosts[0] & { location?: string };
};

export const Post: FC<PostProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [isSaved, setIsSaved] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleDoubleTap = () => {
        if (!isLiked) {
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
        }
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 1000);
    };

    return (
        <article className="border-b border-[#262626] pb-5 mb-5 mx-auto w-full max-w-[470px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px] cursor-pointer">
                        <img src={post.user.avatar} alt={post.user.username} className="w-full h-full rounded-full border border-black" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="font-semibold text-[14px] text-[#F5F5F5] cursor-pointer hover:text-gray-300">{post.user.username}</span>
                            <span className="text-[#a8a8a8] text-[14px]">• {post.timestamp}</span>
                        </div>
                        {post.location && (
                            <span className="text-[12px] text-[#F5F5F5]">{post.location}</span>
                        )}
                    </div>
                </div>
                <button className="text-[#f5f5f5] hover:text-[#a8a8a8] transition-colors">
                    <MoreHorizontal size={24} />
                </button>
            </div>

            {/* Image */}
            <div
                className="w-full relative border border-[#262626] rounded-[4px] overflow-hidden flex justify-center bg-black cursor-pointer select-none"
                onDoubleClick={handleDoubleTap}
            >
                <img
                    src={post.image}
                    alt={`Post by ${post.user.username}`}
                    className="w-full object-cover max-h-[585px]"
                />

                {/* Double Tap Heart Animation */}
                {showLikeAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <Heart size={100} className="fill-white text-white drop-shadow-2xl animate-like-pop" />
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="pt-2 pb-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <button onClick={handleLike} className="hover:text-[#a8a8a8] transition-colors active:scale-90 p-2 -ml-2">
                            <Heart
                                size={26} strokeWidth={1.5}
                                className={`transition-transform duration-200 ${isLiked ? 'fill-[#ff3040] text-[#ff3040] scale-110' : 'text-[#f5f5f5]'}`}
                            />
                        </button>
                        <button className="hover:text-[#a8a8a8] transition-colors active:scale-90 p-2">
                            <MessageCircle size={26} strokeWidth={1.5} className="text-[#f5f5f5] -scale-x-100" />
                        </button>
                        <button className="hover:text-[#a8a8a8] transition-colors active:scale-90 p-2">
                            <Send size={26} strokeWidth={1.5} className="text-[#f5f5f5]" />
                        </button>
                    </div>
                    <button onClick={() => setIsSaved(!isSaved)} className="hover:text-[#a8a8a8] transition-colors active:scale-90 p-2 -mr-2">
                        <Bookmark size={26} strokeWidth={1.5} className={`transition-transform duration-200 ${isSaved ? 'fill-white text-white scale-110' : 'text-[#f5f5f5]'}`} />
                    </button>
                </div>

                {/* Likes */}
                <div className="text-[14px] text-[#F5F5F5] mb-2 leading-[18px]">
                    Liked by <span className="font-semibold cursor-pointer">sarah_designs</span> and <span className="font-semibold cursor-pointer">{likesCount.toLocaleString()} others</span>
                </div>

                {/* Caption */}
                <div className="text-[14px] leading-[18px] text-[#F5F5F5] mb-1">
                    <span className="font-semibold mr-1 cursor-pointer">{post.user.username}</span>
                    <span>
                        {isCaptionExpanded || post.caption.length <= 80
                            ? post.caption
                            : `${post.caption.substring(0, 80)}...`}
                    </span>
                    {!isCaptionExpanded && post.caption.length > 80 && (
                        <button
                            className="text-[#a8a8a8] ml-1 hover:text-white"
                            onClick={() => setIsCaptionExpanded(true)}
                        >
                            more
                        </button>
                    )}
                </div>

                {/* Comments Prompt */}
                <div className="text-[#a8a8a8] text-[14px] leading-[18px] mb-2 cursor-pointer">
                    View all {post.comments} comments
                </div>

                {/* Add Comment */}
                <div className="flex items-center justify-between group mt-2">
                    <div className="flex items-center gap-3 w-full">
                        <img src="https://i.pravatar.cc/150?u=developer_alex" alt="You" className="w-6 h-6 rounded-full" />
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="bg-transparent border-none outline-none flex-1 text-[13px] text-[#F5F5F5] placeholder-[#a8a8a8]"
                        />
                    </div>
                    <button className="font-semibold text-[#0095f6] hover:text-white hidden group-focus-within:block text-sm ml-2">
                        Post
                    </button>
                </div>
            </div>
        </article>
    );
};
