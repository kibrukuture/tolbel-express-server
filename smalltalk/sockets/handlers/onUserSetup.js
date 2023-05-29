import { users, lastSeen } from '../../datastr/index.js';
import io from '../../index.js';

function onUserSetup(socket, data) {
  // add user to users & rooms

  const { userName, userId } = data;
  // add user to users
  users[userName] = {
    socket,
    rooms: [],
  };
  // add user to lastSeen
  socket.customId = userId;
  socket.userName = userName;

  // console.log('Custom Id: ', socket.customId);
  lastSeen[userId] = {
    at: new Date(),
    socket,
    userId,
  };
  io.emit('JoinUserOnline', Object.keys(users));
  console.log(userName, ' now online', ' ======> ', ' Is in "Online User_Obj" (bool): ', !!users[userName]);
}

export default onUserSetup;
