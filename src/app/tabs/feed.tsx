// Force rebuild for text post layout
import { CommentsModal, LikesModal, PostCard, CreatePostModal } from "@/components/post";
import { Avatar, GlassButton, GlassCard } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { PostService } from "@/services/post.service";
import { Post as ApiPost } from "@/types/post.types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.md * 2;
const IMAGE_WIDTH = CARD_WIDTH - Spacing.md * 2;

const PostCardSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const sharedAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.7,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        sharedAnimation.start();
        return () => sharedAnimation.stop();
    }, [pulseAnim]);

    return (
        <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]}>
            {/* Header */}
            <View style={styles.skeletonHeader}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonHeaderText}>
                    <View style={styles.skeletonName} />
                    <View style={styles.skeletonTime} />
                </View>
            </View>

            {/* Content */}
            <View style={styles.skeletonContentLine} />
            <View style={[styles.skeletonContentLine, { width: '80%' }]} />

            {/* Media Area */}
            <View style={styles.skeletonMedia} />

            {/* Footer */}
            <View style={styles.skeletonFooter}>
                <View style={styles.skeletonFooterButton} />
                <View style={styles.skeletonFooterButton} />
                <View style={styles.skeletonFooterButton} />
            </View>
        </Animated.View>
    );
};

const EmptyFeed = () => {
    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="ghost-outline" size={40} color="rgba(255, 255, 255, 0.5)" />
            </View>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>
                Your feed is quiet for now. Add more friends or create a new post to get started!
            </Text>
        </View>
    );
};

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
    const insets = useSafeAreaInsets();
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [likesModalVisible, setLikesModalVisible] = useState(false);
    const [activeLikesPostId, setActiveLikesPostId] = useState<string | null>(null);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
    const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const userHasScrolled = useRef(false);

    const { user } = useAuthStore();

    const handlePostCreated = useCallback((newPost: Post) => {
        setPosts((prev) => [newPost, ...prev]);
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const response = await PostService.getFeed();
            if (response.success && response.data) {
                setPosts(response.data);
                setHasMore(response.data.length > 0);
            }
        } catch (error) {
            console.error("Failed to fetch feed posts:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleLoadMore = async () => {
        if (isLoadingMore || isLoading || !hasMore || !userHasScrolled.current) return;
        console.log("onEndReached triggered: Loading more posts...");
        setIsLoadingMore(true);
        try {
            const response = await PostService.getFeed();
            if (response.success && response.data) {
                if (response.data.length === 0) {
                    setHasMore(false);
                } else {
                    setPosts((prev) => [...prev, ...response.data]);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch feed posts:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

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

    const formatNumber = (num?: number | null) => {
        if (num === undefined || num === null) return "0";
        const val = Number(num);
        if (isNaN(val)) return "0";
        if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
        }
        if (val >= 1000) {
            return `${(val / 1000).toFixed(1)}K`;
        }
        return val.toString();
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

        PostService.like(postId).catch((error) => {
            console.error("Failed to like post:", error);
            // Rollback state if the API fails
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
        });
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
        userHasScrolled.current = false;
        setHasMore(true);
        await fetchPosts();
        setRefreshing(false);
    }, [fetchPosts]);

    const renderHeaderComponents = () => {
        return (
            <View style={styles.listHeaderContainer}>
                {/* 1. Stories Island (Glass Island Style) */}
                <View style={styles.cardContainer}>
                    <GlassCard intensity={85} noPadding={true}>
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
                    <GlassCard intensity={85} noPadding={true}>
                        <View style={styles.createPostContent}>
                            <View style={styles.createPostRow}>
                                <Avatar
                                    source={user?.avatar_url || user?.avatar || undefined}
                                    name={user?.fullName || user?.username}
                                    size="md"
                                />
                                <TouchableOpacity
                                    style={styles.createPostInputButton}
                                    activeOpacity={0.8}
                                    onPress={() => setCreatePostModalVisible(true)}
                                >
                                    <Text style={styles.createPostInputText}>Bạn đang nghĩ gì?</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.createPostDivider} />
                            <View style={styles.createPostActionsRow}>
                                <TouchableOpacity
                                    style={styles.createPostActionButton}
                                    activeOpacity={0.8}
                                    onPress={() => setCreatePostModalVisible(true)}
                                >
                                    <Ionicons name="image-outline" size={18} color={Colors.text.primary} />
                                    <Text style={styles.createPostActionText}>Ảnh</Text>
                                </TouchableOpacity>
                                <GlassButton
                                    variant="primary"
                                    size="sm"
                                    intensity={0}
                                    style={{ borderRadius: 16, width: 80 }}
                                    onPress={() => setCreatePostModalVisible(true)}
                                >
                                    Đăng
                                </GlassButton>
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
                onOpenLikes={(postId) => {
                    setActiveLikesPostId(postId);
                    setLikesModalVisible(true);
                }}
                onComment={(postId) => {
                    setActiveCommentsPostId(postId);
                    setCommentsModalVisible(true);
                }}
            />
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={{ paddingBottom: Spacing.md }}>
                <PostCardSkeleton />
            </View>
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
                    style={{ flex: 1 }}
                    data={isLoading ? ([1, 2, 3] as any) : posts}
                    renderItem={isLoading ? () => <PostCardSkeleton /> : renderPost}
                    keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : `${(item as any).id}-${index}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.feedContent,
                        { paddingBottom: Spacing.xl * 2 + (Platform.OS === "ios" ? 88 : 68) + insets.bottom }
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.brand.primary}
                        />
                    }
                    ListHeaderComponent={renderHeaderComponents}
                    ListEmptyComponent={isLoading ? null : <EmptyFeed />}
                    onScroll={(event) => {
                        const y = event.nativeEvent.contentOffset?.y || 0;
                        if (y > 5 && !userHasScrolled.current) {
                            console.log("User started scrolling, enabling pagination. Y:", y);
                            userHasScrolled.current = true;
                        }
                    }}
                    scrollEventThrottle={16}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                />
            </SafeAreaView>

            {activeLikesPostId && (
                <LikesModal
                    visible={likesModalVisible}
                    onClose={() => {
                        setLikesModalVisible(false);
                        setActiveLikesPostId(null);
                    }}
                    postId={activeLikesPostId}
                />
            )}

            <CommentsModal
                visible={commentsModalVisible}
                onClose={() => {
                    setCommentsModalVisible(false);
                    setActiveCommentsPostId(null);
                }}
                postId={activeCommentsPostId || ""}
                onCommentAdded={() => {
                    if (activeCommentsPostId) {
                        setPosts((prev) =>
                            prev.map((post) =>
                                post.id === activeCommentsPostId
                                    ? { ...post, comment_count: (post.comment_count || 0) + 1 }
                                    : post
                            )
                        );
                    }
                }}
                onCommentDeleted={() => {
                    if (activeCommentsPostId) {
                        setPosts((prev) =>
                            prev.map((post) =>
                                post.id === activeCommentsPostId
                                    ? { ...post, comment_count: Math.max(0, (post.comment_count || 0) - 1) }
                                    : post
                            )
                        );
                    }
                }}
            />

            <CreatePostModal
                visible={createPostModalVisible}
                onClose={() => setCreatePostModalVisible(false)}
                onPostCreated={handlePostCreated}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    skeletonCard: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        marginHorizontal: Spacing.md,
    },
    skeletonHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
    },
    skeletonAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    skeletonHeaderText: {
        marginLeft: Spacing.sm,
        flex: 1,
        gap: 6,
    },
    skeletonName: {
        width: 120,
        height: 14,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    skeletonTime: {
        width: 80,
        height: 10,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    skeletonContentLine: {
        height: 14,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        marginBottom: Spacing.sm,
    },
    skeletonMedia: {
        width: '100%',
        height: 200,
        borderRadius: BorderRadius.md,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        marginBottom: Spacing.md,
        marginTop: Spacing.sm,
    },
    skeletonFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.05)",
        paddingTop: Spacing.sm,
    },
    skeletonFooterButton: {
        width: 60,
        height: 20,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
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
        color: Colors.text.secondary,
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
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: Spacing.xl,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: FontSize.lg,
        fontWeight: "bold",
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
        textAlign: "center",
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: "rgba(255, 255, 255, 0.6)",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: Spacing.md,
    },
});