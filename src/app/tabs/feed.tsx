// Force rebuild for text post layout
import { PostCard } from "@/components/post";
import { Avatar, GlassCard } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PostService } from "@/services/post.service";
import { Post as ApiPost } from "@/types/post.types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.md * 2;
const IMAGE_WIDTH = CARD_WIDTH - Spacing.md * 2;

interface Post extends ApiPost {
    isBookmarked?: boolean;
}

interface Story {
    id: string;
    user: {
        id: string;
        username: string;
        avatar: string;
    };
    hasUnseenStory: boolean;
}

const mockStories: Story[] = [
    {
        id: "my",
        user: { id: "me", username: "Your Story", avatar: "https://i.pravatar.cc/150?img=8" },
        hasUnseenStory: false,
    },
    {
        id: "1",
        user: { id: "1", username: "sarah", avatar: "https://i.pravatar.cc/150?img=1" },
        hasUnseenStory: true,
    },
    {
        id: "2",
        user: { id: "2", username: "mike", avatar: "https://i.pravatar.cc/150?img=2" },
        hasUnseenStory: true,
    },
    {
        id: "3",
        user: { id: "3", username: "emma", avatar: "https://i.pravatar.cc/150?img=3" },
        hasUnseenStory: false,
    },
    {
        id: "4",
        user: { id: "4", username: "john", avatar: "https://i.pravatar.cc/150?img=4" },
        hasUnseenStory: true,
    },
    {
        id: "5",
        user: { id: "5", username: "lisa", avatar: "https://i.pravatar.cc/150?img=5" },
        hasUnseenStory: true,
    },
];

const mockPosts: Post[] = [
    {
        id: "1",
        user_id: "1",
        content: "Beautiful sunset at the beach today! Nature never fails to amaze me.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        like_count: 1234,
        comment_count: 56,
        share_count: 12,
        has_liked: false,
        user: {
            id: "1",
            username: "sarah_wilson",
            name: "Sarah Wilson",
            avatar_url: "https://i.pravatar.cc/150?img=1",
            has_story: false,
        },
        post_media: [
            {
                id: "m1",
                media_url: "https://picsum.photos/600/600?random=50",
                media_type: "image",
                order: 0,
            }
        ],
        original_post: null,
        isBookmarked: false,
    },
    {
        id: "2",
        user_id: "2",
        content: "Mountain hiking is the best therapy! Who else agrees?",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        like_count: 892,
        comment_count: 34,
        share_count: 5,
        has_liked: true,
        user: {
            id: "2",
            username: "mike_adventures",
            name: "Mike Adventures",
            avatar_url: "https://i.pravatar.cc/150?img=2",
            has_story: false,
        },
        post_media: [
            {
                id: "m2",
                media_url: "https://picsum.photos/600/600?random=51",
                media_type: "image",
                order: 0,
            },
            {
                id: "m3",
                media_url: "https://picsum.photos/600/600?random=52",
                media_type: "image",
                order: 1,
            }
        ],
        original_post: null,
        isBookmarked: true,
    },
    {
        id: "3",
        user_id: "3",
        content: "Homemade pasta from scratch! Recipe coming soon on my blog.",
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        like_count: 2567,
        comment_count: 123,
        share_count: 22,
        has_liked: false,
        user: {
            id: "3",
            username: "foodie_emma",
            name: "Foodie Emma",
            avatar_url: "https://i.pravatar.cc/150?img=3",
            has_story: true,
        },
        post_media: [
            {
                id: "m4",
                media_url: "https://picsum.photos/600/600?random=53",
                media_type: "image",
                order: 0,
            }
        ],
        original_post: null,
        isBookmarked: false,
    },
    {
        id: "4",
        user_id: "4",
        content: "Paris is always a good idea. The city of lights never disappoints!",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        like_count: 4521,
        comment_count: 234,
        share_count: 44,
        has_liked: false,
        user: {
            id: "4",
            username: "travel_john",
            name: "Travel John",
            avatar_url: "https://i.pravatar.cc/150?img=4",
            has_story: false,
        },
        post_media: [
            {
                id: "m5",
                media_url: "https://picsum.photos/600/600?random=54",
                media_type: "image",
                order: 0,
            },
            {
                id: "m6",
                media_url: "https://picsum.photos/600/600?random=55",
                media_type: "image",
                order: 1,
            },
            {
                id: "m7",
                media_url: "https://picsum.photos/600/600?random=56",
                media_type: "image",
                order: 2,
            }
        ],
        original_post: null,
        isBookmarked: false,
    },
];

export default function FeedScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);


    const { user } = useAuthStore();

    const fetchPosts = useCallback(async () => {
        try {
            const response = await PostService.getFeed();
            if (response.success && response.data) {
                setPosts(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch feed posts:", error);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const handleLike = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        has_liked: !post.has_liked,
                        like_count: post.has_liked ? post.like_count - 1 : post.like_count + 1,
                    }
                    : post
            )
        );
    };

    const handleBookmark = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId
                    ? { ...post, isBookmarked: !post.isBookmarked }
                    : post
            )
        );
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    }, [fetchPosts]);

    const renderHeaderComponents = () => {
        return (
            <View style={styles.listHeaderContainer}>
                {/* 1. Stories Island (Glass Island Style) */}
                <View style={styles.cardContainer}>
                    <GlassCard noPadding intensity="strong" style={styles.postCard}>
                        <View style={styles.storiesRow}>
                            <TouchableOpacity style={styles.addStoryBtn} activeOpacity={0.8}>
                                <View style={styles.addStoryBox}>
                                    <Ionicons name="add" size={28} color={Colors.text.primary} />
                                    <Text style={styles.addStoryText}>Thêm</Text>
                                </View>
                                <Text style={styles.addStoryLabel}>Tin của bạn</Text>
                            </TouchableOpacity>
                            <View style={styles.noStoriesContainer}>
                                <Text style={styles.noStoriesText}>Không có tin nào</Text>
                            </View>
                        </View>
                    </GlassCard>
                </View>

                {/* 2. Create Post Card */}
                <View style={styles.cardContainer}>
                    <GlassCard noPadding intensity="strong" style={styles.postCard}>
                        <View style={styles.createPostContent}>
                            <View style={styles.createPostRow}>
                                <Avatar
                                    source={user?.avatar || undefined}
                                    name={user?.fullName || user?.username}
                                    size="md"
                                />
                                <TouchableOpacity
                                    style={styles.createPostInputButton}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.createPostInputText}>Bạn đang nghĩ gì?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.createPostDivider} />
                            <View style={styles.createPostActionsRow}>
                                <TouchableOpacity style={styles.createPostActionButton} activeOpacity={0.8}>
                                    <Ionicons name="image-outline" size={18} color={Colors.text.primary} />
                                    <Text style={styles.createPostActionText}>Ảnh</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.publishPostBtn} activeOpacity={0.8}>
                                    <Text style={styles.publishPostBtnText}>Đăng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </GlassCard>
                </View>
            </View>
        );
    };

    const renderPost = ({ item }: { item: Post }) => {
        return (
            <PostCard
                item={item}
                onLike={handleLike}
                onBookmark={handleBookmark}
            />
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Lumi</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons
                                name="search-outline"
                                size={22}
                                color={Colors.text.primary}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons
                                name="menu-outline"
                                size={24}
                                color={Colors.text.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Feed */}
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.feedContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.brand.primary}
                        />
                    }
                    ListHeaderComponent={renderHeaderComponents}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    feedContent: {
        paddingBottom: Spacing.xl * 2,
    },
    headerTitle: {
        fontSize: FontSize["2xl"],
        fontWeight: "bold",
        fontStyle: "italic",
        color: Colors.text.primary,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    headerButton: {
        padding: Spacing.xs,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
    },
    listHeaderContainer: {
        paddingTop: Spacing.sm,
    },
    cardContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    postCard: {
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Khớp với bg-white/6 của web
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.28)", // Tăng độ đục để viền rõ nét hơn
        borderRadius: 16,
        overflow: "hidden",
    },
    storiesRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.md,
    },
    addStoryBtn: {
        alignItems: "center",
        marginRight: Spacing.lg,
    },
    addStoryBox: {
        width: 80,
        height: 100,
        borderRadius: BorderRadius.md,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.xs,
    },
    addStoryText: {
        fontSize: FontSize.sm,
        fontWeight: "600",
        color: Colors.text.primary,
        marginTop: Spacing.xs,
    },
    addStoryLabel: {
        fontSize: FontSize.xs,
        color: Colors.text.secondary,
        fontWeight: "500",
    },
    noStoriesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: 100,
    },
    noStoriesText: {
        fontSize: FontSize.sm,
        color: Colors.text.muted,
    },
    createPostContent: {
        padding: Spacing.md,
    },
    createPostRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
    },
    createPostInputButton: {
        flex: 1,
        height: 40,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        borderRadius: 20,
        justifyContent: "center",
        paddingHorizontal: Spacing.md,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    createPostInputText: {
        color: Colors.text.muted,
        fontSize: FontSize.sm,
    },
    createPostDivider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        marginVertical: Spacing.md,
    },
    createPostActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    createPostActionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },
    createPostActionText: {
        color: Colors.text.primary,
        fontSize: FontSize.sm,
        fontWeight: "500",
    },
    publishPostBtn: {
        backgroundColor: Colors.brand.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        borderRadius: 16,
    },
    publishPostBtnText: {
        color: Colors.dark.background,
        fontWeight: "600",
        fontSize: FontSize.sm,
    },
});