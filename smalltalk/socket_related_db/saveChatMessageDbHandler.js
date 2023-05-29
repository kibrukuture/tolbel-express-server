import { supabase } from '../../db/index.js';

// save chat message to db
async function saveChatMessageDbHandler({ text, roomId, type, senderId, replyId = null, emoji = '', updatedAt = null }) {
  // create message
  const { data: messageData, error: messageError } = await supabase
    .from('message')
    .insert({
      text,
      roomId,
      senderId,
      replyId,
      emoji,
      updatedAt,
    })
    .select('*');

  // db query not successful
  if (messageError) {
    return {
      message: messageError.message,
      status: 'error',
      statusCode: 401,
    };
  }

  if (!messageData.length) {
    return {
      message: 'Message not created',
      status: 'error',
      statusCode: 401,
    };
  }

  // return success
  return {
    message: type ? `Chat room with Id ${roomId} created.` : `Message with Id ${messageData[0].id} created.`,
    status: 'ok',
    statusCode: 200,
  };
}

export default saveChatMessageDbHandler;
