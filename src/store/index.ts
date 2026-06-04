import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { secureStorage } from "../services/secureStore";
import { clearTokens } from "../services/axiosInstance";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  fullName?: string;
  bio?: string;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "video" | "audio";
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: Date;
  viewedBy: string[];
  duration?: number;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  mediaUrls?: string[];
  likes: string[];
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  content: string;
  createdAt: Date;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await secureStorage.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await secureStorage.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await secureStorage.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => {
        clearTokens().catch((err) => console.error("Failed to clear tokens on logout:", err));
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("An error occurred during hydration", error);
          } else if (state) {
            state.setLoading(false);
          }
        };
      },
    }
  )
);

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
}));

interface StoryState {
  stories: Story[];
  currentStoryIndex: number;
  setStories: (stories: Story[]) => void;
  setCurrentStoryIndex: (index: number) => void;
  nextStory: () => void;
  prevStory: () => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  currentStoryIndex: 0,
  setStories: (stories) => set({ stories }),
  setCurrentStoryIndex: (index) => set({ currentStoryIndex: index }),
  nextStory: () =>
    set((state) => ({
      currentStoryIndex: Math.min(
        state.currentStoryIndex + 1,
        state.stories.length - 1
      ),
    })),
  prevStory: () =>
    set((state) => ({
      currentStoryIndex: Math.max(state.currentStoryIndex - 1, 0),
    })),
}));

interface FeedState {
  posts: Post[];
  isRefreshing: boolean;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  likePost: (postId: string, userId: string) => void;
  setRefreshing: (refreshing: boolean) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  isRefreshing: false,
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  likePost: (postId, userId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.likes.includes(userId)
                ? post.likes.filter((id) => id !== userId)
                : [...post.likes, userId],
            }
          : post
      ),
    })),
  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
}));