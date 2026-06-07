import { Avatar, GlassButton } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { PostService } from "@/services/post.service";
import { useAuthStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CreatePostModalProps {
    visible: boolean;
    onClose: () => void;
    onPostCreated?: (newPost: any) => void;
}

export function CreatePostModal({ visible, onClose, onPostCreated }: CreatePostModalProps) {
    const { user } = useAuthStore();
    const [content, setContent] = useState("");
    const [mediaFiles, setMediaFiles] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePickMedia = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Quyền truy cập", "Ứng dụng cần quyền truy cập thư viện ảnh để chọn phương tiện.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                // Limit to max 10 files
                const totalAssets = [...mediaFiles, ...result.assets];
                if (totalAssets.length > 10) {
                    Alert.alert("Giới hạn", "Bạn chỉ có thể chọn tối đa 10 ảnh/video.");
                    setMediaFiles(totalAssets.slice(0, 10));
                } else {
                    setMediaFiles(totalAssets);
                }
            }
        } catch (error) {
            console.error("Failed to pick media:", error);
            Alert.alert("Lỗi", "Không thể mở thư viện ảnh.");
        }
    };

    const handleRemoveMedia = (indexToRemove: number) => {
        setMediaFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handlePublish = async () => {
        if (!content.trim() && mediaFiles.length === 0) {
            Alert.alert("Lỗi", "Vui lòng nhập nội dung hoặc chọn ảnh/video.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await PostService.createPost(content, mediaFiles);
            if (response && response.success) {
                if (onPostCreated) {
                    onPostCreated(response.data);
                }
                setContent("");
                setMediaFiles([]);
                onClose();
            } else {
                Alert.alert("Lỗi", response.message || "Không thể đăng bài viết.");
            }
        } catch (error) {
            console.error("Publish error:", error);
            Alert.alert("Lỗi", "Đăng bài viết thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <Pressable style={styles.modalOverlay} onPress={Keyboard.dismiss}>
                    <View style={styles.modalContentContainer}>
                        <BlurView intensity={35} style={StyleSheet.absoluteFill} tint="dark" />
                        <View style={styles.modalContainer}>
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <View style={styles.headerIndicator} />
                                <View style={styles.headerRow}>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.headerBtn}
                                        disabled={isSubmitting}
                                    >
                                        <Text style={styles.cancelText}>Hủy</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Tạo bài viết</Text>
                                    <GlassButton
                                        variant="primary"
                                        size="sm"
                                        intensity={isSubmitting ? 0 : 30}
                                        style={styles.publishBtn}
                                        onPress={handlePublish}
                                        disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator size="small" color={Colors.dark.text} />
                                        ) : (
                                            <Text style={styles.publishBtnText}>Đăng</Text>
                                        )}
                                    </GlassButton>
                                </View>
                            </View>

                            {/* User details */}
                            <View style={styles.userInfoRow}>
                                <Avatar
                                    source={user?.avatar_url || user?.avatar || undefined}
                                    name={user?.fullName || user?.username}
                                    size="md"
                                />
                                <View style={styles.userTextContainer}>
                                    <Text style={styles.usernameText}>{user?.fullName || user?.username}</Text>
                                    <View style={styles.privacyBadge}>
                                        <Ionicons name="earth" size={12} color={Colors.text.secondary} />
                                        <Text style={styles.privacyText}>Công khai</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Content Input and Media Previews */}
                            <ScrollView
                                style={styles.scrollContainer}
                                contentContainerStyle={styles.scrollContent}
                                keyboardShouldPersistTaps="handled"
                            >
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Bạn đang nghĩ gì?"
                                    placeholderTextColor={Colors.text.muted}
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    maxLength={2000}
                                    autoFocus
                                    editable={!isSubmitting}
                                />

                                {/* Media Preview Grid/Horizontal */}
                                {mediaFiles.length > 0 && (
                                    <View style={styles.mediaContainer}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                                            {mediaFiles.map((file, index) => (
                                                <View key={index} style={styles.mediaWrapper}>
                                                    <Image source={{ uri: file.uri }} style={styles.mediaPreview} />
                                                    {file.type === "video" && (
                                                        <View style={styles.videoBadge}>
                                                            <Ionicons name="play" size={16} color="#FFF" />
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        style={styles.removeMediaBtn}
                                                        onPress={() => handleRemoveMedia(index)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <Ionicons name="close-circle" size={24} color={Colors.status.error} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <TouchableOpacity
                                                style={styles.addMoreMediaCard}
                                                onPress={handlePickMedia}
                                                disabled={isSubmitting}
                                            >
                                                <Ionicons name="add" size={32} color={Colors.text.muted} />
                                                <Text style={styles.addMoreText}>Thêm</Text>
                                            </TouchableOpacity>
                                        </ScrollView>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Bottom Actions Bar */}
                            <View style={styles.bottomBar}>
                                <Text style={styles.bottomBarText}>Thêm vào bài viết</Text>
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.actionIconBtn}
                                        onPress={handlePickMedia}
                                        disabled={isSubmitting}
                                    >
                                        <Ionicons name="images" size={26} color={Colors.brand.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionIconBtn}
                                        onPress={handlePickMedia}
                                        disabled={isSubmitting}
                                    >
                                        <Ionicons name="videocam" size={26} color={Colors.status.success} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
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
        height: SCREEN_HEIGHT * 0.9,
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
    headerBtn: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    cancelText: {
        color: Colors.text.secondary,
        fontSize: FontSize.md,
    },
    modalTitle: {
        fontSize: FontSize.lg,
        fontWeight: "bold",
        color: Colors.text.primary,
    },
    publishBtn: {
        borderRadius: 16,
        minWidth: 70,
    },
    publishBtnText: {
        color: Colors.dark.background,
        fontSize: FontSize.sm,
        fontWeight: "bold",
    },
    userInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    userTextContainer: {
        gap: 2,
    },
    usernameText: {
        color: Colors.text.primary,
        fontSize: FontSize.md,
        fontWeight: "bold",
    },
    privacyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        paddingVertical: 2,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.sm,
        gap: 4,
    },
    privacyText: {
        color: Colors.text.secondary,
        fontSize: FontSize.xs,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    textInput: {
        color: Colors.text.primary,
        fontSize: FontSize.md,
        lineHeight: 22,
        minHeight: 120,
        textAlignVertical: "top",
        paddingVertical: Spacing.sm,
    },
    mediaContainer: {
        marginTop: Spacing.md,
        height: 160,
    },
    mediaScroll: {
        flexDirection: "row",
    },
    mediaWrapper: {
        position: "relative",
        marginRight: Spacing.sm,
        borderRadius: BorderRadius.md,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    mediaPreview: {
        width: 120,
        height: 160,
        resizeMode: "cover",
    },
    videoBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 12,
        padding: 4,
    },
    removeMediaBtn: {
        position: "absolute",
        top: 4,
        right: 4,
        zIndex: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 12,
    },
    addMoreMediaCard: {
        width: 120,
        height: 160,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "rgba(255, 255, 255, 0.2)",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        justifyContent: "center",
        alignItems: "center",
        gap: Spacing.xs,
    },
    addMoreText: {
        color: Colors.text.secondary,
        fontSize: FontSize.xs,
    },
    bottomBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.08)",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: "rgba(20, 20, 20, 0.95)",
    },
    bottomBarText: {
        color: Colors.text.primary,
        fontSize: FontSize.sm,
        fontWeight: "600",
    },
    actionRow: {
        flexDirection: "row",
        gap: Spacing.md,
    },
    actionIconBtn: {
        padding: Spacing.xs,
    },
});
