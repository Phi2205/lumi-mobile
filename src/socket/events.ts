export const SocketEvents = {
  // comment
  JOIN_POST: "join_post",
  NEW_COMMENT: "new_comment",
  DELETE_COMMENT: "delete_comment",

  // reel comment
  JOIN_REEL: "join_reel",
  LEAVE_REEL: "leave_reel",
  NEW_REEL_COMMENT: "new_reel_comment",
  DELETE_REEL_COMMENT: "delete_reel_comment",


  // message
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  CONVERSATION_UPDATED: "conversation_updated",
  MARK_READ: "mark_read",
  USER_READ_MESSAGE: "user_read_message",

  // notification
  RECEIVE_NOTIFICATION: "receive_notification",
} as const;
