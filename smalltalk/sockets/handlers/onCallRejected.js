import { users } from '../../datastr/index.js';
export default function onCallRejected(socket, data) {
  const { caller, roomId, friend } = data;

  // on video call rejected.
  if (users[caller.userName]) {
    // console.log('Handshake Over Websockt, Remote Peer Id:', friend.userId);
    socket.join(roomId);
    users[caller.userName].socket.join(roomId);

    // !remove this later
    console.log('Shaking Hand: ', data, 'users ', users);
    // broadcast to all except sender
    users[caller.userName].socket.emit('CallRejected', {
      roomId,
      caller,
      friend,
    });
  }
}
