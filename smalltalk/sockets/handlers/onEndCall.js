import { users } from '../../datastr/index.js';
export default function onEndCall(socket, data) {
  const { remotePeer, roomId } = data;

  // Handshake with remote peer
  if (users[remotePeer.userName]) {
    console.log('onEndCall');
    socket.join(roomId);
    users[remotePeer.userName].socket.join(roomId);

    // broadcast to all except sender
    users[remotePeer.userName].socket.emit('EndCall', {
      roomId,
    });
  }
}
