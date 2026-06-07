import { Avatar, GlassCard } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { Post } from "@/types/post.types";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { LikesModal } from "./LikesModal";

interface PostVideoPlayerProps {
    source: string;
    style: any;
    onVideoSize?: (width: number, height: number) => void;
}

function PostVideoPlayer({ source, style, onVideoSize }: PostVideoPlayerProps) {
    let videoSource = source;
    if (Platform.OS === "web" && source.endsWith(".m3u8")) {
        videoSource = source.replace("/sp_auto/", "/").replace(".m3u8", ".mp4");
    }

    const player = useVideoPlayer(videoSource, (player) => {
        player.loop = true;
        player.muted = false; // Unmute feed videos by default
    });

    const currentSourceRef = useRef(videoSource);

    useEffect(() => {
        if (videoSource && videoSource !== currentSourceRef.current) {
            player.replace(videoSource);
            currentSourceRef.current = videoSource;
        }
        player.loop = true;
        player.muted = false;

        if (Platform.OS === "web") {
            const checkWebVideoSize = () => {
                // @ts-ignore
                const mountedVideos = player._mountedVideos;
                if (mountedVideos && mountedVideos.size > 0) {
                    const videoEl = [...mountedVideos][0] as HTMLVideoElement;
                    if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                        console.log(`[Web Video Size Initial] Source: ${videoSource}, width: ${videoEl.videoWidth}, height: ${videoEl.videoHeight}, ratio: ${videoEl.videoHeight / videoEl.videoWidth}`);
                        onVideoSize?.(videoEl.videoWidth, videoEl.videoHeight);
                        return true;
                    }
                }
                return false;
            };

            if (checkWebVideoSize()) return;

            let videoEl: HTMLVideoElement | null = null;
            const handleLoadedMetadata = () => {
                if (videoEl) {
                    console.log(`[Web Video LoadedMetadata] Source: ${videoSource}, width: ${videoEl.videoWidth}, height: ${videoEl.videoHeight}, ratio: ${videoEl.videoHeight / videoEl.videoWidth}`);
                    onVideoSize?.(videoEl.videoWidth, videoEl.videoHeight);
                }
            };

            const interval = setInterval(() => {
                // @ts-ignore
                if (player._mountedVideos && player._mountedVideos.size > 0) {
                    // @ts-ignore
                    videoEl = [...player._mountedVideos][0] as HTMLVideoElement;
                    if (videoEl) {
                        if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                            handleLoadedMetadata();
                            clearInterval(interval);
                        } else {
                            videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);
                            clearInterval(interval);
                        }
                    }
                }
            }, 100);

            return () => {
                clearInterval(interval);
                if (videoEl) {
                    videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
                }
            };
        } else {
            if (player.videoTrack && player.videoTrack.size) {
                const { width, height } = player.videoTrack.size;
                if (width > 0 && height > 0) {
                    console.log(`[Video Size Initial] Source: ${videoSource}, width: ${width}, height: ${height}, ratio: ${height / width}`);
                    onVideoSize?.(width, height);
                }
            }

            const sizeSub = player.addListener("videoTrackChange", (event) => {
                const track = event.videoTrack;
                if (track && track.size && track.size.width > 0 && track.size.height > 0) {
                    console.log(`[Video Size TrackChange] Source: ${videoSource}, width: ${track.size.width}, height: ${track.size.height}, ratio: ${track.size.height / track.size.width}`);
                    onVideoSize?.(track.size.width, track.size.height);
                }
            });

            const statusSub = player.addListener("statusChange", () => {
                if (player.videoTrack && player.videoTrack.size) {
                    const { width, height } = player.videoTrack.size;
                    if (width > 0 && height > 0) {
                        console.log(`[Video Size StatusChange] Source: ${videoSource}, width: ${width}, height: ${height}, ratio: ${height / width}`);
                        onVideoSize?.(width, height);
                    }
                }
            });

            return () => {
                sizeSub.remove();
                statusSub.remove();
            };
        }
    }, [player, onVideoSize, videoSource]);

    const [isPlaying, setIsPlaying] = useState(player.playing);
    const [isMuted, setIsMuted] = useState(player.muted);

    useEffect(() => {
        const playSub = player.addListener("playingChange", (event) => {
            setIsPlaying(event.isPlaying);
            console.log(`[Video Event] Trạng thái phát thay đổi -> isPlaying: ${event.isPlaying}`);
        });
        const muteSub = player.addListener("mutedChange", (event) => {
            setIsMuted(event.muted);
            console.log(`[Video Event] Trạng thái âm thanh thay đổi -> isMuted: ${event.muted}`);
        });
        return () => {
            playSub.remove();
            muteSub.remove();
        };
    }, [player]);

    const togglePlay = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    const flatStyle = StyleSheet.flatten(style);

    return (
        <View style={{ position: "relative", width: flatStyle?.width, height: flatStyle?.height, overflow: "hidden" }}>
            <VideoView
                style={flatStyle}
                player={player}
                allowsPictureInPicture={false}
                contentFit="contain"
                nativeControls={isPlaying} // Chỉ hiển thị thanh điều khiển khi đang phát
            />

            {/* Click target overlay covering the entire video area (only active when paused) */}
            {!isPlaying && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={togglePlay}
                    style={StyleSheet.absoluteFill}
                >
                    <View style={styles.videoOverlay}>
                        <View style={styles.playButtonCircle}>
                            <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - Spacing.md * 2;

export interface PostCardProps {
    item: Post;
    onLike?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onShare?: (postId: string) => void;
    onMorePress?: (postId: string) => void;
    onOpenLikes?: (postId: string) => void;
}

export function PostCard({
    item,
    onLike,
    onBookmark,
    onComment,
    onShare,
    onMorePress,
    onOpenLikes,
}: PostCardProps) {
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [activeSharedMediaIndex, setActiveSharedMediaIndex] = useState(0);

    // Likes list bottom sheet state
    const [likesModalVisible, setLikesModalVisible] = useState(false);

    const handleOpenLikesModal = useCallback(() => {
        if (onOpenLikes) {
            onOpenLikes(item.id);
        } else {
            setLikesModalVisible(true);
        }
    }, [onOpenLikes, item.id]);

    useEffect(() => {
        if (!item.post_media) return;
        item.post_media.forEach((media, index) => {
            if (media.media_type === "image") {
                Image.getSize(
                    media.media_url,
                    (w, h) => {
                        console.log(`[Image Size] Post ID: ${item.id}, URL: ${media.media_url}, width: ${w}, height: ${h}, ratio: ${h / w}`);
                    },
                    (error) => {
                        console.warn("Failed to get image size", error);
                    }
                );
            }
        });
    }, [item.id]);

    useEffect(() => {
        const originalPost = item.original_post;
        if (!originalPost || !originalPost.post_media) return;
        originalPost.post_media.forEach((media, index) => {
            if (media.media_type === "image") {
                Image.getSize(
                    media.media_url,
                    (w, h) => {
                        console.log(`[Shared Image Size] Original Post ID: ${originalPost.id}, URL: ${media.media_url}, width: ${w}, height: ${h}, ratio: ${h / w}`);
                    },
                    (error) => {
                        console.warn("Failed to get shared image size", error);
                    }
                );
            }
        });
    }, [item.original_post?.id]);

    const hasMedia = item.post_media && item.post_media.length > 0;
    const isShared = item.original_post != null;

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

    const renderSharedPostPreview = (originalPost: Post) => {
        const hasSharedMedia = originalPost.post_media && originalPost.post_media.length > 0;
        const sharedWidth = CARD_WIDTH - Spacing.md * 2;
        const sharedImageHeight = 300;

        return (
            <View style={styles.sharedContainer}>
                {/* Header */}
                <View style={styles.sharedHeader}>
                    <Avatar
                        source={originalPost.user.avatar_url || undefined}
                        name={originalPost.user.name}
                        size="sm"
                    />
                    <View style={styles.sharedUserText}>
                        <Text style={styles.sharedUsername}>{originalPost.user.name || originalPost.user.username}</Text>
                        <View style={styles.sharedSubRow}>
                            <Text style={styles.sharedTimeText}>{formatTime(originalPost.created_at)}</Text>
                            <Text style={styles.sharedBullet}> • </Text>
                            <Ionicons name="earth-outline" size={10} color={Colors.text.muted} />
                        </View>
                    </View>
                </View>

                {/* Content */}
                {originalPost.content ? (
                    <View style={styles.sharedContentContainer}>
                        <Text style={styles.sharedContentText}>{originalPost.content}</Text>
                    </View>
                ) : null}

                {/* Media */}
                {hasSharedMedia && (
                    <View style={[styles.sharedImageContainer, { width: sharedWidth, height: sharedImageHeight }]}>
                        {originalPost.post_media.length === 1 ? (
                            originalPost.post_media[0].media_type === "video" ? (
                                <PostVideoPlayer
                                    source={originalPost.post_media[0].media_url}
                                    style={{ width: sharedWidth, height: sharedImageHeight }}
                                />
                            ) : (
                                <Image
                                    source={{ uri: originalPost.post_media[0].media_url }}
                                    style={{ width: sharedWidth, height: sharedImageHeight }}
                                    resizeMode="contain"
                                />
                            )
                        ) : (
                            <ScrollView
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                scrollEventThrottle={16}
                                onScroll={(e) => {
                                    const offset = e.nativeEvent.contentOffset.x;
                                    const page = Math.round(offset / sharedWidth);
                                    setActiveSharedMediaIndex(page);
                                }}
                            >
                                {originalPost.post_media.map((media, index) => (
                                    media.media_type === "video" ? (
                                        <PostVideoPlayer
                                            key={media.id || index}
                                            source={media.media_url}
                                            style={{ width: sharedWidth, height: sharedImageHeight }}
                                        />
                                    ) : (
                                        <Image
                                            key={media.id || index}
                                            source={{ uri: media.media_url }}
                                            style={{ width: sharedWidth, height: sharedImageHeight }}
                                            resizeMode="contain"
                                        />
                                    )
                                ))}
                            </ScrollView>
                        )}
                        {originalPost.post_media.length > 1 && (
                            <View style={styles.imageIndicator}>
                                {originalPost.post_media.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.indicatorDot,
                                            index === activeSharedMediaIndex && styles.indicatorDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Shared Post Stats Footer */}
                <View style={styles.sharedFooter}>
                    <View style={styles.sharedFooterLikes}>
                        <View style={styles.likeBadge}>
                            <Text style={styles.likeBadgeText}>👍</Text>
                        </View>
                        <Text style={styles.sharedFooterText}>{formatNumber(originalPost.like_count)}</Text>
                    </View>
                    <Text style={styles.sharedFooterText}>
                        {formatNumber(originalPost.comment_count || 0)} bình luận
                    </Text>
                </View>
            </View>
        );
    };

    const mediaHeight = 300;

    return (
        <View style={styles.cardContainer}>
            <GlassCard intensity="medium" noPadding={true}>
                {/* Post Header */}
                <View style={styles.postHeader}>
                    <TouchableOpacity style={styles.postUserInfo}>
                        <Avatar
                            source={item.user.avatar_url || undefined}
                            name={item.user.name}
                            size="md"
                        />
                        <View style={styles.postUserText}>
                            <Text style={styles.postUsername}>{item.user.name || item.user.username}</Text>
                            <View style={styles.postSubRow}>
                                <Text style={styles.postTimeText}>{formatTime(item.created_at)}</Text>
                                {isShared && (
                                    <>
                                        <Text style={styles.postBullet}> • </Text>
                                        <Ionicons name="share-social-outline" size={11} color={Colors.text.muted} />
                                        <Text style={styles.postSharedText}> đã chia sẻ</Text>
                                    </>
                                )}
                                <Text style={styles.postBullet}> • </Text>
                                <Ionicons name="earth-outline" size={12} color={Colors.text.muted} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.postMoreButton}
                        onPress={() => onMorePress && onMorePress(item.id)}
                    >
                        <Ionicons
                            name="ellipsis-horizontal"
                            size={20}
                            color={Colors.text.primary}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.postDivider} />

                {/* Post Body (Content Text) */}
                {item.content ? (
                    <View style={styles.postContentContainer}>
                        <Text style={styles.postContentText}>{item.content}</Text>
                    </View>
                ) : null}

                {/* Shared Post Preview or Own Media */}
                {isShared ? (
                    <View style={styles.sharedPreviewWrapper}>
                        {renderSharedPostPreview(item.original_post!)}
                    </View>
                ) : (
                    hasMedia && (
                        <View style={[styles.postImageContainer, { height: mediaHeight }]}>
                            {item.post_media.length === 1 ? (
                                item.post_media[0].media_type === "video" ? (
                                    <PostVideoPlayer
                                        source={item.post_media[0].media_url}
                                        style={[styles.postImage, { height: mediaHeight }]}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: item.post_media[0].media_url }}
                                        style={[styles.postImage, { height: mediaHeight }]}
                                        resizeMode="contain"
                                    />
                                )
                            ) : (
                                <ScrollView
                                    horizontal
                                    pagingEnabled
                                    showsHorizontalScrollIndicator={false}
                                    scrollEventThrottle={16}
                                    style={{ width: CARD_WIDTH }}
                                    onScroll={(e) => {
                                        const offset = e.nativeEvent.contentOffset.x;
                                        const page = Math.round(offset / (CARD_WIDTH));
                                        setActiveMediaIndex(page);
                                    }}
                                >
                                    {item.post_media.map((media, index) => (
                                        media.media_type === "video" ? (
                                            <PostVideoPlayer
                                                key={media.id || index}
                                                source={media.media_url}
                                                style={[styles.postImage, { height: mediaHeight }]}
                                            />
                                        ) : (
                                            <Image
                                                key={media.id || index}
                                                source={{ uri: media.media_url }}
                                                style={[styles.postImage, { height: mediaHeight }]}
                                                resizeMode="contain"
                                            />
                                        )
                                    ))}
                                </ScrollView>
                            )}
                            {item.post_media.length > 1 && (
                                <View style={styles.imageIndicator}>
                                    {item.post_media.map((_, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.indicatorDot,
                                                index === activeMediaIndex && styles.indicatorDotActive,
                                            ]}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )
                )}

                <View style={styles.postDivider} />

                {/* Stats Row: "X lượt thích" | "Y bình luận" | "Z chia sẻ" */}
                <View style={styles.statsRow}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={handleOpenLikesModal}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.statsText}>{formatNumber(item.like_count)} lượt thích</Text>
                    </TouchableOpacity>
                    <View style={styles.statsDivider} />
                    <Text style={styles.statsText}>{formatNumber(item.comment_count || 0)} bình luận</Text>
                    <View style={styles.statsDivider} />
                    <Text style={styles.statsText}>{formatNumber(item.share_count || 0)} chia sẻ</Text>
                </View>

                <View style={styles.postDivider} />

                {/* Post Actions: Like, Comment, Share */}
                <View style={styles.postActionsRow}>
                    <TouchableOpacity
                        style={styles.postActionButton}
                        onPress={() => onLike && onLike(item.id)}
                    >
                        <Ionicons
                            name={item.has_liked ? "heart" : "heart-outline"}
                            size={20}
                            color={item.has_liked ? Colors.status.error : Colors.text.primary}
                        />
                        <Text style={[styles.actionButtonText, item.has_liked && { color: Colors.status.error }]}>Like</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.postActionButton}
                        onPress={() => onComment && onComment(item.id)}
                    >
                        <Ionicons
                            name="chatbubble-outline"
                            size={20}
                            color={Colors.text.primary}
                        />
                        <Text style={styles.actionButtonText}>Bình luận</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.postActionButton}
                        onPress={() => onShare && onShare(item.id)}
                    >
                        <Ionicons
                            name="share-social-outline"
                            size={20}
                            color={Colors.text.primary}
                        />
                        <Text style={styles.actionButtonText}>Chia sẻ</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>

            {/* Likes List Modal (Bottom Sheet style) */}
            {!onOpenLikes && (
                <LikesModal
                    visible={likesModalVisible}
                    onClose={() => setLikesModalVisible(false)}
                    postId={item.id}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm
    },

    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    postUserInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    postUserText: {
        marginLeft: Spacing.sm,
        flex: 1,
    },
    postUsername: {
        fontSize: FontSize.base,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    postSubRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    postTimeText: {
        fontSize: FontSize.xs,
        color: Colors.text.muted,
    },
    postBullet: {
        fontSize: FontSize.xs,
        color: Colors.text.muted,
    },
    postSharedText: {
        fontSize: FontSize.xs,
        color: Colors.text.muted,
        fontWeight: "500",
    },
    postMoreButton: {
        padding: Spacing.xs,
    },
    postDivider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Khớp với border-white/10 của web
    },
    postContentContainer: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    postContentText: {
        color: Colors.text.primary,
        fontSize: FontSize.md,
        lineHeight: 22,
    },
    sharedPreviewWrapper: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    postImageContainer: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.6,
        backgroundColor: "transparent",
        // marginBottom: Spacing.md,
        overflow: "hidden",
    },
    postImage: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 0.6,
    },
    imageIndicator: {
        position: "absolute",
        bottom: Spacing.md,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 4,
    },
    indicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.5)",
    },
    indicatorDotActive: {
        backgroundColor: Colors.brand.primary,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: Spacing.sm,
    },
    statsText: {
        color: Colors.text.muted,
        fontSize: FontSize.xs,
        fontWeight: "500",
        flex: 1,
        textAlign: "center",
    },
    statsDivider: {
        width: 1,
        height: 12,
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Khớp với border-white/10 của web
    },
    postActionsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: Spacing.sm,
    },
    postActionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    actionButtonText: {
        color: Colors.text.primary,
        fontSize: FontSize.xs,
        fontWeight: "600",
        marginLeft: Spacing.xs,
    },
    sharedContainer: {
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.15)",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        overflow: "hidden",
    },
    sharedHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    sharedUserText: {
        flex: 1,
    },
    sharedUsername: {
        fontSize: FontSize.sm,
        fontWeight: "600",
        color: Colors.text.primary,
    },
    sharedSubRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    sharedTimeText: {
        fontSize: 11,
        color: Colors.text.muted,
    },
    sharedBullet: {
        fontSize: 11,
        color: Colors.text.muted,
    },
    sharedContentContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    sharedContentText: {
        color: "rgba(255, 255, 255, 0.85)",
        fontSize: FontSize.sm,
        lineHeight: 18,
    },
    sharedImageContainer: {
        overflow: "hidden",
        backgroundColor: "transparent",
    },
    sharedFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.07)", // Khớp với border-white/[0.07] của web
    },
    sharedFooterLikes: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    likeBadge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#3B82F6",
        justifyContent: "center",
        alignItems: "center",
    },
    likeBadgeText: {
        fontSize: 9,
        color: "#FFFFFF",
    },
    sharedFooterText: {
        color: Colors.text.muted,
        fontSize: 11,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        justifyContent: "center",
        alignItems: "center",
    },
    playButtonCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.45)",
    },
});
