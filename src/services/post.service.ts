import { PostResponse, LikesResponse, CommentsResponse, CreateCommentResponse } from "@/types/post.types";
import { axiosInstance } from "./axiosInstance";

// function mockdataLike(page: number, limit: number): LikesResponse {
//     const allUsers = Array.from({ length: 100 }, (_, i) => {
//         const idNum = i + 3;
//         return {
//             id: String(idNum),
//             username: idNum === 3 ? "phi.ptit" : `phi.ptit.${idNum - 3}`,
//             name: idNum === 3 ? "Phi PTIT" : `Phi PTIT ${idNum - 3}`,
//         };
//     });

//     const total = allUsers.length;
//     const totalPages = Math.ceil(total / limit);
//     const startIndex = (page - 1) * limit;
//     const endIndex = startIndex + limit;
//     const paginatedUsers = allUsers.slice(startIndex, endIndex);

//     const items = paginatedUsers.map(u => ({
//         post_id: "16",
//         user_id: u.id,
//         user: {
//             id: u.id,
//             username: u.username,
//             name: u.name,
//             avatar_url: "https://res.cloudinary.com/dquqfxcag/image/upload/v1776093719/avatars/1776093718196-avatar-con-gian-cute-5-1.jpg.jpg"
//         }
//     }));

//     return {
//         "success": true,
//         "message": "Likes fetched successfully",
//         "data": {
//             items,
//             "pagination": {
//                 total,
//                 page,
//                 limit,
//                 totalPages,
//                 "hasNextPage": page < totalPages,
//                 "hasPreviousPage": page > 1
//             }
//         }
//     };
// }

export const PostService = {
    async getFeed(limit: number = 10): Promise<PostResponse> {
        const response = await axiosInstance.get<PostResponse>(`/posts/recommendations?limit=${limit}`);
        // const response: { data: PostResponse } = {
        //     data: {
        //         "success": true,
        //         "message": "Recommended posts fetched successfully",
        //         "data": [
        //             {
        //                 "id": "16",
        //                 "user_id": "3",
        //                 "content": "xin chào",
        //                 "created_at": "2026-06-03T14:51:49.179Z",
        //                 "like_count": 3,
        //                 "comment_count": 0,
        //                 "share_count": 0,
        //                 "has_liked": false,
        //                 "user": {
        //                     "id": "3",
        //                     "username": "phi.ptit",
        //                     "name": "Phi PTIT",
        //                     "avatar_url": "https://res.cloudinary.com/dquqfxcag/image/upload/v1776093719/avatars/1776093718196-avatar-con-gian-cute-5-1.jpg.jpg",
        //                     "has_story": false
        //                 },
        //                 "post_media": [],
        //                 "original_post": null
        //             },
        //             {
        //                 "id": "15",
        //                 "user_id": "3",
        //                 "content": "",
        //                 "created_at": "2026-06-03T14:36:46.572Z",
        //                 "like_count": 0,
        //                 "comment_count": 0,
        //                 "share_count": 0,
        //                 "has_liked": false,
        //                 "user": {
        //                     "id": "3",
        //                     "username": "phi.ptit",
        //                     "name": "Phi PTIT",
        //                     "avatar_url": "https://res.cloudinary.com/dquqfxcag/image/upload/v1776093719/avatars/1776093718196-avatar-con-gian-cute-5-1.jpg.jpg",
        //                     "has_story": false
        //                 },
        //                 "post_media": [
        //                     {
        //                         "id": "17",
        //                         "media_url": "https://res.cloudinary.com/dquqfxcag/image/upload/v1780497405/posts/1780497403428-pexels-photonova-2839837.jpg.jpg",
        //                         "media_type": "image",
        //                         "order": 0
        //                     },
        //                     {
        //                         "id": "18",
        //                         "media_url": "https://res.cloudinary.com/dquqfxcag/video/upload/sp_auto/reels/ff3d6hfbzi9yoa6vllyy.m3u8",
        //                         "media_type": "video",
        //                         "order": 1
        //                     }
        //                 ],
        //                 "original_post": null
        //             }
        //         ]
        //     }
        // };
        console.log("Response data:", response.data);
        return response.data;
    },

    async like(postId: string): Promise<void> {
        await axiosInstance.post(`/posts/${postId}/like`);
    },
    async getLikeByPostId(postId: string, page: number = 1, limit: number = 10): Promise<LikesResponse> {
        const response = await axiosInstance.get<LikesResponse>(`/posts/${postId}/likes?page=${page}&limit=${limit}`);
        return response.data;
    },
    async getComments(postId: string, page: number = 1, limit: number = 10): Promise<CommentsResponse> {
        const response = await axiosInstance.get<CommentsResponse>(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
        return response.data;
    },
    async createComment(postId: string, content: string, parentId?: string): Promise<CreateCommentResponse> {
        const response = await axiosInstance.post<CreateCommentResponse>(`/posts/${postId}/comments`, { content, parentId });
        return response.data;
    }
};  
