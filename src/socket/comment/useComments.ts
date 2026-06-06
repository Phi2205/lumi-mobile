import { useEffect } from "react";
import { connectSocket } from "@/lib/socket";
import {
  joinPostRoom,
  onNewComment,
  offNewComment,
  onDeleteComment,
  offDeleteComment,
} from "./comment.socket";

export const useCommentRealtime = (
  postId: string,
  onReceive: (comment: any) => void,
  onDelete: (data: {post_id: string, comment_id: string}) => void
) => {
  useEffect(() => {
    if (!postId) return;

    connectSocket().then(() => {
      joinPostRoom(postId);
    });
    
    onNewComment(onReceive);
    onDeleteComment(onDelete);

    return () => {
      offNewComment(onReceive);
      offDeleteComment(onDelete);
    };
  }, [postId]);
};
