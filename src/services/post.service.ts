import { PostResponse } from "@/types/post.types";

export const PostService = {
    async getFeed(limit: number = 10): Promise<PostResponse> {
        // const response = await axiosInstance.get<PostResponse>(`/posts/recommendations?limit=${limit}`);
        const response: { data: PostResponse } = {
            data: {
                "success": true,
                "message": "Recommended posts fetched successfully",
                "data": [
                    {
                        "id": "16",
                        "user_id": "3",
                        "content": "xin chào",
                        "created_at": "2026-06-03T14:51:49.179Z",
                        "like_count": 0,
                        "comment_count": 0,
                        "share_count": 0,
                        "has_liked": false,
                        "user": {
                            "id": "3",
                            "username": "phi.ptit",
                            "name": "Phi PTIT",
                            "avatar_url": "https://res.cloudinary.com/dquqfxcag/image/upload/v1776093719/avatars/1776093718196-avatar-con-gian-cute-5-1.jpg.jpg",
                            "has_story": false
                        },
                        "post_media": [],
                        "original_post": null
                    },
                    {
                        "id": "15",
                        "user_id": "3",
                        "content": "",
                        "created_at": "2026-06-03T14:36:46.572Z",
                        "like_count": 0,
                        "comment_count": 0,
                        "share_count": 0,
                        "has_liked": false,
                        "user": {
                            "id": "3",
                            "username": "phi.ptit",
                            "name": "Phi PTIT",
                            "avatar_url": "https://res.cloudinary.com/dquqfxcag/image/upload/v1776093719/avatars/1776093718196-avatar-con-gian-cute-5-1.jpg.jpg",
                            "has_story": false
                        },
                        "post_media": [
                            {
                                "id": "17",
                                "media_url": "https://res.cloudinary.com/dquqfxcag/image/upload/v1780497405/posts/1780497403428-pexels-photonova-2839837.jpg.jpg",
                                "media_type": "image",
                                "order": 0
                            },
                            {
                                "id": "18",
                                "media_url": "https://res.cloudinary.com/dquqfxcag/video/upload/sp_auto/reels/ff3d6hfbzi9yoa6vllyy.m3u8",
                                "media_type": "video",
                                "order": 1
                            }
                        ],
                        "original_post": null
                    }
                ]
            }
        };
        return response.data;
    }
};   