// /*
// data structure for users & rooms

// users[name] = {
//   socket: socket,
//   rooms: []
// };

// */
// const users = {},
//   rooms = {};

// io.on('connection', (socket) => {
//   // authenticate user
//   socket.on('user:auth', async (data) => {
//     const { token } = data;

//     // verify token
//     jwt.verify(token, JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         return socket.emit('user:auth', {
//           status: 'error',
//           message: 'Invalid token',
//         });
//       }
//       // get user data
//       const { email } = decoded;
//       console.log('decoded', decoded);
//       const { data, error } = await supabase.from('user').select('*').or(`email.eq.${email}, username.eq.${email}`);

//       if (error) {
//         return socket.emit('user:auth', {
//           status: 'error',
//           message: error.message,
//         });
//       }

//       if (!data.length) {
//         return socket.emit('user:auth', {
//           status: 'error',
//           message: 'User not found',
//         });
//       }

//       const user = data[0];

//       socket.emit('user:auth', {
//         status: 'ok',
//         data: {
//           id: user.user_id,
//           email: user.email,
//           username: user.username,
//           name: user.name,
//           at: user.timestamp,
//         },
//       });
//     });

//     socket.on('user:setup', (data) => {
//       const { username } = data;
//       users[username] = {
//         socket,
//         rooms: [],
//       };
//       io.emit('user:join', Object.keys(users));
//     });

//     socket.on('user:sendFriendRequest', (data) => {
//       const { sender, receiver } = data;
//       const sUsername = sender.username, // sender username
//         rUsername = receiver.username; // receiver username
//       if (users[rUsername]) {
//         // check if receiver is online
//         const room = [sender.id, receiver.id].sort().join('-'); // room id
//         socket.join(room);
//         users[rUsername].socket.join(room);

//         // save room
//         users[sUsername].rooms = [...users[sUsername].rooms, room];
//         users[rUsername].rooms = [...users[rUsername].rooms, room];

//         rooms[room] = {
//           id: room,
//           sender,
//           receiver,
//         };
//         // broadcase to receiver
//         io.to(room).emit('user:receiveFriendRequest', {
//           id: room, // room id
//           createdAt: new Date().toISOString(),
//           sender,
//           receiver,
//           message: {
//             text: `First Connection`,
//             id: uuidv4(),
//             senderId: sender.id,
//             receiverId: receiver.id,
//             attachment: '',
//             emoji: '',
//             link: '',
//             createdAt: new Date().toISOString(),
//             updatedAt: '',
//             deletedAt: '',
//             reply: {
//               id: '',
//               text: '',
//               senderId: '',
//               receiverId: '',
//               attachment: '',
//               emoji: '',
//               link: '',
//               createdAt: '',
//               updatedAt: '',
//               deletedAt: '',
//             },
//           },
//         });

//         // users[rUsername].socket.emit('user:receiveFriendRequest', {
//         //   id,
//         //   email: sUsername,
//         // });
//       } else {
//         // if user is offline
//       }
//     });

//     // user:chatmessage event handler
//     socket.on('ExchangeChatMessage', (data) => {
//       const { message, sender, receiver } = data;

//       const senderId = sender.id,
//         receiverId = receiver.id;
//       // get the room from the rooms object
//       const room = [senderId, receiverId].sort().join('-');

//       // check if room is in the rooms object
//       if (rooms[room]) {
//         // users are friends

//         //check if receiver is online
//         if (users[receiver.username]) {
//           // receiver is online
//           io.to(room).emit('ExchangeChatMessage', {
//             message,
//             sender, //todo: change data str.
//             receiver,
//             at: new Date().toISOString(),
//           });
//         } else {
//           // receiver is offline
//           // save message to db
//         }
//       } else {
//         // users are not friends
//       }

//       // console.log("user:chatmessage:send", data);
//       // io.to(room).emit("user:chatmessage:send", data);
//     });

//     // get a user data from request header ;
//     // console.log('data', data);

//     // socket.join(data.room);

//     // io.to(data.room).emit('user-connected', data.user);
//   });

//   socket.on('chatmessage:send', (data) => {
//     io.to(data.room).emit('chatmessage:send', data);
//     // console.log('data', data);
//   });
// });
