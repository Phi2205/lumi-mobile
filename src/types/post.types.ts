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
