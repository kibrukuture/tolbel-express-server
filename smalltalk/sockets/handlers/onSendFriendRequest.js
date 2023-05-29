import { users, rooms } from '../../datastr/index.js';
import { supabase } from '../../../db/index.js';
import io from '../../index.js'; // broadcase to ever room where they are subscribed to the room id

// handle send friend request
async function onSendFriendRequest(socket, data) {
  const { sender, receiver } = data,
    rUserName = receiver.userName,
    roomId = [sender.userId, receiver.userId].sort().join('-'); // room id

  // add room to "all_chats" table"

  const createChatRoomOnFriendRequest = await supabase.from('privateroom').insert([
    {
      roomId,
      userOneId: sender.userId,
      userTwoId: receiver.userId,
      accepted: false,
      inactive: false,
    },
  ]);

  if (createChatRoomOnFriendRequest.error) {
    return socket.emit('SendFriendRequest', {
      status: 'error',
      message: createChatRoomOnFriendRequest.error.message,
      statusCode: 500,
    });
  }

  // check if receiver is online
  if (users[rUserName]) {
    // broadcase to receiver
    users[rUserName].socket.emit('PushFriendRequestNotification', sender);
  }
}

export default onSendFriendRequest;
