import { users, rooms } from '../../datastr/index.js';
import io from '../../index.js';

export default function onDeleteConversation(socket, data) {
  const { messageId, roomId, deletedBy, friend } = data;

  //   delete the conversation from db

  //   both are online
  if (users[friend.userName] && users[deletedBy.userName]) {
    console.log(deletedBy.name, ' is deleting the conversation', ' messageId ', messageId);
    socket.join(roomId);
    users[friend.userName].socket.join(roomId);

    io.to(roomId).emit('onDeleteConversation', {
      ...data,
    });
  }
}
