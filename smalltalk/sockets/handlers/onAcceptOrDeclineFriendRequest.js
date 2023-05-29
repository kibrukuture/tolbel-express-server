import { users, rooms } from '../../datastr/index.js';
import { supabase } from '../../../db/index.js';
import io from '../../index.js';
import saveChatMessageDbHandler from '../../socket_related_db/saveChatMessageDbHandler.js';
import getChatRooms from '../../socket_related_db/getChatRooms.js';

// user:handle-accept-decline-request
async function onAcceptOrDeclineFriendRequest(socket, data) {
  const { friendRequestSendingUser, friendRequestReceivingUser, action } = data; // action: "accept", "decline", "purgatory_state"

  const roomId = [friendRequestSendingUser.userId, friendRequestReceivingUser.userId].sort().join('-');

  let friendRequestAcceptedQuery, declinedFriendRequestQuery;
  if (action === 'accept') {
    friendRequestAcceptedQuery = await supabase.from('privateroom').update({ accepted: true }).eq('roomId', roomId).select('*');
  } else if (action === 'decline') {
    friendRequestAcceptedQuery = await supabase.from('privateroom').delete().eq('roomId', roomId).select('*');

    declinedFriendRequestQuery = await supabase
      .from('declinedfriendrequest')
      .insert([{ requestSenderId: friendRequestSendingUser.userId, requestDeclinerId: friendRequestReceivingUser.userId, requestDeclineId: roomId }])
      .select('*');
  } else if (action === 'purgatory_state') {
    // purgatory state , user has not accepted or declined the request yet.
    friendRequestAcceptedQuery = await supabase
      .from('privateroom')
      .update({
        inactive: true,
      })
      .eq('roomId', roomId)
      .select('*');
  }

  if (friendRequestAcceptedQuery.error) {
    return socket.emit('user:accepted-request', {
      status: 'error',
      message: friendRequestAcceptedQuery.error.message,
      statusCode: 500,
    });
  }

  //   friend request accepted
  if (friendRequestAcceptedQuery.data[0].accepted) {
    // save chat message
    const {
      status: saveChatMessageStatus,
      message: saveChatMessageMessage,
      statusCode: saveChatMessageStatusCode,
    } = await saveChatMessageDbHandler({
      text: 'You are now connected',
      roomId,
      type: 'friend_request',
      senderId: friendRequestReceivingUser.userId,
    });

    /**
     *  messageId: uuidv4(),
      roomId: currentOpenChatId,
      senderId: user.userId!,
      text: chatMessage,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      message: [],
      replyId: null,
      emoji: '',
      link: null,
      attachment: null,
     */

    //  problem saving chat message to db
    if (saveChatMessageStatus !== 'ok') {
      return socket.emit('OnFriendRequestAcceptOrDeclineMessageStoreFailed', {
        saveChatMessageStatus,
        saveChatMessageMessage,
        saveChatMessageStatusCode,
      });
    }

    const { rooms } = await getChatRooms(friendRequestReceivingUser.userId);

    // console.log('request accepted & rooms are:', rooms);

    if (users[friendRequestSendingUser.userName]) {
      // friend request sender is online
      socket.join(roomId);
      users[friendRequestSendingUser.userName].socket.join(roomId);

      io.to(roomId).emit('FriendRequestAccepted', {
        rooms,
        roomId,
      });
    }
    // friend request sender is offline ()
    socket.emit('FriendRequestAccepted', {
      rooms,
      roomId,
    });
  }
}

export default onAcceptOrDeclineFriendRequest;
