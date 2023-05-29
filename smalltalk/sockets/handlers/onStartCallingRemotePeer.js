import { users } from '../../datastr/index.js';
export default function onStartCallingRemotePeer(socket, data) {
  const { caller, friend, roomId, flag } = data; // flag is either video or voice

  // remote peer online
  if (users[friend.userName]) {
    socket.join(roomId);
    users[friend.userName].socket.join(roomId);

    // emit to remote peer
    users[friend.userName].socket.emit('IncomingCall', {
      caller,
      friend,
      roomId,
      flag,
    });
    console.log(caller.name, ' is handshaking with ', friend.name);
    // emit to caller, change status to calling (online)
    socket.emit('RemotePeerOnline', { ...data });
  } else {
    // emit to caller, change status to calling (offline)
    socket.emit('RemotePeerOffline', { ...data });

    console.log('Remote Peer ', friend.name, ' is offline ', ' =====> Caller: ', caller.name);
  }
}
