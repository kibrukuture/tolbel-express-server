import { rooms, users } from '../../datastr/index.js';
import saveChatMessageDbHandler from '../../socket_related_db/saveChatMessageDbHandler.js';
import { supabase } from '../../../db/index.js';

// user:chatmessage event handler
async function onChatMessage(socket, data) {
  const { message, roomId, sender, friend } = data;

  // // text: caption,
  // sender: user,
  // attachment: binFile,
  // friend,
  // roomId: currentOpenChatId,

  // console.log('onChatMessage', message, roomId, sender, friend);
  // check if users are friends

  /*
     message,
      room: currentOpenChatId,
      sender: user,
      friend: currentRoom.friend,

  */

  // // save message to dbs
  // console.log(initiatedBy.name, ' sent ', message + ' to ' + receiver.name);
  // const {
  //   status,
  //   message: msg,
  //   statusCode,
  // } = await saveChatMessageDbHandler({
  //   sender: initiatedBy.id === sender.id ? receiver : sender,
  //   receiver,
  //   text: message,
  //   initiatedBy,
  //   room: id,
  //   type: 'chat',
  //   createdAt,
  //   messageId,
  // });

  // chat messages could not be saved to db.
  // if (status !== 'success') {
  //   // on error
  //   return socket.emit('ExchangeChatMessage', {
  //     status,
  //     message: msg,
  //     statusCode,
  //   });
  // }

  // receiver from other end is online
  if (users[friend.userName]) {
    console.log('Message text: ', message.text);
    users[friend.userName].socket.emit('ExchangeChatMessage', {
      message,
      roomId,
      sender,
    });
  }
}

export default onChatMessage;
