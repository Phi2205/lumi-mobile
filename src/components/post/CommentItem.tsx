import { Avatar } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { PostService } from "@/services/post.service";
import { CommentItem as CommentItemType } from "@/types/post.types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { updateCommentRepliesInTree, appendCommentRepliesInTree } from "./CommentsModal";

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours}h trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
};

export const CommentItemSkeleton = ({ pulseAnim, isReply }: { pulseAnim: Animated.Value; isReply?: boolean }) => {
    return (
        <Animated.View style={[styles.commentItemCard, { opacity: pulseAnim }]}>
            <View style={[
                styles.skeletonAvatar,
                isReply ? { width: 28, height: 28, borderRadius: 14 } : null
            ]} />
            <View style={styles.commentContentContainer}>
                <View style={styles.skeletonBubble}>
                    <View style={styles.skeletonName} />
                    <View style={styles.skeletonText} />
                </View>
                <View style={styles.skeletonActions} />
            </View>
        </Animated.View>
    );
};

export const CommentsSkeleton = () => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const anim = Animated.loop(
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
        anim.start();
        return () => anim.stop();
    }, [pulseAnim]);

    return (
        <View style={styles.commentsListContent}>
            {[1, 2, 3, 4].map((index) => (
                <CommentItemSkeleton key={index} pulseAnim={pulseAnim} />
            ))}
        </View>
    );
};

export const RepliesSkeleton = ({ containerStyle }: { containerStyle?: any }) => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const anim = Animated.loop(
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
        anim.start();
        return () => anim.stop();
    }, [pulseAnim]);

    return (
        <View style={[styles.repliesList, containerStyle]}>
            {[1, 2].map((index) => (
                <CommentItemSkeleton key={index} pulseAnim={pulseAnim} isReply />
            ))}
        </View>
    );
};

export interface CommentItemProps {
    item: CommentItemType;
    postId: string;
    onReply: (comment: CommentItemType | null) => void;
    replyingTo: CommentItemType | null;
    commentText: string;
    setCommentText: (text: string) => void;
    onSendComment: () => void;
    isSubmitting: boolean;
    currentUser: any;
    setCommentsList: React.Dispatch<React.SetStateAction<CommentItemType[]>>;
    onDeleteComment: (commentId: string) => void;
}

export const CommentItemComponent = ({
    item,
    postId,
    onReply,
    replyingTo,
    commentText,
    setCommentText,
    onSendComment,
    isSubmitting,
    currentUser,
    setCommentsList,
    onDeleteComment,
}: CommentItemProps) => {
    const user = item.user;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(item.has_replies && (!item.replies || item.replies.length === 0));

    const isReplyingThis = replyingTo?.id === item.id;

    const handleDeletePress = () => {
        Alert.alert(
            "Xóa bình luận",
            "Bạn có chắc chắn muốn xóa bình luận này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: () => onDeleteComment(item.id),
                },
            ]
        );
    };

    const handleFetchReplies = async (nextPage: number) => {
        const isInitial = nextPage === 1;
        if (isInitial) {
            setIsLoadingReplies(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const response = await PostService.getCommentReplies(postId, item.id, nextPage, 3);
            if (response && response.success && response.data && response.data.items) {
                const fetchedReplies = response.data.items;
                const pagination = response.data.pagination;
                
                setCommentsList((prev) => {
                    if (isInitial) {
                        return updateCommentRepliesInTree(prev, item.id, fetchedReplies);
                    } else {
                        return appendCommentRepliesInTree(prev, item.id, fetchedReplies);
                    }
                });

                setPage(nextPage);
                setHasMore(pagination?.hasNextPage ?? false);
            }
        } catch (error) {
            console.error("Failed to fetch replies:", error);
        } finally {
            setIsLoadingReplies(false);
            setIsLoadingMore(false);
        }
    };

    const toggleReplies = () => {
        const repliesCount = item.replies?.length || 0;
        if (!isExpanded && repliesCount === 0 && item.has_replies) {
            handleFetchReplies(1);
        }
        setIsExpanded((prev) => !prev);
    };

    return (
        <View style={styles.commentItemCard}>
            <Avatar
                size={item.parent_id ? "sm" : "md"}
                source={user.avatar_url || undefined}
                name={user.name}
            />
            <View style={styles.commentContentContainer}>
                <View style={styles.commentBubble}>
                    <Text style={styles.commentName}>{user.name || "User"}</Text>
                    <Text style={styles.commentTextContent}>{item.content}</Text>
                </View>
                <View style={styles.commentActions}>
                    <Text style={styles.commentTime}>{formatTime(item.created_at)}</Text>
                    <TouchableOpacity onPress={() => onReply(item)} style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>Trả lời</Text>
                    </TouchableOpacity>
                    {currentUser?.id === user.id && (
                        <TouchableOpacity onPress={handleDeletePress} style={styles.actionBtn}>
                            <Text style={[styles.actionBtnText, { color: Colors.status.error }]}>Xóa</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Inline Reply Input */}
                {isReplyingThis && (
                    <View style={styles.inlineInputRow}>
                        <Avatar
                            size="sm"
                            source={currentUser?.avatar_url || undefined}
                            name={currentUser?.name}
                        />
                        <View style={styles.inlineInputContainer}>
                            <TextInput
                                style={styles.inlineTextInput}
                                placeholder={`Trả lời ${user.name || "User"}...`}
                                placeholderTextColor={Colors.text.muted}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                maxLength={500}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={{ marginRight: 6 }}
                                onPress={() => {
                                    setCommentText("");
                                    onReply(null);
                                }}
                            >
                                <Ionicons name="close-circle-outline" size={18} color={Colors.text.muted} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.inlineSendButton,
                                    !commentText.trim() || isSubmitting ? styles.inlineSendButtonDisabled : null
                                ]}
                                onPress={onSendComment}
                                disabled={!commentText.trim() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color={Colors.brand.primary} />
                                ) : (
                                    <Ionicons
                                        name="send"
                                        size={16}
                                        color={commentText.trim() ? Colors.brand.primary : Colors.text.muted}
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* View replies button */}
                {item.has_replies && (
                    <TouchableOpacity
                        style={styles.viewRepliesContainer}
                        onPress={toggleReplies}
                        activeOpacity={0.7}
                    >
                        <View style={styles.viewRepliesLine} />
                        <Text style={styles.viewRepliesText}>
                            {isExpanded ? "Ẩn phản hồi" : "Xem phản hồi"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Nested Replies Rendering */}
                {isExpanded && (
                    <>
                        {isLoadingReplies && <RepliesSkeleton />}
                        {!isLoadingReplies && item.replies && item.replies.length > 0 && (
                            <View style={styles.repliesList}>
                                {item.replies.map((reply) => (
                                    <CommentItemComponent
                                        key={reply.id}
                                        item={reply}
                                        postId={postId}
                                        onReply={onReply}
                                        replyingTo={replyingTo}
                                        commentText={commentText}
                                        setCommentText={setCommentText}
                                        onSendComment={onSendComment}
                                        isSubmitting={isSubmitting}
                                        currentUser={currentUser}
                                        setCommentsList={setCommentsList}
                                        onDeleteComment={onDeleteComment}
                                    />
                                ))}
                                {isLoadingMore && (
                                    <RepliesSkeleton containerStyle={{ marginTop: 0 }} />
                                )}
                            </View>
                        )}
                        {/* Load more replies button */}
                        {hasMore && !isLoadingMore && (
                            <TouchableOpacity
                                style={styles.loadMoreRepliesContainer}
                                onPress={() => handleFetchReplies(page + 1)}
                            >
                                <View style={styles.viewRepliesLine} />
                                <Text style={styles.loadMoreRepliesText}>
                                    Xem thêm phản hồi
                                </Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    commentItemCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    commentContentContainer: {
        flex: 1,
        gap: 4,
    },
    commentBubble: {
        alignSelf: "flex-start",
        maxWidth: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    commentName: {
        color: Colors.text.primary,
        fontSize: FontSize.sm,
        fontWeight: "bold",
        marginBottom: 2,
    },
    commentTextContent: {
        color: Colors.text.primary,
        fontSize: FontSize.sm,
        lineHeight: 18,
    },
    commentActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.md,
        paddingLeft: Spacing.xs,
    },
    commentTime: {
        color: Colors.text.muted,
        fontSize: FontSize.xs,
    },
    actionBtn: {
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    actionBtnText: {
        color: Colors.text.secondary,
        fontSize: FontSize.xs,
        fontWeight: "600",
    },
    inlineInputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        marginTop: Spacing.sm,
        paddingRight: Spacing.md,
    },
    inlineInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    inlineTextInput: {
        flex: 1,
        minHeight: 32,
        maxHeight: 70,
        color: Colors.text.primary,
        fontSize: FontSize.sm,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 6,
    },
    inlineSendButton: {
        padding: Spacing.xs,
        justifyContent: "center",
        alignItems: "center",
    },
    inlineSendButtonDisabled: {
        opacity: 0.5,
    },
    viewRepliesContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: Spacing.xs,
        paddingVertical: 4,
    },
    viewRepliesLine: {
        width: 20,
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        marginRight: Spacing.xs,
    },
    viewRepliesText: {
        color: Colors.text.muted,
        fontSize: FontSize.xs,
        fontWeight: "600",
    },
    repliesList: {
        marginTop: Spacing.sm,
        gap: Spacing.sm,
    },
    loadMoreRepliesContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: Spacing.xs,
        paddingVertical: 4,
        paddingLeft: Spacing.sm,
    },
    loadMoreRepliesText: {
        color: Colors.brand.primary,
        fontSize: FontSize.xs,
        fontWeight: "600",
    },
    skeletonAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    skeletonBubble: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        gap: 6,
        width: "80%",
    },
    skeletonName: {
        width: 100,
        height: 12,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    skeletonText: {
        width: "100%",
        height: 16,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.07)",
    },
    skeletonActions: {
        width: 80,
        height: 8,
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        marginTop: 4,
    },
    commentsListContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },
});
