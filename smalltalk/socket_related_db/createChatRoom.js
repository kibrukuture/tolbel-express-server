import { supabase } from '../../db/index.js';

async function createChatRoom(sender, receiver, room) {
  // check if sender is in "declined_friend_requests" of receiver.
  const declinedFriendRequestQuery = await supabase.from('declined_friend_requests').select('*').eq('id', sender.id).eq('to_whom', receiver.id);

  if (declinedFriendRequestQuery.data.length > 0) {
    return {
      status: 'declined',
      message: 'You can  not send friend request to this user.',
      statusCode: 200,
    };
  }
  // check if connection already exists
  const { data: connectionExist, error: connectionExistError } = await supabase.from('all_chats').select('*').eq('id', room); // room is the id of the chat

  // db query not successful
  if (connectionExistError) {
    return {
      message: connectionExistError.message,
      status: 'error',
      statusCode: 401,
    };
  }

  // connection already exists
  if (connectionExist.length) {
    return {
      message: 'Connection already exists',
      status: 'error',
      statusCode: 401,
    };
  }

  // create chat room  connection
  const { data: chatRoomConnectionData, error: chatRoomConnectionError } = await supabase
    .from('all_chats')
    .insert({
      id: room,
      created_at: new Date().toISOString(),
      sender_id: sender.id,
      receiver_id: receiver.id,
      accepted: false, //not accepted yet
    })
    .select('*');

  // db query not successful
  if (chatRoomConnectionError) {
    return {
      message: chatRoomConnectionError.message,
      status: 'error',
      statusCode: 401,
    };
  }

  if (!chatRoomConnectionData.length) {
    return {
      message: 'Connection not created',
      status: 'error',
      statusCode: 401,
    };
  }

  return {
    status: 'success',
    statusCode: '200',
    data: {
      ...chatRoomConnectionData,
    },
  };
}

export default createChatRoom;
