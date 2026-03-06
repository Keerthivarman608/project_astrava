import type { FC } from 'react';
import { Settings, Plus, LayoutGrid, Play, Bookmark, UserSquare, Heart, MessageCircle } from 'lucide-react';
import { mockPosts } from '../data/mock';
import { useAuth } from '../context/AuthContext';

export const ProfileView: FC = () => {
    const { profile } = useAuth();

    // Default values for stats if not in profile
    const stats = {
        posts: 0,
        followers: 124,
        following: 156,
    };

    const username = profile?.username || 'user';
    const fullName = profile?.fullName || 'Full Name';
    const bio = profile?.bio || 'No bio yet.';
    const avatar = profile?.avatar || "https://i.pravatar.cc/150?u=developer_alex";

    // Re-use mock posts images for the grid
    const gridItems = [...mockPosts, ...mockPosts, ...mockPosts].map((post, i) => ({
        id: `grid_${i}`,
        image: post.image
    }));

    return (
        <div className="w-full flex-1 md:max-w-[935px] mx-auto overflow-y-auto bg-[var(--color-canvas)]">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 bg-[var(--color-canvas)] border-b border-[#262626] flex items-center justify-between p-4 z-10">
                <div className="flex items-center gap-1">
                    <span className="font-bold text-xl">{username}</span>
                </div>
                <div className="flex gap-4">
                    <Plus size={26} />
                    <Settings size={26} />
                </div>
            </div>

            <div className="p-4 md:py-8 md:px-12 flex flex-col md:flex-row gap-4 md:gap-20 border-b border-[#262626] md:mb-8">
                {/* Avatar */}
                <div className="flex-shrink-0 flex justify-center md:items-start md:w-[290px]">
                    <div className="w-[77px] h-[77px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border border-[#262626]">
                        <img src={avatar} alt={username} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
                        <h2 className="text-xl md:text-xl font-medium">{username}</h2>
                        <div className="flex gap-2">
                            <button className="bg-white text-black font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200">
                                Edit profile
                            </button>
                            <button className="bg-[#efefef] text-black font-semibold text-sm px-4 py-1.5 rounded-lg hover:bg-gray-200">
                                View archive
                            </button>
                            <button className="hidden md:flex items-center justify-center p-1">
                                <Settings size={24} className="text-[#f5f5f5]" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Stats */}
                    <div className="hidden md:flex gap-10 mb-6">
                        <span className="text-[16px]">
                            <span className="font-semibold">{stats.posts}</span> posts
                        </span>
                        <span className="text-[16px] cursor-pointer">
                            <span className="font-semibold">{stats.followers}</span> followers
                        </span>
                        <span className="text-[16px] cursor-pointer">
                            <span className="font-semibold">{stats.following}</span> following
                        </span>
                    </div>

                    {/* Bio */}
                    <div className="text-sm md:text-[15px]">
                        <div className="font-semibold">{fullName}</div>
                        <div className="whitespace-pre-wrap">{bio}</div>
                    </div>
                </div>
            </div>

            {/* Mobile Stats */}
            <div className="md:hidden flex justify-around py-3 border-t border-[#262626]">
                <div className="flex flex-col items-center">
                    <span className="font-semibold">{stats.posts}</span>
                    <span className="text-sm text-[#a8a8a8]">posts</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-semibold">{stats.followers}</span>
                    <span className="text-sm text-[#a8a8a8]">followers</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-semibold">{stats.following}</span>
                    <span className="text-sm text-[#a8a8a8]">following</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-t border-[#262626] md:border-none">
                <div className="flex justify-around md:justify-center md:gap-14 w-full md:w-auto md:border-t md:border-[#262626]">
                    {['POSTS', 'REELS', 'SAVED', 'TAGGED'].map((tab, idx) => (
                        <button
                            key={tab}
                            className={`flex items-center gap-2 h-[52px] text-xs font-semibold tracking-widest transition-colors ${idx === 0 ? 'text-[#f5f5f5] md:-mt-[1px] md:border-t md:border-white' : 'text-[#a8a8a8] hover:text-[#f5f5f5] md:-mt-[1px] md:border-t md:border-transparent'}`}
                        >
                            {idx === 0 && <LayoutGrid size={14} />}
                            {idx === 1 && <Play size={14} />}
                            {idx === 2 && <Bookmark size={14} />}
                            {idx === 3 && <UserSquare size={14} />}
                            <span className="hidden md:inline">{tab}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-1 md:gap-2 pb-16 md:pb-8">
                {gridItems.map((item) => (
                    <div key={item.id} className="aspect-square bg-[#121212] relative group cursor-pointer overflow-hidden">
                        <img src={item.image} alt="post" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <Heart size={20} className="fill-white" /> 120
                            </div>
                            <div className="flex items-center gap-2 text-white font-bold">
                                <MessageCircle size={20} className="fill-white" /> 10
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
