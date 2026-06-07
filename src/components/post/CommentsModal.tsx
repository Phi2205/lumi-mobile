import { Avatar } from "@/components/ui";
import { useCommentRealtime } from "@/socket/comment/useComments";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { PostService } from "@/services/post.service";
import { CommentItem } from "@/types/post.types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAuthStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { CommentItemComponent, CommentsSkeleton } from "./CommentItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");



interface CommentsModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    onCommentAdded?: () => void;
    onCommentDeleted?: () => void;
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

export const findCommentInTree = (
    comments: CommentItem[],
    commentId: string
): CommentItem | undefined => {
    for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies && comment.replies.length > 0) {
            const found = findCommentInTree(comment.replies, commentId);
            if (found) return found;
        }
    }
    return undefined;
};

export const updateCommentRepliesInTree = (
    comments: CommentItem[],
    commentId: string,
    replies: CommentItem[]
): CommentItem[] => {
    return comments.map((comment) => {
        if (comment.id === commentId) {
            return { ...comment, replies };
        }
        if (comment.replies && comment.replies.length > 0) {
            return {
                ...comment,
                replies: updateCommentRepliesInTree(comment.replies, commentId, replies),
            };
        }
        return comment;
    });
};

export const appendCommentRepliesInTree = (
    comments: CommentItem[],
    commentId: string,
    newReplies: CommentItem[]
): CommentItem[] => {
    return comments.map((comment) => {
        if (comment.id === commentId) {
            const existingReplies = comment.replies || [];
            const existingReplyIds = new Set(existingReplies.map((r) => r.id));
            const uniqueNewReplies = newReplies.filter((r) => !existingReplyIds.has(r.id));
            return {
                ...comment,
                replies: [...existingReplies, ...uniqueNewReplies],
            };
        }
        if (comment.replies && comment.replies.length > 0) {
            return {
                ...comment,
                replies: appendCommentRepliesInTree(comment.replies, commentId, newReplies),
            };
        }
        return comment;
    });
};



export function CommentsModal({ visible, onClose, postId, onCommentAdded, onCommentDeleted }: CommentsModalProps) {
    const { user: currentUser } = useAuthStore();
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

    const handleDeleteComment = async (commentId: string) => {
        try {
            setCommentsList((prev) => removeCommentFromTree(prev, commentId));
            await PostService.deleteComment(postId, commentId);
            if (onCommentDeleted) {
                onCommentDeleted();
            }
        } catch (error) {
            console.error("Failed to delete comment:", error);
            Alert.alert("Lỗi", "Không thể xóa bình luận. Vui lòng thử lại sau.");
        }
    };

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

    const handleReplyTo = (comment: CommentItem | null) => {
        setReplyingTo(comment);
        if (comment) {
            inputRef.current?.focus();
        }
    };



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
                <View style={styles.modalOverlay}>
                    {/* Backdrop handler */}
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={onClose}
                    />
                    
                    {/* Modal Content */}
                    <View style={styles.modalContentContainer}>
                        <View style={styles.modalContainer}>
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
                                        renderItem={({ item }) => (
                                            <CommentItemComponent
                                                item={item}
                                                postId={postId}
                                                onReply={handleReplyTo}
                                                replyingTo={replyingTo}
                                                commentText={commentText}
                                                setCommentText={setCommentText}
                                                onSendComment={handleSendComment}
                                                isSubmitting={isSubmitting}
                                                currentUser={currentUser}
                                                setCommentsList={setCommentsList}
                                                onDeleteComment={handleDeleteComment}
                                            />
                                        )}
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
                                {!replyingTo && (
                                    <View style={styles.inputArea}>
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
                                )}
                            </View>
                        </View>
                    </View>
                </View>
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
});
