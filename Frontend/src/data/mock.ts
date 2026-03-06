// Video imports removed as they are served from public/assets
const localReel1 = '/assets/local_reel_1.mp4';
const localReel2 = '/assets/local_reel_2.mp4';
const localReel3 = '/assets/local_reel_3.mp4';
const localReel4 = '/assets/local_reel_4.mp4';
const localReel5 = '/assets/local_reel_5.mp4';
const localReel6 = '/assets/local_reel_6.mp4';
const localReel7 = '/assets/local_reel_7.mp4';
const localReel8 = '/assets/local_reel_8.mp4';
const localReel9 = '/assets/local_reel_9.mp4';
const localReel10 = '/assets/local_reel_10.mp4';
const localReel11 = '/assets/local_reel_11.mp4';
const localReel12 = '/assets/local_reel_12.webp';
const localReel13 = '/assets/local_reel_13.mp4';
const localReel14 = '/assets/local_reel_14.mp4';

export const mockUsers = {
    currentUser: {
        id: 'u1',
        username: 'alex_developer',
        fullName: 'Alex Developer',
        avatar: 'https://i.pravatar.cc/150?u=developer_alex',
        followers: 1240,
        following: 543,
        bio: 'Frontend enthusiast | React & UI/UX | Building Astrava ✨',
        posts: 42
    },
    otherUsers: [
        { id: "user_2", username: "sarah_designs", avatar: "https://i.pravatar.cc/150?u=sarah" },
        { id: "user_3", username: "tech_bro", avatar: "https://i.pravatar.cc/150?u=marcus" },
        { id: "user_4", username: "creative_mind", avatar: "https://i.pravatar.cc/150?u=jessica" },
    ]
};

export const mockPosts = [
    {
        id: "post_1",
        user: mockUsers.otherUsers[0],
        image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=800&auto=format&fit=crop",
        caption: "Just finished redesigning my portfolio! What do you guys think? 🎨✨ #design #uiux",
        likes: 342,
        comments: 12,
        timestamp: "2h",
        isLiked: false,
        isSaved: false,
        location: "San Francisco, CA"
    },
    {
        id: "post_2",
        user: mockUsers.otherUsers[1],
        image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop",
        caption: "Late night coding sessions hit different. ☕️💻 #coding #developer",
        likes: 89,
        comments: 5,
        timestamp: "5h",
        isLiked: true,
        isSaved: true
    },
    {
        id: "post_3",
        user: mockUsers.otherUsers[2],
        image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800&auto=format&fit=crop",
        caption: "Weekend getaway to the mountains 🏔️ #nature #hiking",
        likes: 567,
        comments: 24,
        timestamp: "1d",
        isLiked: false,
        isSaved: false,
        location: "Yosemite National Park"
    },
    {
        id: "post_4",
        user: { id: "user_10", username: "culinary_arts", avatar: "https://i.pravatar.cc/150?u=chef" },
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop",
        caption: "Fresh out of the oven! 🥖 Nothing beats the smell of homemade sourdough.",
        likes: 1205,
        comments: 89,
        timestamp: "1d",
        isLiked: false,
        isSaved: true,
        location: "Paris, France"
    },
    {
        id: "post_5",
        user: { id: "user_12", username: "yoga_vibes", avatar: "https://i.pravatar.cc/150?u=priya" },
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        caption: "Morning flows are the best way to start the day. Remember to breathe. 🧘‍♀️🌅",
        likes: 450,
        comments: 12,
        timestamp: "2d",
        isLiked: true,
        isSaved: false
    },
    {
        id: "post_6",
        user: { id: "user_14", username: "puppy_love", avatar: "https://i.pravatar.cc/150?u=dog" },
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop",
        caption: "Someone is very excited about their new toy! 🎾🐶",
        likes: 8900,
        comments: 340,
        timestamp: "3d",
        isLiked: false,
        isSaved: false
    }
];

export const mockReels = [
    {
        id: "reel_1",
        user: mockUsers.otherUsers[0],
        videoUrl: localReel1,
        videoOverlayImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop",
        caption: "Incredible drone shot from our latest mountain hike! The view from up here is unreal ✨🏔️ #nature #droneshot #explore",
        song: "Original Audio - sarah_designs",
        likes: "1.2M",
        comments: "45K",
        shares: "128K",
        aiAnalysis: {
            score: 0.12,
            confidence: "High",
            details: "Organic movement, natural lighting variations, and sensor noise characteristics indicate human-captured media."
        }
    },
    {
        id: "reel_2",
        user: mockUsers.otherUsers[1],
        videoUrl: localReel2,
        videoOverlayImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
        caption: "Cyberpunk 2077 setup is FINALLY complete! Neon lights, triple monitors, full RGB 🤖💻 #setup #gaming #cyberpunk",
        song: "Cyber Dreams - Synthwave",
        likes: "890K",
        comments: "12K",
        shares: "45K",
        aiAnalysis: {
            score: 0.89,
            confidence: "Very High",
            details: "Midjourney/RunwayML artifacts detected: excessive chromatic aberration, inconsistent physics in reflections."
        }
    },
    {
        id: "reel_3",
        user: mockUsers.otherUsers[2],
        videoUrl: localReel3,
        videoOverlayImage: "https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?q=80&w=800&auto=format&fit=crop",
        caption: "Wait for the drop... visuals mapping onto physical geometry in real time! 🏛️🎨 #projectionmapping #digitalart",
        song: "Mapping the World - DJ Tech",
        likes: "2.4M",
        comments: "89K",
        shares: "340K",
        aiAnalysis: {
            score: 0.95,
            confidence: "High",
            details: "Consistent with Sora/stable-video-diffusion generation patterns. Impossible fluid dynamics observed."
        }
    },
    {
        id: "reel_4",
        user: mockUsers.currentUser,
        videoUrl: localReel4,
        videoOverlayImage: "https://images.unsplash.com/photo-1542831371-32f555c86880?q=80&w=800&auto=format&fit=crop",
        caption: "A day in the life of a frontend engineer ☕🖥️ Morning standup, VS Code, debugging CSS at 2am... the usual 😂 #devlife #frontend",
        song: "LoFi Chill Beats to Code To",
        likes: "45K",
        comments: "450",
        shares: "1.2K",
        aiAnalysis: {
            score: 0.05,
            confidence: "High",
            details: "Standard sensor grain patterns and realistic focal length depth of field detected. 100% human."
        }
    },
    {
        id: "reel_5",
        user: { id: "user_10", username: "culinary_arts", avatar: "https://i.pravatar.cc/150?u=chef" },
        videoUrl: localReel5,
        videoOverlayImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop",
        caption: "The secret to the perfect sourdough crust 🍞🔥 Watch for that crispy crackle! #baking #sourdough #foodie",
        song: "Italian Cafe Music",
        likes: "8.1M",
        comments: "102K",
        shares: "2.5M",
        aiAnalysis: {
            score: 0.08,
            confidence: "High",
            details: "Steam dispersion and crust cracking physics are completely consistent with natural reality."
        }
    },
    {
        id: "reel_6",
        user: { id: "user_11", username: "future_motors", avatar: "https://i.pravatar.cc/150?u=car" },
        videoUrl: localReel6,
        videoOverlayImage: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop",
        caption: "Concept car drifting through a neon-lit city at midnight. This is too clean to be real 🏎️💨 #future #conceptcar #AI",
        song: "Synthwave Drift",
        likes: "500K",
        comments: "8K",
        shares: "50K",
        aiAnalysis: {
            score: 0.98,
            confidence: "Very High",
            details: "Highly synthetic CGI/AI generation. Reflections do not match the environment map. Wheels clip through asphalt."
        }
    },
    {
        id: "reel_7",
        user: { id: "user_12", username: "yoga_vibes", avatar: "https://i.pravatar.cc/150?u=priya" },
        videoUrl: localReel7,
        videoOverlayImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        caption: "Morning yoga flows as the sun rises over the mountains 🧘‍♀️🌅 Start your day with intention #yoga #mindfulness #morningroutine",
        song: "Morning Meditation - Solfeggio Frequencies",
        likes: "120K",
        comments: "1.2K",
        shares: "4K",
        aiAnalysis: {
            score: 0.02,
            confidence: "High",
            details: "Human musculoskeletal movement is perfectly accurate. No temporal inconsistencies."
        }
    },
    {
        id: "reel_8",
        user: { id: "user_13", username: "space_wonders", avatar: "https://i.pravatar.cc/150?u=mars" },
        videoUrl: localReel8,
        videoOverlayImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=800&auto=format&fit=crop",
        caption: "If humans built a colony on Mars, this is EXACTLY what it would look like 🚀🔴 Dome cities, terraformed soil, red skies #mars #space #scifi",
        song: "Hans Zimmer - Interstellar Theme",
        likes: "9.5M",
        comments: "340K",
        shares: "1.1M",
        aiAnalysis: {
            score: 0.99,
            confidence: "Very High",
            details: "100% AI generated. Textures on the dome structures show classic stable-diffusion upscaling artifacts."
        }
    },
    {
        id: "reel_9",
        user: { id: "user_14", username: "puppy_love", avatar: "https://i.pravatar.cc/150?u=dog" },
        videoUrl: localReel9,
        videoOverlayImage: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop",
        caption: "Golden retriever experiencing snow for the first time! Cannot handle the cuteness 🐶❄️ Those zoomies tho!! #puppy #snow #goldenretriever",
        song: "Funny Dog Song",
        likes: "14M",
        comments: "980K",
        shares: "5.6M",
        aiAnalysis: {
            score: 0.15,
            confidence: "High",
            details: "Fur detail and erratic animal movement are highly organic. Characteristic cell-phone camera shake present."
        }
    },
    {
        id: "reel_10",
        user: { id: "user_15", username: "arch_digest", avatar: "https://i.pravatar.cc/150?u=house" },
        videoUrl: localReel10,
        videoOverlayImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        caption: "Inside a $45M modern mansion in the Hollywood Hills 🛋️✨ Infinity pool, floor-to-ceiling glass, insane views #luxury #mansion #realestate",
        song: "Luxury Lifestyle TV - Jazz",
        likes: "2.1M",
        comments: "14K",
        shares: "89K",
        aiAnalysis: {
            score: 0.22,
            confidence: "Moderate",
            details: "Likely real footage, but heavily color-graded and stabilized (gimbal used). Not AI generated."
        }
    },
    {
        id: "reel_11",
        user: mockUsers.otherUsers[0],
        videoUrl: localReel11,
        videoOverlayImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=800&auto=format&fit=crop",
        caption: "Made it to the summit after a 6-hour climb ⛰️🦅 Worth every step! #hiking #adventure #summit",
        song: "Original Audio",
        likes: "1.1M",
        comments: "40K",
        shares: "120K",
        aiAnalysis: {
            score: 0.1,
            confidence: "High",
            details: "Organic attributes."
        }
    },
    {
        id: "reel_12",
        user: mockUsers.otherUsers[1],
        videoUrl: "",
        videoOverlayImage: localReel12,
        caption: "When the code compiles on the first try 😂😂 Caught this hilarious reaction on camera! #funny #coding #relatable",
        song: "Funny audio",
        likes: "800K",
        comments: "10K",
        shares: "30K",
        aiAnalysis: {
            score: 0.1,
            confidence: "High",
            details: "Organic attributes."
        }
    },
    {
        id: "reel_13",
        user: mockUsers.otherUsers[2],
        videoUrl: localReel13,
        videoOverlayImage: "https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?q=80&w=800&auto=format&fit=crop",
        caption: "Watch till the end! 3D projection mapping on this building is next level 🏛️🎨 #art #digitalart #vfx",
        song: "DJ Tech",
        likes: "2M",
        comments: "80K",
        shares: "300K",
        aiAnalysis: {
            score: 0.95,
            confidence: "High",
            details: "AI indicators present."
        }
    },
    {
        id: "reel_14",
        user: mockUsers.currentUser,
        videoUrl: localReel14,
        videoOverlayImage: "https://images.unsplash.com/photo-1542831371-32f555c86880?q=80&w=800&auto=format&fit=crop",
        caption: "Late-night coding session building this Instagram clone ☕🖥️ The grind never stops! #coding #developer #react",
        song: "Coding Beats",
        likes: "40K",
        comments: "400",
        shares: "1K",
        aiAnalysis: {
            score: 0.05,
            confidence: "High",
            details: "100% human."
        }
    }
];
