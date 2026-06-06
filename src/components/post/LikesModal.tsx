import { Avatar } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { PostService } from "@/services/post.service";
import { LikeItem } from "@/types/post.types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const LikeItemSkeleton = ({ pulseAnim }: { pulseAnim: Animated.Value }) => {
    return (
        <Animated.View style={[styles.likeItemCard, { opacity: pulseAnim }]}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.likeItemTextContainer}>
                <View style={styles.skeletonName} />
                <View style={styles.skeletonUsername} />
            </View>
        </Animated.View>
    );
};

const LikesSkeleton = () => {
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
        <View style={styles.likesListContent}>
            {[1, 2, 3, 4, 5].map((index) => (
                <LikeItemSkeleton key={index} pulseAnim={pulseAnim} />
            ))}
        </View>
    );
};

interface LikesModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
}

export function LikesModal({ visible, onClose, postId }: LikesModalProps) {
    const [likesList, setLikesList] = useState<LikeItem[]>([]);
    const [likesPage, setLikesPage] = useState(1);
    const [isLoadingLikes, setIsLoadingLikes] = useState(false);
    const [isLoadingMoreLikes, setIsLoadingMoreLikes] = useState(false);
    const [hasMoreLikes, setHasMoreLikes] = useState(true);

    const fetchLikes = useCallback(async (page: number, shouldAppend: boolean = false) => {
        if (page === 1) {
            setIsLoadingLikes(true);
        } else {
            setIsLoadingMoreLikes(true);
        }

        try {
            const response = await PostService.getLikeByPostId(postId, page, 15);
            console.log('response', response);
            if (response && response.success && response.data && response.data.items) {
                const newLikes = response.data.items;
                const pagination = response.data.pagination;
                setHasMoreLikes(pagination ? pagination.hasNextPage : newLikes.length >= 15);

                if (shouldAppend) {
                    setLikesList((prev) => {
                        const existingUserIds = new Set(prev.map((l) => l.user_id));
                        const uniqueNewLikes = newLikes.filter((l) => !existingUserIds.has(l.user_id));
                        return [...prev, ...uniqueNewLikes];
                    });
                } else {
                    setLikesList(newLikes);
                }
            } else {
                setHasMoreLikes(false);
            }
        } catch (error) {
            console.error("Failed to fetch likes:", error);
            setHasMoreLikes(false);
        } finally {
            setIsLoadingLikes(false);
            setIsLoadingMoreLikes(false);
        }
    }, [postId]);

    // Fetch likes when modal becomes visible or postId changes
    useEffect(() => {
        if (visible && postId) {
            setLikesList([]);
            setLikesPage(1);
            setHasMoreLikes(true);
            fetchLikes(1, false);
        }
    }, [visible, postId, fetchLikes]);

    const handleLoadMoreLikes = useCallback(() => {
        if (isLoadingMoreLikes || !hasMoreLikes || isLoadingLikes) return;
        const nextPage = likesPage + 1;
        setLikesPage(nextPage);
        fetchLikes(nextPage, true);
    }, [isLoadingMoreLikes, hasMoreLikes, isLoadingLikes, likesPage, fetchLikes]);

    const renderLikeItem = useCallback(({ item }: { item: LikeItem }) => {
        const user = item.user;
        const fallbackUsername = user.name.toLowerCase().replace(/\s+/g, "");
        return (
            <View style={styles.likeItemCard}>
                <Avatar
                    size="md"
                    source={user.avatar_url || undefined}
                    name={user.name}
                />
                <View style={styles.likeItemTextContainer}>
                    <Text style={styles.likeItemName}>{user.name || "User"}</Text>
                    <Text style={styles.likeItemUsername}>@{user.username || fallbackUsername}</Text>
                </View>
                {/* <TouchableOpacity style={styles.followButton} activeOpacity={0.8}>
                    <Text style={styles.followButtonText}>Theo dõi</Text>
                </TouchableOpacity> */}
            </View>
        );
    }, []);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} blurMethod="none">
                    <View style={styles.modalContentContainer}>
                        <Pressable 
                            style={styles.modalContainer}
                            onPress={() => {}} // Empty handler to block click bubbling to backdrop
                        >
                            <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} blurMethod="none" />
                            
                            <View style={{ flex: 1, zIndex: 1, position: "relative" }}>
                                {/* Modal Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Lượt thích</Text>
                                    <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
                                        <Ionicons name="close" size={24} color={Colors.text.primary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Modal Content */}
                                {isLoadingLikes ? (
                                    <LikesSkeleton />
                                ) : likesList.length === 0 ? (
                                    <View style={styles.modalEmptyContainer}>
                                        <Text style={styles.modalEmptyText}>Chưa có lượt thích nào</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={likesList}
                                        renderItem={renderLikeItem}
                                        keyExtractor={(likeItem) => likeItem.user_id}
                                        style={{ flex: 1 }}
                                        contentContainerStyle={styles.likesListContent}
                                        onEndReached={handleLoadMoreLikes}
                                        onEndReachedThreshold={0.3}
                                        ListFooterComponent={
                                            isLoadingMoreLikes ? (
                                                <View style={styles.likesListFooter}>
                                                    <ActivityIndicator size="small" color={Colors.brand.primary} />
                                                </View>
                                            ) : null
                                        }
                                    />
                                )}
                            </View>
                        </Pressable>
                    </View>
                </BlurView>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalContentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    modalContainer: {
        width: "85%",
        height: SCREEN_HEIGHT * 0.55,
        backgroundColor: "rgba(26, 26, 26, 0.7)",
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
        overflow: "hidden",
        elevation: Platform.OS === 'android' ? 0 : 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.08)",
    },
    modalTitle: {
        fontSize: FontSize.lg,
        fontWeight: "bold",
        color: Colors.text.primary,
    },
    modalCloseButton: {
        padding: Spacing.xs,
    },
    modalLoadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalEmptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalEmptyText: {
        color: Colors.text.secondary,
        fontSize: FontSize.md,
    },
    likesListContent: {
        padding: Spacing.md,
    },
    likesListFooter: {
        paddingVertical: Spacing.md,
        alignItems: "center",
    },
    likeItemCard: {
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "rgba(255, 255, 255, 0.03)",
        // borderWidth: 1,
        // borderColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    likeItemTextContainer: {
        marginLeft: Spacing.md,
        flex: 1,
    },
    likeItemName: {
        color: Colors.text.primary,
        fontSize: FontSize.md,
        fontWeight: "600",
    },
    likeItemUsername: {
        color: Colors.text.muted,
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    followButton: {
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.4)",
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
    },
    followButtonText: {
        color: "#60A5FA",
        fontSize: FontSize.xs,
        fontWeight: "600",
    },
    skeletonAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    skeletonName: {
        width: 120,
        height: 14,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        marginBottom: 6,
    },
    skeletonUsername: {
        width: 80,
        height: 10,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.07)",
    },
});
