// import io from '../../index.js';
// import onDisconnect from './handlers/ondisconnect.js';
// import onUserAuth from './handlers/onUserAuth.js';
// import onUserSetup from './handlers/onUserSetup.js';
// import onSendFriendRequest from './handlers/onSendFriendRequest.js';
// import onChatMessage from './handlers/onChatMessage.js';

// // listen for connection
// io.on('connection', (socket) => {
//   socket.on('user:auth', (data) => onUserAuth(socket, data)); // auth user
//   socket.on('user:setup', (data) => onUserSetup(socket, data)); // setup user
//   socket.on('user:sendFriendRequest', (data) => onSendFriendRequest(socket, data)); // friend request
//   socket.on('user:sendMessage', (data) => onChatMessage(socket, data)); // chat message
//   socket.on('disconnect', (data) => onDisconnect(socket, data)); // disconnect

//   console.log('a user connected');
// });
