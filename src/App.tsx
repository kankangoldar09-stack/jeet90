import { motion, AnimatePresence } from "motion/react";
import { 
  Home, 
  Search, 
  PlusSquare, 
  Clapperboard, 
  User, 
  Heart, 
  MessageCircle, 
  Send, 
  MoreVertical,
  Music2,
  Music,
  SkipBack,
  SkipForward,
  Bookmark,
  Settings,
  Grid,
  Globe,
  Play,
  Pause,
  ArrowLeft,
  LogOut,
  Shield,
  Bell,
  Lock,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Mic,
  Link2,
  Smile,
  Type,
  Image as ImageIcon,
  Zap,
  Timer as TimerIcon,
  RefreshCw,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  Tag,
  MapPin,
  FileText,
  HelpCircle,
  Hash,
  Camera,
  Trash2,
  AlertCircle
} from "lucide-react";
import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { auth, db, googleProvider } from "./firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  where,
  doc,
  increment,
  deleteDoc
} from "firebase/firestore";

// --- Types ---
interface Reel {
  id: string;
  videoUrl: string;
  username: string;
  description: string;
  likes: string | number;
  comments: string | number;
  musicName: string;
  avatarUrl: string;
  timestamp?: string;
  isImage?: boolean;
  userId?: string;
  likesCount?: number;
  commentsCount?: number;
}

// --- Mock Data ---
const MOCK_REELS: Reel[] = [
  {
    id: "1",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-in-the-city-at-night-21895-large.mp4",
    username: "neon_vibes",
    description: "City lights and neon nights ✨ #mumbai #nightlife",
    likes: "124K",
    comments: "1.2K",
    musicName: "Original Audio - Night City",
    avatarUrl: "https://picsum.photos/seed/user1/100/100"
  },
  {
    id: "2",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-leaves-fading-in-the-wind-2318-large.mp4",
    username: "nature_lover",
    description: "Autumn colors are just different. 🍂 #peace #nature",
    likes: "89K",
    comments: "850",
    musicName: "Lofi Beats - Autumn",
    avatarUrl: "https://picsum.photos/seed/user2/100/100"
  },
  {
    id: "3",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-a-field-of-flowers-34440-large.mp4",
    username: "dance_india",
    description: "Free spirit in the fields. 🌸 #dance #freedom",
    likes: "256K",
    comments: "3.4K",
    musicName: "Desi Beats - Summer Mix",
    avatarUrl: "https://picsum.photos/seed/user3/100/100"
  }
];

// --- Components ---

const TG_BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN;
const TG_CHAT_ID = import.meta.env.VITE_TG_CHAT_ID;
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;

const GiphySearch = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchGifs = async (q: string) => {
    if (!q) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=20&rating=g`);
      const data = await resp.json();
      setGifs(data.data || []);
    } catch (err) {
      console.error("Giphy error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) searchGifs(query);
      else fetchTrending();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`);
      const data = await resp.json();
      setGifs(data.data || []);
    } catch (err) {
      console.error("Giphy error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-zinc-900 rounded-xl flex items-center px-4 py-2 gap-3 border border-zinc-800">
        <Search size={18} className="text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search GIFs..." 
          className="bg-transparent flex-1 text-sm focus:outline-none text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="col-span-2 py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          gifs.map((gif) => (
            <motion.div 
              key={gif.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(gif.images.fixed_height.url)}
              className="aspect-video bg-zinc-900 rounded-lg overflow-hidden cursor-pointer border border-zinc-800"
            >
              <img src={gif.images.fixed_height.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const PersonalLogo = ({ className, text = "JEET" }: { className?: string; text?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#FF9933] via-[#FFFFFF] to-[#138808] p-[2px] shadow-[0_0_20px_rgba(255,153,51,0.4)] rotate-3 hover:rotate-0 transition-transform duration-500">
      <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="flex flex-col items-center justify-center -space-y-1">
          <span className="text-white font-black text-[11px] tracking-tighter z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] italic">
            {text}
          </span>
          <div className="w-4 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      </div>
    </div>
  </div>
);

const IndianReelsLogo = ({ className }: { className?: string }) => (
  <PersonalLogo className={className} />
);

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.22, 1, 0.36, 1]
        }}
        className="w-24 h-24"
      >
        <IndianReelsLogo className="w-full h-full" />
      </motion.div>

      <motion.div 
        className="absolute bottom-12 flex flex-col items-center gap-0.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-[0.2em]">from</span>
        <span className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF9933]" />
          INDIANREELS
          <div className="w-2 h-2 rounded-full bg-[#138808]" />
        </span>
      </motion.div>
    </motion.div>
  );
};

const ReelItem = ({ reel, isActive, onCommentClick, onLike, onViewProfile, isFollowing, onFollow, onUnfollow, currentUser }: { 
  reel: Reel; 
  isActive: boolean; 
  onCommentClick: () => void; 
  onLike?: (id: string, inc: number) => void; 
  onViewProfile?: (username: string) => void;
  isFollowing?: boolean;
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
  currentUser?: any;
  key?: string 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTap = useRef<number>(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setIsLiked(true);
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 1000);
    }
    lastTap.current = now;
  };

  const toggleMute = (e: any) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Optimistic update of local reels state
    if (onLike) onLike(reel.id, newLikedState ? 1 : -1);
    
    try {
      const reelRef = doc(db, "reels", reel.id);
      await updateDoc(reelRef, {
        likes: increment(newLikedState ? 1 : -1)
      });
    } catch (err) {
      console.error("Error updating reel like:", err);
    }
  };

  return (
    <div 
      className="relative h-full w-full bg-black snap-start overflow-hidden flex items-center justify-center"
      onClick={handleDoubleTap}
    >
      {reel.isImage ? (
        <img src={reel.videoUrl} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          crossOrigin="anonymous"
        />
      )}
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Progress Bar */}
      {!reel.isImage && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20 z-30">
          <motion.div 
            className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Mute Toggle */}
      {!reel.isImage && (
        <button 
          onClick={toggleMute}
          className="absolute top-24 right-4 z-30 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 active:scale-90 transition-transform"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

      {/* Big Heart Animation on Double Tap */}
      <AnimatePresence>
        {showBigHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <Heart size={100} className="text-white fill-white drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <div className="flex flex-col items-center gap-1">
          <motion.button 
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
          >
            <Heart 
              size={32} 
              className={`transition-colors duration-200 ${isLiked ? "text-red-500 fill-red-500" : "text-white fill-none"}`} 
            />
          </motion.button>
          <span className="text-white text-xs font-semibold">{reel.likes}</span>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <motion.button 
            whileTap={{ scale: 0.8 }} 
            onClick={(e) => {
              e.stopPropagation();
              onCommentClick();
            }}
          >
            <MessageCircle size={32} className="text-white" />
          </motion.button>
          <span className="text-white text-xs font-semibold">{reel.comments}</span>
        </div>

        <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
          <Send size={28} className="text-white -rotate-12" />
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
          <Bookmark size={28} className="text-white" />
        </motion.button>

        <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
          <MoreVertical size={24} className="text-white" />
        </motion.button>

        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-zinc-700 p-1 mt-2 bg-black/40 backdrop-blur-sm"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center">
            <Music2 size={14} className="text-zinc-400" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-4 right-16 z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full border border-white/30 overflow-hidden">
            <img src={reel.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewProfile) onViewProfile(reel.username);
                }}
                className="font-semibold text-sm drop-shadow-md hover:underline"
              >
                {reel.username}
              </button>
              {reel.userId !== currentUser?.id && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFollowing) {
                      onUnfollow?.(reel.userId);
                    } else {
                      onFollow?.(reel.userId);
                    }
                  }}
                  className={`px-3 py-1 bg-transparent border rounded-lg text-[10px] font-semibold transition-colors ${isFollowing ? "border-white/30 text-white/70" : "border-white/70 text-white"}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
            {reel.timestamp && <span className="text-[10px] text-zinc-400 font-medium">{reel.timestamp}</span>}
          </div>
        </div>
        
        <p className="text-sm mb-3 line-clamp-2 drop-shadow-md">{reel.description}</p>
        
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-full border border-white/10">
          <Music2 size={14} />
          <div className="overflow-hidden max-w-[150px]">
            <motion.div 
              animate={{ x: [0, -100] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap text-xs"
            >
              {reel.musicName} • {reel.musicName}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StoryBar = ({ user, onAddStory, stories, onStoryClick }: { user: any; onAddStory: () => void; stories: any[]; onStoryClick: (story: any) => void }) => {
  const displayStories = [
    { id: 'me', username: "Your Story", avatar: user?.avatarUrl || "https://picsum.photos/seed/me/100/100", isMe: true },
    ...stories.filter(s => {
      if (s.isDeleted) return false;
      const isExpired = (Date.now() - (s.createdAt?.seconds * 1000 || Date.now())) > (24 * 60 * 60 * 1000);
      return !isExpired || s.isHighlighted;
    }).map(s => ({ ...s, isMe: false }))
  ];

  return (
    <div className="flex overflow-x-auto no-scrollbar py-4 px-2 gap-4 border-b border-white/10">
      {displayStories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div 
            onClick={() => story.isMe ? onAddStory() : onStoryClick(story)}
            className={`p-[2px] rounded-full cursor-pointer ${story.isMe ? "" : "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"}`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden relative">
              <img src={story.avatar || story.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {story.isMe && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-black p-0.5">
                  <PlusSquare size={12} className="text-white fill-white" />
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] text-gray-300 w-16 text-center truncate">{story.username}</span>
        </div>
      ))}
    </div>
  );
};

const PostItem = ({ post, onLike, onComment, onViewProfile }: { post: any; onLike?: (id: string, inc: number) => void; onComment?: (id: string) => void; onViewProfile?: (username: string) => void; key?: string | number }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(parseInt(post.likes?.toString().replace(/[^0-9]/g, '') || "0"));

  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
    
    if (onLike) onLike(post.id, newLikedState ? 1 : -1);

    try {
      const reelRef = doc(db, "reels", post.id);
      await updateDoc(reelRef, {
        likes: increment(newLikedState ? 1 : -1)
      });
    } catch (err) {
      console.error("Error updating post like:", err);
    }
  };

  return (
    <div className="flex flex-col border-b border-white/10 pb-4">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onViewProfile && onViewProfile(post.username)}
            className="w-8 h-8 rounded-full overflow-hidden border border-white/10"
          >
            <img src={post.avatarUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </button>
          <button 
            onClick={() => onViewProfile && onViewProfile(post.username)}
            className="text-sm font-semibold hover:underline"
          >
            {post.username}
          </button>
        </div>
        <MoreVertical size={20} />
      </div>
      <div className="aspect-square bg-zinc-900 overflow-hidden relative flex items-center justify-center">
        {post.isImage ? (
          <img src={post.videoUrl || post.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <video 
            src={post.videoUrl} 
            className="w-full h-full object-cover" 
            controls
            playsInline
            crossOrigin="anonymous"
          />
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <motion.button whileTap={{ scale: 0.8 }} onClick={handleLike}>
            <Heart size={26} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
          </motion.button>
          <MessageCircle size={26} />
          <Send size={26} className="-rotate-12" />
        </div>
        <Bookmark size={26} />
      </div>
      <div className="px-3">
        <p className="text-sm font-semibold mb-1">{likesCount.toLocaleString()} likes</p>
        <p className="text-sm">
          <span className="font-semibold mr-2">{post.username}</span>
          {post.description}
        </p>
        <p className="text-xs text-gray-500 mt-2 uppercase">{post.timestamp || "Just now"}</p>
      </div>
    </div>
  );
};

const HomeView = ({ user, onAddStory, stories, onStoryClick, reels, onLike, onViewProfile }: { 
  user: any; 
  onAddStory: () => void; 
  stories: any[]; 
  onStoryClick: (story: any) => void; 
  reels: Reel[];
  onLike?: (id: string, inc: number) => void;
  onViewProfile?: (username: string) => void;
}) => {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pt-16">
      <StoryBar user={user} onAddStory={onAddStory} stories={stories} onStoryClick={onStoryClick} />
      <div className="flex flex-col">
        {reels.map(reel => (
          <PostItem 
            key={reel.id} 
            post={reel} 
            onLike={onLike}
            onViewProfile={onViewProfile}
          />
        ))}
        {reels.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Clapperboard size={48} strokeWidth={1} />
            <p className="text-sm">No posts in feed yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateStoryView = ({ user, onComplete }: { user: any; onComplete: () => void }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, "stories"), {
        userId: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        mediaUrl: preview,
        createdAt: serverTimestamp(),
        likes: 0,
        isHighlighted: false
      });
      onComplete();
    } catch (err) {
      console.error("Story upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
        <button onClick={onComplete}><X size={24} /></button>
        <span className="font-bold">Add to Story</span>
        <button onClick={handleUpload} disabled={!preview || isUploading} className="text-blue-500 font-bold">
          {isUploading ? "Sharing..." : "Share"}
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {preview ? (
          <img src={preview} className="max-h-full max-w-full rounded-xl object-contain" />
        ) : (
          <label className="w-full aspect-[9/16] border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer">
            <Camera size={48} className="text-zinc-700" />
            <span className="text-zinc-500">Select photo for story</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}
      </div>
    </div>
  );
};

const StoryDetailView = ({ story, user, onClose, onUpdate }: { story: any; user: any; onClose: () => void; onUpdate: () => void }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleHighlight = async () => {
    try {
      await updateDoc(doc(db, "stories", story.id), { isHighlighted: !story.isHighlighted });
      onUpdate();
    } catch (err) {
      console.error("Highlight failed:", err);
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    try {
      await updateDoc(doc(db, "stories", story.id), { 
        likes: (story.likes || 0) + (isLiked ? -1 : 1) 
      });
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleDelete = async () => {
    if (story.isHighlighted) {
      alert("Highlighted stories cannot be deleted! 🇮🇳");
      return;
    }
    if (window.confirm("Delete this story?")) {
      try {
        // In a real app we'd use deleteDoc, but for now we can just mark as deleted or actually delete
        // await deleteDoc(doc(db, "stories", story.id));
        // Since I don't have deleteDoc imported, I'll just use updateDoc to mark it
        await updateDoc(doc(db, "stories", story.id), { isDeleted: true });
        onUpdate();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
            <img src={story.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-bold">{story.username}</span>
        </div>
        <div className="flex items-center gap-4">
          {user?.id === story.userId && (
            <button onClick={handleDelete} className="text-white/50 hover:text-red-500 transition-colors p-2 bg-black/20 rounded-full">
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={onClose} className="p-2 bg-black/20 rounded-full"><X size={24} /></button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img src={story.mediaUrl} className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-6">
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            <Heart size={28} className={isLiked ? "text-red-500 fill-red-500" : "text-white"} />
            <span className="text-[10px] font-bold">{(story.likes || 0) + (isLiked ? 1 : 0)}</span>
          </button>
          <Send size={28} className="-rotate-12" />
        </div>
        {user?.id === story.userId && (
          <button 
            onClick={handleHighlight}
            className={`flex flex-col items-center gap-1 ${story.isHighlighted ? "text-yellow-500" : "text-white"}`}
          >
            <Heart size={20} className={story.isHighlighted ? "fill-yellow-500" : ""} />
            <span className="text-[10px] font-bold uppercase">Highlight</span>
          </button>
        )}
      </div>
    </div>
  );
};

const CommentModal = ({ isOpen, onClose, reelId, user }: { isOpen: boolean; onClose: () => void; reelId: string; user: any }) => {
  const [newComment, setNewComment] = useState("");
  const [showGifs, setShowGifs] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reelId) {
      fetchComments();
    }
  }, [isOpen, reelId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "comments"), where("reelId", "==", reelId), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLocalComments(fetched);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (content: string, isGif: boolean = false) => {
    if (!content.trim()) return;

    const commentData = {
      reelId,
      userId: user?.id,
      username: user?.username || "user",
      text: isGif ? "Sent a GIF" : content,
      gifUrl: isGif ? content : null,
      time: "Just now",
      createdAt: serverTimestamp(),
      avatar: user?.avatarUrl || "https://picsum.photos/seed/me/100/100",
      likes: 0,
      isPinned: false
    };

    // Optimistic update
    setLocalComments([{ ...commentData, id: "temp-" + Date.now() }, ...localComments]);
    setNewComment("");
    setShowGifs(false);

    try {
      await addDoc(collection(db, "comments"), commentData);
      
      // Update comment count on reel
      const reelRef = doc(db, "reels", reelId);
      await updateDoc(reelRef, {
        comments: increment(1)
      });
    } catch (err) {
      console.error("Error saving comment:", err);
    }

    // Send to Telegram
    try {
      const message = `💬 *New Comment on INDIANREELS*\n👤 User: @${user?.username}\n📝 Comment: ${isGif ? "[GIF]" : content}`;
      
      if (isGif) {
        const formData = new FormData();
        formData.append("chat_id", TG_CHAT_ID);
        formData.append("animation", content);
        formData.append("caption", message);
        formData.append("parse_mode", "Markdown");
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendAnimation`, {
          method: "POST",
          body: formData
        });
      } else {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
          })
        });
      }
    } catch (err) {
      console.error("Telegram comment error:", err);
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    try {
      const updated = localComments.map(c => 
        c.id === commentId ? { ...c, likes: currentLikes + 1 } : c
      );
      setLocalComments(updated);
      
      if (!commentId.startsWith("temp-")) {
        await updateDoc(doc(db, "comments", commentId), {
          likes: currentLikes + 1
        });
      }
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-black flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
            <button onClick={onClose}><ArrowLeft size={24} /></button>
            <span className="font-bold">Comments</span>
            <div className="w-6" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {localComments
              .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
              .map((c, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img src={c.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{c.username}</span>
                    {c.isPinned && <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 flex items-center gap-1"><Lock size={8} /> Pinned</span>}
                    <span className="text-xs text-zinc-500">{c.time}</span>
                  </div>
                  {c.gifUrl ? (
                    <div className="mt-1 rounded-lg overflow-hidden border border-zinc-800 max-w-[200px]">
                      <img src={c.gifUrl} className="w-full h-auto" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-200">{c.text}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      onClick={() => handleLikeComment(c.id, c.likes || 0)}
                      className="text-[10px] font-bold text-zinc-500 hover:text-white flex items-center gap-1"
                    >
                      <Heart size={10} className={c.likes > 0 ? "fill-red-500 text-red-500" : ""} /> {c.likes || 0} Likes
                    </button>
                    <button className="text-[10px] font-bold text-zinc-500 hover:text-white">Reply</button>
                    {user?.username === "neon_vibes" && ( // Mocking creator check
                      <button 
                        onClick={() => {
                          const pinnedCount = localComments.filter(com => com.isPinned).length;
                          if (!c.isPinned && pinnedCount >= 5) {
                            alert("You can only pin up to 5 comments! 🇮🇳");
                            return;
                          }
                          const updated = [...localComments];
                          updated[i].isPinned = !updated[i].isPinned;
                          setLocalComments(updated);
                        }}
                        className={`text-[10px] font-bold ${c.isPinned ? "text-blue-500" : "text-zinc-500 hover:text-white"}`}
                      >
                        {c.isPinned ? "Unpin" : "Pin"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showGifs && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-950">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-zinc-500 uppercase">Select GIF</span>
                <button onClick={() => setShowGifs(false)}><X size={16} /></button>
              </div>
              <GiphySearch onSelect={(url) => handlePostComment(url, true)} />
            </div>
          )}

          <div className="p-4 border-t border-zinc-800 flex items-center gap-3 bg-black">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={user?.avatarUrl || "https://picsum.photos/seed/me/100/100"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full bg-zinc-900 rounded-full px-4 py-2 text-sm focus:outline-none pr-10"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePostComment(newComment)}
              />
              <button 
                onClick={() => setShowGifs(!showGifs)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                <span className="text-[10px] font-bold border border-zinc-700 px-1 rounded">GIF</span>
              </button>
            </div>
            <button 
              onClick={() => handlePostComment(newComment)}
              className="text-blue-500 font-bold text-sm disabled:opacity-50"
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SearchView = () => {
  const [query, setQuery] = useState("");
  const explorePosts = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    image: `https://picsum.photos/seed/explore${i}/300/300`
  }));

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pt-16 px-1">
      <div className="px-3 mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 rounded-xl flex-1 flex items-center px-4 py-2 gap-3 border border-zinc-800">
            <Search size={18} className="text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="bg-transparent flex-1 text-sm focus:outline-none text-white"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1">
        {explorePosts.map(post => (
          <div key={post.id} className="aspect-square bg-zinc-800 overflow-hidden">
            <img src={post.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>
    </div>
  );
};

const CreatePostView = ({ user, onComplete, onAddReel }: { user: any; onComplete: () => void; onAddReel: (reel: Reel) => void }) => {
  const [step, setStep] = useState(1); // 1: Gallery, 2: Camera, 3: Preview, 4: Share
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileType, setFileType] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("0.0s");
  const [uploadStatus, setUploadStatus] = useState<string>("POSTING TO FEED...");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [musicQuery, setMusicQuery] = useState("");
  const [musicResults, setMusicResults] = useState<any[]>([]);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);

  const searchMusic = async (q: string) => {
    if (!q.trim()) return;
    setIsSearchingMusic(true);
    try {
      const resp = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=10`);
      const data = await resp.json();
      setMusicResults(data.results);
    } catch (err) {
      console.error("Music search failed:", err);
    } finally {
      setIsSearchingMusic(false);
    }
  };

  useEffect(() => {
    if (step === 2) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    setIsRecording(true);
    chunksRef.current = [];
    const recorder = new MediaRecorder(cameraStream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      setFileType('video/mp4');
      setStep(3);
    };
    recorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isUploading && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = (now - startTime) / 1000;
        setElapsedTime(diff.toFixed(1) + "s");
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isUploading, startTime]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setStep(3); // Go to Preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setStartTime(Date.now());
    setUploadProgress(0);
    setUploadStatus("PREPARING MEDIA...");
    
    try {
      let blob: Blob;
      if (preview!.startsWith('data:')) {
        const parts = preview!.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || fileType;
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        const resp = await fetch(preview!);
        blob = await resp.blob();
      }

      const fullCaption = `${caption}\n\n${tags.split(' ').map(t => t.startsWith('#') ? t : `#${t}`).join(' ')}\n📍 ${location}`;
      const formData = new FormData();
      formData.append("chat_id", TG_CHAT_ID);
      formData.append("caption", `🚀 *New Post on INDIANREELS*\n👤 User: @${user?.username}\n📝 Caption: ${fullCaption}`);
      formData.append("parse_mode", "Markdown");
      
      const isVideo = fileType.startsWith("video");
      const endpoint = isVideo ? "sendVideo" : "sendPhoto";
      formData.append(isVideo ? "video" : "photo", blob);

      const tgResult = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.telegram.org/bot${TG_BOT_TOKEN}/${endpoint}`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 90);
            setUploadProgress(percentComplete);
            setUploadStatus(`UPLOADING TO TELEGRAM (${percentComplete}%)...`);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.description || "Telegram Upload Failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during Telegram upload"));
        xhr.send(formData);
      });
      
      setUploadProgress(95);
      setUploadStatus("POSTED TO TELEGRAM! 🚀");
      
      // OPTIMISTIC SUCCESS:
      // We have the video on Telegram. We can now tell the user it's a success
      // and close the view, while we handle the link retrieval and DB save in the background.
      
      const tempReel: Reel = {
        id: "temp-" + Date.now(),
        videoUrl: preview!, // Use the local blob URL temporarily
        username: user?.username || auth.currentUser?.displayName || "user",
        description: fullCaption,
        likes: 0,
        comments: 0,
        musicName: selectedMusic ? `${selectedMusic.trackName} - ${selectedMusic.artistName}` : "Original Audio",
        avatarUrl: user?.avatarUrl || auth.currentUser?.photoURL || "https://picsum.photos/seed/me/100/100",
        timestamp: "Just now",
        isImage: !isVideo,
        userId: auth.currentUser?.uid || user?.id
      };
      
      // Add to local state immediately
      onAddReel(tempReel);
      
      // Show success to user
      setUploadProgress(100);
      setUploadStatus("SUCCESSFULLY SHARED! 🇮🇳");
      
      // Close the view after a short delay so they see the success message
      setTimeout(() => {
        onComplete();
      }, 800);

      // BACKGROUND TASKS: Link retrieval and Database save
      // We don't 'await' these so the function can finish and the UI can close
      (async () => {
        try {
          let finalVideoUrl = "";
          const fileId = isVideo 
            ? tgResult.result.video?.file_id 
            : tgResult.result.photo?.[tgResult.result.photo.length - 1]?.file_id;
          
          if (fileId) {
            const pathResp = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile?file_id=${fileId}`);
            const pathData = await pathResp.json();
            if (pathData.ok) {
              finalVideoUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${pathData.result.file_path}`;
            }
          }
          
          if (!finalVideoUrl) {
            // Fallback to preview if it's not a blob URL (unlikely here) or just skip
            if (!preview!.startsWith('blob:')) finalVideoUrl = preview!;
            else return; // Can't save blob URLs to DB
          }

          const newReelData = {
            videoUrl: finalVideoUrl, 
            username: user?.username || auth.currentUser?.displayName || "user",
            description: fullCaption,
            likes: 0,
            comments: 0,
            musicName: selectedMusic ? `${selectedMusic.trackName} - ${selectedMusic.artistName}` : "Original Audio",
            avatarUrl: user?.avatarUrl || auth.currentUser?.photoURL || "https://picsum.photos/seed/me/100/100",
            isImage: !isVideo,
            timestamp: "Just now",
            createdAt: Date.now(),
            userId: auth.currentUser?.uid || user?.id
          };

          await addDoc(collection(db, "reels"), newReelData);
          console.log("Background DB save successful");
        } catch (bgError) {
          console.error("Background upload tasks failed:", bgError);
        }
      })();

      return; // Exit the main function early
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(`Sharing failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderGallery = () => (
    <div className="flex-1 flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-4">
        <button onClick={onComplete}><X size={24} /></button>
        <span className="font-bold text-lg">New reel</span>
        <button><Settings size={24} /></button>
      </div>

      <div className="flex gap-2 px-4 mb-4">
        <button className="flex-1 bg-zinc-900 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
          <PlusSquare size={18} /> Drafts
        </button>
        <button className="flex-1 bg-zinc-900 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
          <LayoutTemplate size={18} /> Templates
        </button>
      </div>

      <div className="flex items-center justify-between px-4 mb-4">
        <button className="flex items-center gap-1 font-bold">
          Recents <ChevronDown size={16} />
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-zinc-900 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
        >
          <ImageIcon size={14} /> Select
        </button>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-[2px]">
        <button 
          onClick={() => setStep(2)}
          className="aspect-[3/4] bg-zinc-900 flex items-center justify-center"
        >
          <Camera size={32} className="text-zinc-500" />
        </button>
        {Array.from({ length: 11 }).map((_, i) => (
          <div 
            key={i} 
            className="aspect-[3/4] bg-zinc-800 relative group cursor-pointer"
            onClick={() => {
              setPreview(`https://picsum.photos/seed/reel${i}/600/800`);
              setFileType("image/jpeg");
              setStep(3);
            }}
          >
            <img src={`https://picsum.photos/seed/reel${i}/300/400`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            {i % 3 === 0 && <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/40 px-1 rounded">1:05</span>}
          </div>
        ))}
      </div>

      <div className="p-4 flex items-center justify-center gap-8 border-t border-zinc-900">
        <span className="text-sm font-bold text-white">REEL</span>
        <span className="text-sm font-bold text-zinc-500">TEMPLATES</span>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} accept="image/*,video/*" />
    </div>
  );

  const renderCamera = () => (
    <div className="flex-1 flex flex-col bg-black relative overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <button onClick={() => setStep(1)} className="text-white"><X size={28} /></button>
        <div className="flex items-center gap-6 text-white">
          <Zap size={24} />
          <div className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/10 text-xs font-bold">1x</div>
          <TimerIcon size={24} />
          <Settings size={24} />
        </div>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
        <button className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-xs font-bold text-white">
          <Music2 size={16} /> Add audio
        </button>
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-10 text-white">
        <div className="flex flex-col items-center gap-1">
          <Music2 size={24} />
          <span className="text-[10px] font-bold text-zinc-400">Audio</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Sparkles size={24} />
          <span className="text-[10px] font-bold text-zinc-400">Effects</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <User size={24} />
          <span className="text-[10px] font-bold text-zinc-400">Green screen</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Zap size={24} />
          <span className="text-[10px] font-bold text-zinc-400">Touch up</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">15</div>
          <span className="text-[10px] font-bold text-zinc-400">Length</span>
        </div>
      </div>

      <div className="flex-1 bg-black flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-20 left-0 right-0 px-8 flex items-center justify-between z-10">
        <div className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-zinc-800">
          <img src="https://picsum.photos/seed/prev/100/100" className="w-full h-full object-cover" />
        </div>
        
        <button 
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-20 h-20 rounded-full border-4 border-white p-1 transition-transform active:scale-110 ${isRecording ? 'bg-red-500' : ''}`}
        >
          <div className={`w-full h-full rounded-full ${isRecording ? 'bg-red-500' : 'bg-white'}`} />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
            <div className="w-6 h-6 rounded-full bg-blue-500" />
          </div>
          <button className="p-2 bg-zinc-900 rounded-full text-white"><RefreshCw size={20} /></button>
        </div>
      </div>

      <div className="p-4 flex items-center justify-center gap-8 border-t border-white/5 bg-black">
        <span className="text-sm font-bold text-white">REEL</span>
        <span className="text-sm font-bold text-zinc-500">TEMPLATES</span>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="flex-1 flex flex-col bg-black relative">
      <div className="absolute top-4 left-4 z-10">
        <button onClick={() => setStep(1)} className="bg-black/20 backdrop-blur-md p-2 rounded-full"><X size={24} /></button>
      </div>

      <div className="flex-1 relative">
        {fileType.startsWith("video") ? (
          <video src={preview!} className="w-full h-full object-cover" autoPlay loop muted crossOrigin="anonymous" />
        ) : (
          <img src={preview!} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-2">
          <ChevronDown className="rotate-180" size={20} />
          <span className="text-xs font-bold drop-shadow-md">Swipe up to edit</span>
        </div>
      </div>

      <div className="p-4 bg-black">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowMusicSearch(true)}
            className={`p-2 rounded-lg transition-colors ${selectedMusic ? "bg-green-500/20 text-green-500" : "bg-zinc-900 text-white"}`}
          >
            <Music2 size={24} />
          </button>
          <button className="p-2 bg-zinc-900 rounded-lg"><Type size={24} /></button>
          <button className="p-2 bg-zinc-900 rounded-lg"><Smile size={24} /></button>
          <button className="p-2 bg-zinc-900 rounded-lg"><Sparkles size={24} /></button>
          <button className="p-2 bg-zinc-900 rounded-lg"><Mic size={24} /></button>
          <button className="p-2 bg-zinc-900 rounded-lg"><Clapperboard size={24} /></button>
          <button className="p-2 bg-zinc-900 rounded-lg"><Link2 size={24} /></button>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-zinc-900 py-3 rounded-xl font-bold text-sm">Edit video</button>
          <button 
            onClick={() => setStep(4)}
            className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderShare = () => (
    <div className="flex-1 flex flex-col bg-white text-black">
      <div className="flex items-center px-4 py-4 border-b border-zinc-100">
        <button onClick={() => setStep(3)}><ArrowLeft size={24} /></button>
        <span className="flex-1 text-center font-bold text-lg">New reel</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col items-center gap-6">
          <div className="w-48 aspect-[3/4] rounded-3xl bg-zinc-100 overflow-hidden relative shadow-xl">
            {coverImage ? (
              <img src={coverImage} className="w-full h-full object-cover" />
            ) : fileType.startsWith("video") ? (
              <video src={preview!} className="w-full h-full object-cover" muted crossOrigin="anonymous" />
            ) : (
              <img src={preview!} className="w-full h-full object-cover" />
            )}
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 active:scale-95 transition-transform"
            >
              Edit cover
            </button>
            <input 
              type="file" 
              ref={coverInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setCoverImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </div>

          <textarea 
            placeholder="Write a caption and add hashtags..." 
            className="w-full text-sm focus:outline-none min-h-[100px] resize-none placeholder:text-zinc-400"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar mb-8">
          <button 
            onClick={() => setTags(prev => prev + " #reels #india")}
            className="whitespace-nowrap bg-zinc-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
          >
            <Hash size={14} /> Hashtags
          </button>
          <button className="whitespace-nowrap bg-zinc-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
            <Clapperboard size={14} /> Link a reel
          </button>
          <button className="whitespace-nowrap bg-zinc-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
            <FileText size={14} /> Poll
          </button>
          <button className="whitespace-nowrap bg-zinc-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
            <HelpCircle size={14} /> Prompt
          </button>
        </div>

        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
            <Tag size={18} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Add tags (e.g. funny, viral)" 
              className="bg-transparent flex-1 text-sm focus:outline-none"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-zinc-100">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
              <User size={24} className="text-zinc-700" />
              <span className="font-medium">Tag people</span>
            </div>
            <ChevronRight size={20} className="text-zinc-300" />
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
              <MapPin size={24} className="text-zinc-700" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Add location</span>
                <input 
                  type="text" 
                  placeholder="Where was this?" 
                  className="text-xs text-zinc-400 bg-transparent focus:outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-300" />
          </button>
        </div>

        <div className="p-4 mt-4">
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            People that you share this content with can see the location that you tag and view this content on the map.
          </p>
        </div>

        <div className="border-t border-zinc-100 mt-4">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-4">
              <Music2 size={24} className="text-zinc-700" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Rename audio</span>
                <span className="text-xs text-zinc-400">Original audio</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-300" />
          </button>
        </div>
      </div>

      <div className="p-4 flex gap-3 border-t border-zinc-100 bg-white sticky bottom-0">
        <button className="flex-1 bg-zinc-100 py-4 rounded-xl font-bold text-sm active:scale-95 transition-transform">Save Draft</button>
        <button 
          onClick={handleUpload}
          disabled={isUploading}
          className="flex-1 bg-blue-600 py-4 rounded-xl font-bold text-sm text-white disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-blue-500/20"
        >
          {isUploading ? "Sharing..." : "Share"}
        </button>
      </div>

      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-8 w-full max-w-xs flex flex-col items-center gap-6 shadow-2xl">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="#f4f4f5" strokeWidth="6" fill="transparent" />
                <circle
                  cx="40" cy="40" r="36" stroke="#2563eb" strokeWidth="6" fill="transparent"
                  strokeDasharray={226.2}
                  strokeDashoffset={226.2 - (226.2 * uploadProgress) / 100}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-bold text-black">{uploadProgress}%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-black">{uploadStatus}</span>
              <span className="text-[10px] text-zinc-400 font-mono">ELAPSED: {elapsedTime}</span>
            </div>
            
            {!uploadStatus.includes("SUCCESS") && (
              <button 
                onClick={() => setIsUploading(false)}
                className="mt-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
              >
                Cancel Upload
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      {step === 1 && renderGallery()}
      {step === 2 && renderCamera()}
      {step === 3 && renderPreview()}
      {step === 4 && renderShare()}

      {showMusicSearch && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
            <button onClick={() => setShowMusicSearch(false)}><X size={24} /></button>
            <span className="font-bold">Add Music</span>
            <div className="w-6" />
          </div>
          
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search for music..." 
                className="w-full bg-zinc-900 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none"
                value={musicQuery}
                onChange={(e) => {
                  setMusicQuery(e.target.value);
                  searchMusic(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 no-scrollbar">
            {isSearchingMusic ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {musicResults.map((track: any) => (
                  <button 
                    key={track.trackId}
                    onClick={() => {
                      setSelectedMusic(track);
                      setShowMusicSearch(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <img src={track.artworkUrl100} className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-bold truncate">{track.trackName}</p>
                      <p className="text-xs text-zinc-500 truncate">{track.artistName}</p>
                    </div>
                    {selectedMusic?.trackId === track.trackId && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MusicPlayerView = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const searchSongs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=30`);
      const data = await response.json();
      if (data.results.length === 0) {
        setError("No songs found for your search.");
      }
      setResults(data.results);
    } catch (err) {
      setError("Failed to fetch songs. Please check your internet connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121212] text-white overflow-hidden pt-16 pb-24">
      {/* Search Header */}
      <div className="p-4 bg-[#121212] sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-4">Search Music</h1>
        <form onSubmit={searchSongs} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
            className="w-full bg-zinc-800 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto px-4 no-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm">Searching iTunes...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <AlertCircle size={48} className="text-zinc-600 mb-4" />
            <p className="text-zinc-400 font-medium">{error}</p>
            <button 
              onClick={() => searchSongs()}
              className="mt-4 text-green-500 font-bold hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 gap-1 pb-10">
            {results.map((track: any) => (
              <button 
                key={track.trackId}
                onClick={() => playTrack(track)}
                className={`flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50 transition-colors group ${currentTrack?.trackId === track.trackId ? "bg-zinc-800" : ""}`}
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <img 
                    src={track.artworkUrl100} 
                    className="w-full h-full object-cover rounded shadow-lg" 
                    referrerPolicy="no-referrer"
                  />
                  {currentTrack?.trackId === track.trackId && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                      <div className="flex gap-0.5 items-end h-4">
                        <div className="w-1 bg-green-500 animate-[bounce_0.6s_infinite]" />
                        <div className="w-1 bg-green-500 animate-[bounce_0.8s_infinite]" />
                        <div className="w-1 bg-green-500 animate-[bounce_0.5s_infinite]" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className={`text-sm font-bold truncate ${currentTrack?.trackId === track.trackId ? "text-green-500" : "text-white"}`}>
                    {track.trackName}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{track.artistName}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={16} className="text-zinc-400" />
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
            <Music size={64} strokeWidth={1} />
            <p className="text-sm font-medium">Search for your favorite artists or songs</p>
          </div>
        )}
      </div>

      {/* Music Player Controller */}
      {currentTrack && (
        <div className="fixed bottom-16 left-0 right-0 bg-gradient-to-b from-zinc-900/95 to-black p-3 border-t border-white/5 backdrop-blur-xl z-30">
          <audio 
            ref={audioRef} 
            src={currentTrack.previewUrl} 
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            autoPlay
          />
          
          <div className="flex flex-col gap-2 max-w-screen-xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center gap-3 px-1">
              <span className="text-[10px] text-zinc-500 font-mono w-8">{formatTime(progress)}</span>
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                step="0.1"
                value={progress}
                onChange={handleSeek}
                className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-green-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <span className="text-[10px] text-zinc-500 font-mono w-8">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <img 
                  src={currentTrack.artworkUrl100} 
                  className="w-10 h-10 rounded shadow-md" 
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold truncate text-white">{currentTrack.trackName}</span>
                  <span className="text-[10px] text-zinc-400 truncate">{currentTrack.artistName}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 px-4">
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <SkipBack size={20} fill="currentColor" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black active:scale-90 transition-transform shadow-lg"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                </button>
                <button className="text-zinc-400 hover:text-white transition-colors">
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
                <Volume2 size={16} className="text-zinc-400" />
                <div className="w-20 h-1 bg-zinc-800 rounded-full">
                  <div className="w-2/3 h-full bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditProfileView = ({ user, onSave, onBack }: { user: any; onSave: (data: any) => void; onBack: () => void }) => {
  const [data, setData] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    bio: user?.bio || "Digital Creator ✨\nBuilding the future of Indian Reels 🇮🇳",
    avatarUrl: user?.avatarUrl || ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onSave(data);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
        <button onClick={onBack} className="text-sm" disabled={isUpdating}>Cancel</button>
        <span className="font-bold">Edit Profile</span>
        <button onClick={handleSave} className="text-sm font-bold text-blue-500" disabled={isUpdating}>
          {isUpdating ? "Saving..." : "Done"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF9933] via-[#FFFFFF] to-[#138808]">
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                <img src={data.avatarUrl || "https://picsum.photos/seed/me/100/100"} className="w-full h-full object-cover" />
              </div>
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera size={24} />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <button className="text-blue-500 text-xs font-bold mt-2">Change profile photo</button>
        </div>

        <div className="w-full space-y-6">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 px-1">Name</label>
            <input 
              type="text" 
              className="w-full bg-transparent border-b border-zinc-800 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={data.fullName}
              onChange={(e) => setData({...data, fullName: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 px-1">Username</label>
            <input 
              type="text" 
              className="w-full bg-transparent border-b border-zinc-800 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={data.username}
              onChange={(e) => setData({...data, username: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500 px-1">Bio</label>
            <textarea 
              className="w-full bg-transparent border-b border-zinc-800 py-2 focus:outline-none focus:border-blue-500 transition-colors resize-none h-20"
              value={data.bio}
              onChange={(e) => setData({...data, bio: e.target.value})}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) => {
  const [toggles, setToggles] = useState({
    notifications: true,
    private: false,
    security: true
  });

  const settings = [
    { icon: <Bell size={20} />, label: "Notifications", toggle: "notifications" },
    { icon: <Lock size={20} />, label: "Private Account", toggle: "private" },
    { icon: <Shield size={20} />, label: "Two-Factor Auth", toggle: "security" },
    { icon: <User size={20} />, label: "Account Status" },
    { icon: <Settings size={20} />, label: "Help Center" },
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col">
      <div className="flex items-center px-4 py-4 border-b border-zinc-800 gap-4">
        <button onClick={onBack}><ArrowLeft size={24} /></button>
        <span className="font-bold text-lg">Settings and privacy</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <div className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4">
            <Search size={20} className="text-zinc-500" />
            <input type="text" placeholder="Search settings" className="bg-transparent flex-1 focus:outline-none" />
          </div>
        </div>

        <div className="space-y-1">
          {settings.map((s, i) => (
            <div key={i} className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-900 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <span className="text-zinc-300">{s.icon}</span>
                <span className="text-sm font-medium">{s.label}</span>
              </div>
              {s.toggle && (
                <button 
                  onClick={() => setToggles({...toggles, [s.toggle as keyof typeof toggles]: !toggles[s.toggle as keyof typeof toggles]})}
                  className={`w-10 h-6 rounded-full transition-colors relative ${toggles[s.toggle as keyof typeof toggles] ? "bg-blue-600" : "bg-zinc-700"}`}
                >
                  <motion.div 
                    animate={{ x: toggles[s.toggle as keyof typeof toggles] ? 18 : 2 }}
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                  />
                </button>
              )}
            </div>
          ))}
          <div className="h-[1px] bg-zinc-800 my-4 mx-6" />
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-zinc-900 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileView = ({ user, reels, onLogout, onUpdateUser, onReelClick, isMe, isFollowing, onFollow, onUnfollow }: { 
  user: any; 
  reels: Reel[]; 
  onLogout: () => void; 
  onUpdateUser: (data: any) => void; 
  onReelClick: (reelId: string) => void;
  isMe: boolean;
  isFollowing?: boolean;
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  const userReels = reels.filter(r => r.userId === user?.id || r.username === user?.username || r.userId === user?.uid);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pt-16">
      {showSettings && <SettingsView onBack={() => setShowSettings(false)} onLogout={onLogout} />}
      {showEdit && (
        <EditProfileView 
          user={user} 
          onBack={() => setShowEdit(false)} 
          onSave={(data) => {
            onUpdateUser(data);
            setShowEdit(false);
          }} 
        />
      )}
      
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={14} />
          <span className="font-bold">{user?.username || "username"}</span>
        </div>
        <div className="flex items-center gap-6">
          <PlusSquare size={24} />
          {isMe && <button onClick={() => setShowSettings(true)}><Settings size={24} /></button>}
        </div>
      </div>

      <div className="px-4 py-4 flex items-center gap-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#FF9933] via-[#FFFFFF] to-[#138808]">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden">
              <img src={user?.avatarUrl || "https://picsum.photos/seed/me/100/100"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          {isMe && (
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-black p-0.5">
              <PlusSquare size={14} className="text-white fill-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 flex justify-around">
          <div className="flex flex-col items-center">
            <span className="font-bold">{userReels.length}</span>
            <span className="text-xs text-zinc-400">Posts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">{user?.followersCount || 0}</span>
            <span className="text-xs text-zinc-400">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold">{user?.followingCount || 0}</span>
            <span className="text-xs text-zinc-400">Following</span>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <p className="text-sm font-bold">{user?.fullName || "Jeet Developing"}</p>
        <p className="text-sm text-zinc-300 whitespace-pre-line">{user?.bio || "Digital Creator ✨\nBuilding the future of Indian Reels 🇮🇳"}</p>
        {user?.email && <p className="text-[10px] text-zinc-500 mt-1 font-mono">{user.email}</p>}
      </div>

      <div className="px-4 flex gap-2 mb-8">
        {isMe ? (
          <>
            <button onClick={() => setShowEdit(true)} className="flex-1 bg-zinc-900 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform">Edit Profile</button>
            <button className="flex-1 bg-zinc-900 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform">Share Profile</button>
          </>
        ) : (
          <>
            <button 
              onClick={() => isFollowing ? onUnfollow?.(user.id) : onFollow?.(user.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform ${isFollowing ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"}`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
            <button className="flex-1 bg-zinc-900 py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform">Message</button>
          </>
        )}
      </div>

      <div className="flex border-t border-zinc-900">
        <button className="flex-1 py-3 flex justify-center border-b-2 border-white"><Grid size={24} /></button>
        <button className="flex-1 py-3 flex justify-center text-zinc-500"><Clapperboard size={24} /></button>
        <button className="flex-1 py-3 flex justify-center text-zinc-500"><User size={24} /></button>
      </div>

      <div className="grid grid-cols-3 gap-[1px]">
        {userReels.map((reel) => (
          <div 
            key={reel.id} 
            onClick={() => onReelClick(reel.id)}
            className="aspect-square bg-zinc-800 relative group cursor-pointer"
          >
            {reel.isImage ? (
              <img src={reel.videoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <video src={reel.videoUrl} className="w-full h-full object-cover" />
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Play size={14} className="text-white fill-white" />
            </div>
          </div>
        ))}
        {userReels.length === 0 && (
          <div className="col-span-3 py-20 flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Clapperboard size={48} strokeWidth={1} />
            <p className="text-sm">No reels yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AuthView = ({ onLogin }: { onLogin: (userData: any) => void }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    fullName: "",
    username: "",
    email: "",
    profilePic: ""
  });
  const [previewPic, setPreviewPic] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPic(reader.result as string);
        setFormData({ ...formData, profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Force account selection to help with some popup issues
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        onLogin({
          id: result.user.uid,
          username: result.user.displayName || result.user.email?.split('@')[0] || "user",
          avatarUrl: result.user.photoURL || "https://picsum.photos/seed/me/100/100",
          fullName: result.user.displayName || "",
          email: result.user.email || ""
        });
      }
    } catch (error: any) {
      console.error("Google sign in error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Popup was blocked by your browser. Please allow popups for this site to log in with Google. 🇮🇳");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, ignore
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        alert("An account already exists with this email. Please log in using your email and password instead. 🇮🇳");
      } else {
        alert("Google Login failed: " + (error.message || "Please try again."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === "signup") {
        // Check if username already exists
        const q = query(collection(db, "users"), where("username", "==", formData.username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          alert("Username already taken! Please choose another one. 🇮🇳");
          setIsSubmitting(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: formData.fullName,
          photoURL: previewPic || "https://picsum.photos/seed/me/100/100"
        });

        // Save extra details to Firestore
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          avatarUrl: previewPic || "https://picsum.photos/seed/me/100/100",
          bio: "Digital Creator ✨\nBuilding the future of Indian Reels 🇮🇳",
          createdAt: serverTimestamp()
        });

        // Sign out to allow the user to "click login" as requested
        await signOut(auth);

        setFormData(prev => ({
          ...prev,
          identifier: formData.email,
          password: formData.password // Pre-fill password as well
        }));
        
        setMode("login");
        alert("Signup successful! Your details are pre-filled. Click 'Log in' to enter. 🇮🇳");
      } else {
        const email = formData.identifier.includes("@") ? formData.identifier : `${formData.identifier}@example.com`;
        await signInWithEmailAndPassword(auth, email, formData.password);
      }
    } catch (error: any) {
      alert(error.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col bg-black overflow-y-auto no-scrollbar"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 min-h-full">
        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="mb-10 flex flex-col items-center gap-2">
            <IndianReelsLogo className="w-16 h-16 mb-2" />
            <h1 className="text-4xl font-display italic font-bold tracking-tight text-white">
              INDIANREELS
            </h1>
          </div>

          {mode === "login" && (
            <div className="w-full mb-6">
              <button 
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" />
                Continue with Google
              </button>
              <div className="flex items-center gap-4 my-6">
                <div className="h-[1px] bg-zinc-800 flex-1" />
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">or</span>
                <div className="h-[1px] bg-zinc-800 flex-1" />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div className="mb-8 flex flex-col items-center">
              <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#FF9933] via-[#FFFFFF] to-[#138808] shadow-[0_0_20px_rgba(255,153,51,0.3)]">
                <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-zinc-900 flex items-center justify-center">
                  {previewPic ? (
                    <img src={previewPic} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-zinc-700" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-blue-500 rounded-full border-2 border-black p-1 shadow-lg">
                  <PlusSquare size={16} className="text-white fill-white" />
                </div>
              </div>
              <span className="text-blue-500 text-xs font-semibold mt-3">Add Profile Picture</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            {mode === "signup" ? (
              <>
                <input 
                  type="text" 
                  placeholder="Email" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors text-white"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors text-white"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Username" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors text-white"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </>
            ) : (
              <input 
                type="text" 
                placeholder="Phone number, username, or email" 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors text-white"
                required
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            )}
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3.5 text-sm focus:outline-none focus:border-zinc-600 transition-colors text-white"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg mt-2 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                mode === "login" ? "Log in" : "Sign up"
              )}
            </button>
          </form>

          {mode === "login" && (
            <button className="text-zinc-500 text-xs mt-6 hover:text-zinc-300 transition-colors">Forgot password?</button>
          )}

          <div className="mt-auto pt-10 pb-4 flex flex-col items-center gap-4 w-full">
            <div className="h-[1px] bg-zinc-800 w-full" />
            <p className="text-sm text-zinc-400">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-blue-500 font-bold ml-2"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("reels");
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [viewedUser, setViewedUser] = useState<any | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReels();
    fetchStories();
    checkUser();
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      fetchFollowing();
    }
  }, [user]);

  const fetchFollowing = async () => {
    try {
      const q = query(collection(db, "follows"), where("followerId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const ids = new Set(querySnapshot.docs.map(doc => doc.data().followingId));
      setFollowingIds(ids);
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "follows"), {
        followerId: user.id,
        followingId: targetUserId,
        createdAt: serverTimestamp()
      });
      
      // Update counts
      const targetUserQuery = query(collection(db, "users"), where("uid", "==", targetUserId));
      const targetUserSnap = await getDocs(targetUserQuery);
      if (!targetUserSnap.empty) {
        await updateDoc(doc(db, "users", targetUserSnap.docs[0].id), {
          followersCount: increment(1)
        });
      }

      const currentUserQuery = query(collection(db, "users"), where("uid", "==", user.id));
      const currentUserSnap = await getDocs(currentUserQuery);
      if (!currentUserSnap.empty) {
        await updateDoc(doc(db, "users", currentUserSnap.docs[0].id), {
          followingCount: increment(1)
        });
      }

      setFollowingIds(prev => new Set(prev).add(targetUserId));
      
      if (viewedUser && viewedUser.id === targetUserId) {
        setViewedUser({ ...viewedUser, followersCount: (viewedUser.followersCount || 0) + 1 });
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    if (!user) return;
    try {
      const q = query(collection(db, "follows"), 
        where("followerId", "==", user.id), 
        where("followingId", "==", targetUserId)
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, "follows", d.id));
      }
      
      // Update counts
      const targetUserQuery = query(collection(db, "users"), where("uid", "==", targetUserId));
      const targetUserSnap = await getDocs(targetUserQuery);
      if (!targetUserSnap.empty) {
        await updateDoc(doc(db, "users", targetUserSnap.docs[0].id), {
          followersCount: increment(-1)
        });
      }

      const currentUserQuery = query(collection(db, "users"), where("uid", "==", user.id));
      const currentUserSnap = await getDocs(currentUserQuery);
      if (!currentUserSnap.empty) {
        await updateDoc(doc(db, "users", currentUserSnap.docs[0].id), {
          followingCount: increment(-1)
        });
      }

      setFollowingIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });

      if (viewedUser && viewedUser.id === targetUserId) {
        setViewedUser({ ...viewedUser, followersCount: Math.max(0, (viewedUser.followersCount || 0) - 1) });
      }
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  const handleViewProfile = async (username: string) => {
    if (user && username === user.username) {
      setViewedUser(null);
      setActiveTab("profile");
      return;
    }

    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setViewedUser({
          id: userData.uid,
          username: userData.username,
          avatarUrl: userData.avatarUrl || "https://picsum.photos/seed/me/100/100",
          fullName: userData.fullName,
          bio: userData.bio,
          followersCount: userData.followersCount || 0,
          followingCount: userData.followingCount || 0
        });
        setActiveTab("profile");
      }
    } catch (err) {
      console.error("Error viewing profile:", err);
    }
  };

  const fetchStories = async () => {
    try {
      const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedStories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(fetchedStories);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const checkUser = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to fetch extra details from Firestore
        try {
          const q = query(collection(db, "users"), where("uid", "==", firebaseUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUser({
              id: firebaseUser.uid,
              username: userData.username || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "user",
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || "https://picsum.photos/seed/me/100/100",
              fullName: userData.fullName || firebaseUser.displayName || "",
              email: userData.email || firebaseUser.email || "",
              bio: userData.bio || "Digital Creator ✨\nBuilding the future of Indian Reels 🇮🇳"
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "user",
              avatarUrl: firebaseUser.photoURL || "https://picsum.photos/seed/me/100/100",
              fullName: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              bio: "Digital Creator ✨\nBuilding the future of Indian Reels 🇮🇳"
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUser({
            id: firebaseUser.uid,
            username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "user",
            avatarUrl: firebaseUser.photoURL || "https://picsum.photos/seed/me/100/100",
            fullName: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            bio: "Digital Creator ✨\nBuilding the future of Indian Reels 🇮🇳"
          });
        }
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthChecked(true);
    });
  };

  const fetchReels = async () => {
    try {
      const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const formattedReels: Reel[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            videoUrl: data.videoUrl,
            username: data.username,
            description: data.description,
            likes: data.likes,
            comments: data.comments,
            musicName: data.musicName,
            avatarUrl: data.avatarUrl,
            isImage: data.isImage,
            timestamp: data.timestamp,
            userId: data.userId
          };
        });
        setReels(formattedReels);
      } else {
        setReels(MOCK_REELS);
      }
    } catch (err: any) {
      console.error("Firebase Connection Error:", err);
      setReels(MOCK_REELS);
    }
  };

  const handleAddReel = (newReel: Reel) => {
    setReels(prev => [newReel, ...prev]);
    setActiveTab("reels");
    setCurrentReelIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const mockComments = [
    { username: "rahul_v", text: "Amazing work bhai! 🔥", time: "2h", avatar: "https://picsum.photos/seed/user4/100/100" },
    { username: "priya.s", text: "Love the vibes! ✨", time: "1h", avatar: "https://picsum.photos/seed/user5/100/100" },
    { username: "amit_99", text: "Keep growing! 🚀", time: "30m", avatar: "https://picsum.photos/seed/user6/100/100" },
  ];

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      setCurrentReelIndex(index);
    }
  };

  const handleUpdateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      let finalAvatarUrl = data.avatarUrl;

      // If avatarUrl is a base64 string, it will be too long for Firebase Auth
      if (data.avatarUrl && data.avatarUrl.startsWith('data:image')) {
        try {
          const base64Data = data.avatarUrl.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });

          const tgFormData = new FormData();
          tgFormData.append("chat_id", TG_CHAT_ID);
          tgFormData.append("photo", blob);
          tgFormData.append("caption", `👤 Profile Photo Update: @${data.username}`);

          const tgResp = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            body: tgFormData
          });
          const tgData = await tgResp.json();

          if (tgData.ok) {
            const fileId = tgData.result.photo[tgData.result.photo.length - 1].file_id;
            const pathResp = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getFile?file_id=${fileId}`);
            const pathData = await pathResp.json();
            if (pathData.ok) {
              finalAvatarUrl = `https://api.telegram.org/file/bot${TG_BOT_TOKEN}/${pathData.result.file_path}`;
            }
          }
        } catch (e) {
          console.error("Telegram avatar upload failed:", e);
        }
      }

      // 1. Update Firestore
      const q = query(collection(db, "users"), where("uid", "==", user.id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          username: data.username,
          fullName: data.fullName,
          bio: data.bio,
          avatarUrl: finalAvatarUrl,
          updatedAt: serverTimestamp()
        });
      }

      // 2. Update Firebase Auth
      const authUpdate: any = { displayName: data.fullName };
      // Firebase photoURL limit is ~2048 chars. Base64 is usually much longer.
      if (finalAvatarUrl && finalAvatarUrl.length < 2000) {
        authUpdate.photoURL = finalAvatarUrl;
      }

      await updateProfile(auth.currentUser!, authUpdate);

      // 3. Send to Telegram
      const message = `👤 *Profile Updated on INDIANREELS*\n\n` +
                      `🆔 User ID: ${user.id}\n` +
                      `📛 New Name: ${data.fullName}\n` +
                      `🔗 New Username: @${data.username}\n` +
                      `📝 New Bio: ${data.bio}`;
      
      const formData = new FormData();
      formData.append("chat_id", TG_CHAT_ID);
      formData.append("text", message);
      formData.append("parse_mode", "Markdown");
      
      fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        body: formData
      }).catch(err => console.error("Telegram notify failed:", err));

      // 4. Update local state
      setUser({ ...user, ...data, avatarUrl: finalAvatarUrl });
      
      // 5. Refresh reels to reflect new username/avatar if needed
      fetchReels();
      
      alert("Profile updated successfully! 🇮🇳✨");
    } catch (error: any) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile: " + error.message);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      setActiveTab("home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLikeReel = (id: string, inc: number) => {
    setReels(prev => prev.map(r => r.id === id ? { ...r, likes: (typeof r.likes === 'number' ? r.likes : 0) + inc } : r));
  };

  return (
    <div className="h-screen w-screen bg-black text-white font-sans flex flex-col">
      <AnimatePresence>
        {(!isAuthChecked || loading) && <LoadingScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <CommentModal 
        isOpen={showComments} 
        onClose={() => {
          setShowComments(false);
          setSelectedReelId(null);
        }} 
        reelId={selectedReelId || ""} 
        user={user}
      />

      {showStoryCreator && (
        <CreateStoryView 
          user={user} 
          onComplete={() => {
            setShowStoryCreator(false);
            fetchStories();
          }} 
        />
      )}

      {selectedStory && (
        <StoryDetailView 
          story={selectedStory} 
          user={user} 
          onClose={() => setSelectedStory(null)} 
          onUpdate={() => {
            fetchStories();
            setSelectedStory(null);
          }}
        />
      )}

      {!loading && isAuthChecked && !isAuthenticated && (
        <AuthView onLogin={handleLogin} />
      )}

      {!loading && isAuthChecked && isAuthenticated && (
        <>
          {/* Top Bar */}
          <div className={`absolute top-0 left-0 right-0 z-20 px-4 py-4 flex justify-between items-center transition-colors duration-300 ${activeTab === "reels" ? "bg-gradient-to-b from-black/50 to-transparent border-none" : "bg-black border-b border-white/5"}`}>
            <div className="flex items-center gap-2">
              <PersonalLogo className="w-8 h-8" />
              <h1 className="text-2xl font-display italic font-bold tracking-tight">
                INDIANREELS
              </h1>
            </div>
            <div className="flex items-center gap-6">
               <PlusSquare size={24} />
               <Heart size={24} />
               <MessageCircle size={24} onClick={() => setShowComments(true)} className="cursor-pointer" />
            </div>
          </div>

          {activeTab === "reels" ? (
            <main 
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
            >
              {reels.map((reel, index) => (
                <ReelItem 
                  key={reel.id} 
                  reel={reel} 
                  isActive={currentReelIndex === index} 
                  onCommentClick={() => {
                    setSelectedReelId(reel.id);
                    setShowComments(true);
                  }}
                  onLike={handleLikeReel}
                  onViewProfile={handleViewProfile}
                  isFollowing={followingIds.has(reel.userId)}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  currentUser={user}
                />
              ))}
            </main>
          ) : activeTab === "home" ? (
            <HomeView 
              user={user} 
              stories={stories} 
              onAddStory={() => setShowStoryCreator(true)} 
              onStoryClick={(story) => setSelectedStory(story)}
              reels={reels}
              onLike={handleLikeReel}
              onViewProfile={handleViewProfile}
            />
          ) : activeTab === "search" ? (
            <SearchView />
          ) : activeTab === "music" ? (
            <MusicPlayerView />
          ) : activeTab === "profile" ? (
            <ProfileView 
              user={viewedUser || user} 
              reels={reels}
              onLogout={handleLogout} 
              onUpdateUser={handleUpdateProfile}
              onReelClick={(reelId) => {
                const globalIndex = reels.findIndex(r => r.id === reelId);
                if (globalIndex !== -1) {
                  setCurrentReelIndex(globalIndex);
                  setActiveTab("reels");
                }
              }}
              isMe={!viewedUser}
              isFollowing={viewedUser ? followingIds.has(viewedUser.id) : false}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          ) : activeTab === "plus" ? (
            <CreatePostView user={user} onComplete={() => setActiveTab("reels")} onAddReel={handleAddReel} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {activeTab.toUpperCase()} View Coming Soon
            </div>
          )}

          {/* Bottom Navigation */}
          <nav className="h-16 border-t border-white/10 bg-black flex items-center justify-around px-2 z-20">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("home")}
              className={`${activeTab === "home" ? "text-white" : "text-gray-500"}`}
            >
              <Home size={28} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("search")}
              className={`${activeTab === "search" ? "text-white" : "text-gray-500"}`}
            >
              <Search size={28} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("music")}
              className={`${activeTab === "music" ? "text-white" : "text-gray-500"}`}
            >
              <Music size={28} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("reels")}
              className={`${activeTab === "reels" ? "text-white" : "text-gray-500"}`}
            >
              <Clapperboard size={28} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("plus")}
              className={`${activeTab === "plus" ? "text-white" : "text-gray-500"}`}
            >
              <PlusSquare size={28} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab("profile")}
              className={`${activeTab === "profile" ? "text-white" : "text-gray-500"}`}
            >
              <div className={`w-7 h-7 rounded-full border-2 ${activeTab === "profile" ? "border-white" : "border-transparent"} overflow-hidden`}>
                <img src={user?.avatarUrl || "https://picsum.photos/seed/me/100/100"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </motion.button>
          </nav>
        </>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
