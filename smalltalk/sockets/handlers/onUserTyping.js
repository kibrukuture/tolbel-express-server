import io from '../../index.js';
function onUserTyping(socket, data) {
  const { sender, receiver, id, initiatedBy } = data;
  //   'user:typing'
  io.to(id).emit('user:typing', {
    id,
    typing: true,
    initiatedBy,
    sender,
    receiver,
  });
  console.log('user:typing');
}

export default onUserTyping;
