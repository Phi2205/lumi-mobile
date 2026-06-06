export interface PostUser {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  has_story: boolean;
}

export interface PostMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  order: number;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  has_liked: boolean;
  user: PostUser;
  post_media: PostMedia[];
  original_post: Post | null;
}

export interface PostResponse {
  success: boolean;
  message: string;
  data: Post[];
}

export interface LikeUser {
  id: string;
  name: string;
  avatar_url: string | null;
  username?: string;
}

export interface LikeItem {
  post_id: string;
  user_id: string;
  user: LikeUser;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LikesResponse {
  success: boolean;
  message: string;
  data: {
    items: LikeItem[];
    pagination: PaginationInfo;
  };
}

export interface CommentUser {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
}

export interface CommentItem {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  depth: number;
  created_at: string;
  user: CommentUser;
  replies: CommentItem[];
  has_replies: boolean;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: {
    items: CommentItem[];
    pagination: PaginationInfo;
  };
}

export interface CreateCommentResponse {
  success: boolean;
  message: string;
  data: CommentItem;
}

