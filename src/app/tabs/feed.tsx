import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui";
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface Post {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  imageUrls: string[];
  caption: string;
  likes: number;
  comments: number;
  createdAt: Date;
  isLiked: boolean;
  isBookmarked: boolean;
  location?: string;
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
    user: {
      id: "1",
      username: "sarah_wilson",
      avatar: "https://i.pravatar.cc/150?img=1",
      isVerified: true,
    },
    imageUrls: ["https://picsum.photos/600/600?random=50"],
    caption: "Beautiful sunset at the beach today! Nature never fails to amaze me.",
    likes: 1234,
    comments: 56,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isLiked: false,
    isBookmarked: false,
    location: "Malibu Beach, CA",
  },
  {
    id: "2",
    user: {
      id: "2",
      username: "mike_adventures",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    imageUrls: [
      "https://picsum.photos/600/600?random=51",
      "https://picsum.photos/600/600?random=52",
    ],
    caption: "Mountain hiking is the best therapy! Who else agrees?",
    likes: 892,
    comments: 34,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isLiked: true,
    isBookmarked: true,
    location: "Rocky Mountains",
  },
  {
    id: "3",
    user: {
      id: "3",
      username: "foodie_emma",
      avatar: "https://i.pravatar.cc/150?img=3",
      isVerified: true,
    },
    imageUrls: ["https://picsum.photos/600/600?random=53"],
    caption: "Homemade pasta from scratch! Recipe coming soon on my blog.",
    likes: 2567,
    comments: 123,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "4",
    user: {
      id: "4",
      username: "travel_john",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    imageUrls: [
      "https://picsum.photos/600/600?random=54",
      "https://picsum.photos/600/600?random=55",
      "https://picsum.photos/600/600?random=56",
    ],
    caption: "Paris is always a good idea. The city of lights never disappoints!",
    likes: 4521,
    comments: 234,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isLiked: false,
    isBookmarked: false,
    location: "Paris, France",
  },
];

export default function FeedScreen() {
  const [posts, setPosts] = useState(mockPosts);
  const [refreshing, setRefreshing] = useState(false);

  const formatTime = (date: Date) => {
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
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const renderStory = ({ item, index }: { item: Story; index: number }) => {
    const isMyStory = item.id === "my";

    return (
      <TouchableOpacity
        style={[styles.storyItem, index === 0 && styles.storyItemFirst]}
        onPress={() => {
          if (isMyStory) {
            // Open camera or story creation
          } else {
            // router.push(`/story/${item.user.id}`);
          }
        }}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.storyAvatarContainer,
            item.hasUnseenStory && styles.storyUnseen,
            !item.hasUnseenStory && !isMyStory && styles.storySeen,
          ]}
        >
          <Avatar
            source={item.user.avatar}
            name={item.user.username}
            size="lg"
          />
          {isMyStory && (
            <View style={styles.addStoryBadge}>
              <Ionicons name="add" size={14} color={Colors.text.primary} />
            </View>
          )}
        </View>
        <Text style={styles.storyUsername} numberOfLines={1}>
          {item.user.username}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.postUserInfo}
        //   onPress={() => router.push(`/profile/${item.user.id}`)}
        >
          <Avatar
            source={item.user.avatar}
            name={item.user.username}
            size="md"
          />
          <View style={styles.postUserText}>
            <View style={styles.postUsernameRow}>
              <Text style={styles.postUsername}>{item.user.username}</Text>
              {item.user.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.brand.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            {item.location && (
              <Text style={styles.postLocation}>{item.location}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postMoreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={Colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Post Images */}
      <View style={styles.postImageContainer}>
        {item.imageUrls.length === 1 ? (
          <Image
            source={{ uri: item.imageUrls[0] }}
            style={styles.postImage}
            resizeMode="cover"
          />
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {item.imageUrls.map((url, index) => (
              <Image
                key={index}
                source={{ uri: url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}
        {item.imageUrls.length > 1 && (
          <View style={styles.imageIndicator}>
            {item.imageUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  index === 0 && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={26}
              color={item.isLiked ? Colors.status.error : Colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.postActionButton}>
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.postActionButton}>
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => handleBookmark(item.id)}
        >
          <Ionicons
            name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={
              item.isBookmarked ? Colors.brand.primary : Colors.text.primary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Post Info */}
      <View style={styles.postInfo}>
        <Text style={styles.postLikes}>{formatNumber(item.likes)} likes</Text>
        <View style={styles.postCaptionContainer}>
          <Text style={styles.postCaption}>
            <Text style={styles.postCaptionUsername}>{item.user.username}</Text>
            {"  "}
            {item.caption}
          </Text>
        </View>
        {item.comments > 0 && (
          <TouchableOpacity>
            <Text style={styles.postViewComments}>
              View all {formatNumber(item.comments)} comments
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.postTime}>{formatTime(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.background, "#252525"]}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lumi</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons
                name="heart-outline"
                size={26}
                color={Colors.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/tabs/feed")}
            >
              <Ionicons
                name="chatbubble-outline"
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
          ListHeaderComponent={
            <FlatList
              horizontal
              data={mockStories}
              renderItem={renderStory}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesList}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    color: Colors.brand.primary,
    fontStyle: "italic",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  feedContent: {
    paddingBottom: 100,
  },
  storiesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.lightBorder,
  },
  storyItem: {
    alignItems: "center",
    marginHorizontal: Spacing.sm,
    width: 70,
  },
  storyItemFirst: {
    marginLeft: 0,
  },
  storyAvatarContainer: {
    padding: 2,
    borderRadius: 32,
  },
  storyUnseen: {
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  storySeen: {
    borderWidth: 2,
    borderColor: Colors.glass.lightBorder,
  },
  storyUsername: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  addStoryBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  postContainer: {
    marginBottom: Spacing.lg,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
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
  postUsernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  postUsername: {
    fontSize: FontSize.base,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  verifiedIcon: {
    marginLeft: Spacing.xs,
  },
  postLocation: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
  },
  postMoreButton: {
    padding: Spacing.xs,
  },
  postImageContainer: {
    width: width,
    height: width,
    backgroundColor: Colors.dark.card,
  },
  postImage: {
    width: width,
    height: width,
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
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  postActionsLeft: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  postActionButton: {
    padding: Spacing.xs,
  },
  postInfo: {
    paddingHorizontal: Spacing.lg,
  },
  postLikes: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  postCaptionContainer: {
    marginBottom: Spacing.xs,
  },
  postCaption: {
    fontSize: FontSize.sm,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  postCaptionUsername: {
    fontWeight: "600",
  },
  postViewComments: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
  },
  postTime: {
    fontSize: FontSize.xs,
    color: Colors.text.muted,
    textTransform: "uppercase",
  },
});