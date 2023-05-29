import { supabase } from '../../db/index.js';

//
async function userAllChatRoomLoadHandler(id) {
  const { data: userChatCollectionData, error: userChatCollectionError } = await supabase.from('all_chats').select('*').or(`sender_id.eq.${id},receiver_id.eq.${id}`);

  //db query not successful
  if (userChatCollectionError) {
    return {
      message: userChatCollectionError.message,
      status: 'error',
      statusCode: 401,
    };
  }

  // connection not found
  if (!userChatCollectionData.length) {
    return {
      message: 'Connection not found',
      status: 'error',
      statusCode: 401,
    };
  }

  const getUserChats = async (chatIds) => {
    const chatPromises = chatIds.map(async (chatId) => {
      const { data, error } = await supabase.from('chat_messages').select(`all_chats (*), messages (*)`).eq('all_chats.id', chatId);
      if (error) {
        return { message: error.message, status: 'error', statusCode: 401 };
      }
      if (!data.length) {
        return { message: 'Connection not found', status: 'error', statusCode: 401 };
      }
      return data;
    });

    return Promise.all(chatPromises);
  };

  const userAllChats = await getUserChats(userChatCollectionData.map((chat) => chat.id));

  return userAllChats;
}

export default userAllChatRoomLoadHandler;
