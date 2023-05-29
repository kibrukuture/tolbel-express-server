// configs & util fns
import { Server } from 'socket.io';
import { app } from '../index.js';
import { createServer } from 'http';
import { lastSeen } from './datastr/index.js';
import dotenv from 'dotenv';
dotenv.config();

// handlers
import onDisconnect from './sockets/handlers/ondisconnect.js';
import onUserAuth from './sockets/handlers/onUserAuth.js';
import onUserSetup from './sockets/handlers/onUserSetup.js';
import onSendFriendRequest from './sockets/handlers/onSendFriendRequest.js';
import onChatMessage from './sockets/handlers/onChatMessage.js';
import onUserTyping from './sockets/handlers/onUserTyping.js';
import onAcceptOrDeclineFriendRequest from './sockets/handlers/onAcceptOrDeclineFriendRequest.js';
import onStartCallingRemotePeer from './sockets/handlers/onStartCallingRemotePeer.js';
import onCallRejected from './sockets/handlers/onCallRejected.js';
import onEndCall from './sockets/handlers/onEndCall.js';
import onCallAccepted from './sockets/handlers/onCallAccepted.js';
import onRemotePeerCallEnd from './sockets/handlers/onRemotePeerCallEnd.js';
import onDeleteConversation from './sockets/handlers/onDeleteConversation.js';

// server setup
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.REMOTE_ALLOW_ORIGIN || 'http://localhost:3000/',
  },
});

// listen for connection
io.on('connection', (socket) => {
  socket.on('AuthenticateUser', (data) => onUserAuth(socket, data)); // auth user
  socket.on('SetupUser', (data) => onUserSetup(socket, data)); // setup user
  socket.on('SendFriendRequest', (data) => onSendFriendRequest(socket, data)); // friend request
  socket.on('ExchangeChatMessage', (data) => onChatMessage(socket, data)); // chat message
  socket.on('user:typing', (data) => onUserTyping(socket, data)); // typing
  socket.on('AcceptOrDeclineFriendRequest', (data) => onAcceptOrDeclineFriendRequest(socket, data));
  socket.on('CallRejected', (data) => onCallRejected(socket, data)); // video call rejection
  socket.on('StartCallingRemotePeer', (data) => onStartCallingRemotePeer(socket, data)); // start video call   ;
  socket.on('EndCall', (data) => onEndCall(socket, data)); // end video call
  socket.on('CallAccepted', (data) => onCallAccepted(socket, data)); // end video call
  socket.on('RemotePeerCallEnd', (data) => onRemotePeerCallEnd(socket, data)); // end video call
  socket.on('DeleteConversation', (data) => onDeleteConversation(socket, data));
  socket.on('disconnect', () => onDisconnect(socket, lastSeen)); // disconnect
  // socket.on('user:stopTyping', (data) => onStopTyping(socket, data)); // stop typing
  // socket.on('user:acceptFriendRequest', (data) => onAcceptFriendRequest(socket, data)); // accept friend request
  // socket.on('user:rejectFriendRequest', (data) => onRejectFriendRequest(socket, data)); // reject friend request
});

app.get('/', (req, res) => {
  console.log('tolbel Inc. server is running', process.env.NODE_ENV);
  res.send('Welcome to tolbel Inc.');
});
// listen for connection
server.listen(process.env.PORT || 4040, () => {
  console.log(`Listening at PORT No: ${process.env.PORT}`);
});

export default io;
