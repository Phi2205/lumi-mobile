import { Avatar } from "@/components/ui";
import { useCommentRealtime } from "@/socket/comment/useComments";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { PostService } from "@/services/post.service";
import { CommentItem } from "@/types/post.types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CommentItemSkeleton = ({ pulseAnim }: { pulseAnim: Animated.Value }) => {
    return (
        <Animated.View style={[styles.commentItemCard, { opacity: pulseAnim }]}>
            <View style={styles.skeletonAvatar} />
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

const CommentsSkeleton = () => {
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

interface CommentsModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    onCommentAdded?: () => void;
}

export const insertCommentToTree = (
    comments: CommentItem[],
    newComment: CommentItem
): CommentItem[] => {
    // Nếu là comment root
    if (!newComment.parent_id) {
        return [newComment, ...comments];
    }

    const insertRecursively = (nodes: CommentItem[]): CommentItem[] => {
        return nodes.map((node) => {
            if (node.id === newComment.parent_id) {
                if (!node.replies) node.replies = [];
                return {
                    ...node,
                    has_replies: true,
                    replies: [
                        ...node.replies,
                        { ...newComment, replies: [] },
                    ],
                };
            }

            if (node.replies.length > 0) {
                return {
                    ...node,
                    replies: insertRecursively(node.replies),
                };
            }

            return node;
        });
    };

    return insertRecursively(comments);
};

export const removeCommentFromTree = (
    comments: CommentItem[],
    commentId: string
): CommentItem[] => {
    return comments
        .filter((c) => c.id !== commentId)
        .map((c) => ({
            ...c,
            replies: c.replies ? removeCommentFromTree(c.replies, commentId) : [],
        }))
}



export function CommentsModal({ visible, onClose, postId, onCommentAdded }: CommentsModalProps) {
    const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
    const [commentsPage, setCommentsPage] = useState(1);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);

    const inputRef = useRef<TextInput>(null);

    const handleReceive = useCallback((newComment: CommentItem) => {
        setCommentsList((prev) => {
            return insertCommentToTree(prev, newComment);
        });
    }, []);

    const handleDelete = useCallback((data: { post_id: string, comment_id: string }) => {
        console.log("comment: ", data)
        setCommentsList((prev) => removeCommentFromTree(prev, data.comment_id));
    }, []);
    useCommentRealtime(postId, handleReceive, handleDelete);

    const fetchComments = useCallback(async (page: number, shouldAppend: boolean = false) => {
        if (page === 1) {
            setIsLoadingComments(true);
        } else {
            setIsLoadingMoreComments(true);
        }

        try {
            const response = await PostService.getComments(postId, page, 15);
            if (response && response.success && response.data && response.data.items) {
                const newComments = response.data.items;
                const pagination = response.data.pagination;
                setHasMoreComments(pagination ? pagination.hasNextPage : newComments.length >= 15);

                if (shouldAppend) {
                    setCommentsList((prev) => {
                        const existingCommentIds = new Set(prev.map((c) => c.id));
                        const uniqueNewComments = newComments.filter((c) => !existingCommentIds.has(c.id));
                        return [...prev, ...uniqueNewComments];
                    });
                } else {
                    setCommentsList(newComments);
                }
            } else {
                setHasMoreComments(false);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            setHasMoreComments(false);
        } finally {
            setIsLoadingComments(false);
            setIsLoadingMoreComments(false);
        }
    }, [postId]);

    useEffect(() => {
        if (visible && postId) {
            setCommentsList([]);
            setCommentsPage(1);
            setHasMoreComments(true);
            setCommentText("");
            setReplyingTo(null);
            fetchComments(1, false);
        }
    }, [visible, postId, fetchComments]);

    const handleLoadMoreComments = useCallback(() => {
        if (isLoadingMoreComments || !hasMoreComments || isLoadingComments) return;
        const nextPage = commentsPage + 1;
        setCommentsPage(nextPage);
        fetchComments(nextPage, true);
    }, [isLoadingMoreComments, hasMoreComments, isLoadingComments, commentsPage, fetchComments]);

    const handleSendComment = async () => {
        if (!commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await PostService.createComment(
                postId,
                commentText.trim(),
                replyingTo?.id || undefined
            );

            if (response && response.success && response.data) {
                setCommentText("");
                setReplyingTo(null);
                Keyboard.dismiss();
                if (onCommentAdded) {
                    onCommentAdded();
                }
            }
        } catch (error) {
            console.error("Failed to create comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplyTo = (comment: CommentItem) => {
        setReplyingTo(comment);
        inputRef.current?.focus();
    };

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

    const renderCommentItem = useCallback(({ item }: { item: CommentItem }) => {
        const user = item.user;
        return (
            <View style={[styles.commentItemCard, item.parent_id ? styles.replyItemCard : null]}>
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
                        {!item.parent_id && (
                            <TouchableOpacity onPress={() => handleReplyTo(item)} style={styles.actionBtn}>
                                <Text style={styles.actionBtnText}>Trả lời</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    }, []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <Pressable style={styles.modalOverlay} onPress={onClose}>
                    <View style={styles.modalContentContainer}>
                        <Pressable
                            style={styles.modalContainer}
                            onPress={() => { }} // Block backdrop press from bubbling
                        >
                            <BlurView intensity={75} tint="dark" style={StyleSheet.absoluteFill} blurMethod="none" />

                            <View style={{ flex: 1, zIndex: 1 }}>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <View style={styles.headerIndicator} />
                                    <View style={styles.headerRow}>
                                        <Text style={styles.modalTitle}>Bình luận</Text>
                                        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                                            <Ionicons name="close" size={24} color={Colors.text.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* List of Comments */}
                                {isLoadingComments ? (
                                    <CommentsSkeleton />
                                ) : commentsList.length === 0 ? (
                                    <View style={styles.modalEmptyContainer}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.text.muted} />
                                        <Text style={styles.modalEmptyText}>Chưa có bình luận nào</Text>
                                        <Text style={styles.modalEmptySubtext}>Hãy là người đầu tiên chia sẻ ý kiến của bạn!</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={commentsList}
                                        renderItem={renderCommentItem}
                                        keyExtractor={(item) => item.id}
                                        style={{ flex: 1 }}
                                        contentContainerStyle={styles.commentsListContent}
                                        onEndReached={handleLoadMoreComments}
                                        onEndReachedThreshold={0.3}
                                        ListFooterComponent={
                                            isLoadingMoreComments ? (
                                                <View style={styles.commentsListFooter}>
                                                    <ActivityIndicator size="small" color={Colors.brand.primary} />
                                                </View>
                                            ) : null
                                        }
                                    />
                                )}

                                {/* Input Bar */}
                                <View style={styles.inputArea}>
                                    {replyingTo && (
                                        <View style={styles.replyingBar}>
                                            <Text style={styles.replyingText}>
                                                Đang trả lời <Text style={{ fontWeight: "bold" }}>@{replyingTo.user.username || replyingTo.user.name}</Text>
                                            </Text>
                                            <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                                <Ionicons name="close-circle" size={16} color={Colors.text.muted} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <View style={styles.inputRow}>
                                        <TextInput
                                            ref={inputRef}
                                            style={styles.textInput}
                                            placeholder="Viết bình luận..."
                                            placeholderTextColor={Colors.text.muted}
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            multiline
                                            maxLength={500}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.sendButton,
                                                !commentText.trim() || isSubmitting ? styles.sendButtonDisabled : null
                                            ]}
                                            onPress={handleSendComment}
                                            disabled={!commentText.trim() || isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "stretch",
    },
    modalContentContainer: {
        width: "100%",
        height: SCREEN_HEIGHT * 0.75,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(20, 20, 20, 0.85)",
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
        overflow: "hidden",
    },
    modalHeader: {
        alignItems: "center",
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.08)",
    },
    headerIndicator: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        marginBottom: Spacing.sm,
    },
    headerRow: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
    },
    modalTitle: {
        fontSize: FontSize.lg,
        fontWeight: "bold",
        color: Colors.text.primary,
    },
    modalCloseButton: {
        padding: Spacing.xs,
    },
    modalEmptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: Spacing.xl,
        gap: Spacing.xs,
    },
    modalEmptyText: {
        color: Colors.text.primary,
        fontSize: FontSize.md,
        fontWeight: "600",
        marginTop: Spacing.sm,
    },
    modalEmptySubtext: {
        color: Colors.text.muted,
        fontSize: FontSize.sm,
        textAlign: "center",
    },
    commentsListContent: {
        padding: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    commentsListFooter: {
        paddingVertical: Spacing.md,
        alignItems: "center",
    },
    commentItemCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    replyItemCard: {
        paddingLeft: Spacing.xl + Spacing.sm,
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
    inputArea: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.08)",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        paddingBottom: Platform.OS === "ios" ? Spacing.xl : Spacing.md,
    },
    replyingBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.xs,
    },
    replyingText: {
        color: Colors.text.secondary,
        fontSize: FontSize.xs,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 90,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        color: Colors.text.primary,
        fontSize: FontSize.sm,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.brand.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
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
});
