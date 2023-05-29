import { supabase } from '../../../db/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { equal } from 'assert';
dotenv.config();

// env variables
const { JWT_SECRET } = process.env;

// authorizes user
async function onUserAuth(socket, data) {
  const { token, user } = data;

  // verify token
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return socket.emit('user:auth', {
        status: 'error',
        message: 'Invalid token',
      });
    }
    // get user data
    const { email } = decoded; // email or username depending on how user signed in.
    const userQuery = await supabase.from('user').select('*').or(`email.eq.${email}, userName.eq.${email}`);

    if (userQuery.error) {
      return socket.emit('AuthenticateUser', {
        status: 'error',
        message: userQuery.error.message,
      });
    }

    if (!userQuery.data.length) {
      return socket.emit('AuthenticateUser', {
        status: 'error',
        message: 'User not found',
      });
    }

    socket.emit('AuthenticateUser', {
      status: 'ok',
      message: 'User authenticated',
      user,
    });
  });

  // console.log('##################################:OnAuth:################################\n\n');

  // const allRoomsQuery = await supabase.from('message').select(`*, link(*), attachment(*),message(*)`).eq('roomId', '788030b5-66c1-452e-9f93-f89c1efc9e04-fba6efe1-fbbb-4617-bd75-92dec14fa3c9').is('replyId', null);
  // const allRoomsQuery = await supabase.from('privateroom').select(`*, user!privateroom_userOneId_fkey(*),message(*,link(*), attachment(*), message(*))`).is('message.replyId', null);
  // const allRoomsQuery = await supabase.from('privateroom').select(`*, message(*,link(*), attachment(*), message(*))`).is('message.replyId', null).or(`userOneId.eq.${user.userId}, userTwoId.eq.${user.userId}`);
  // const whichUserId = await supabase.from('privateroom').select('*').or(`userOneId.eq.${'788030b5-66c1-452e-9f93-f89c1efc9e04'}, userTwoId.eq.${'788030b5-66c1-452e-9f93-f89c1efc9e04'}`).single();
  // // const fns = await supabase.rpc('get_privateroom_data');
  // console.log('##################################:OnAuth:################################\n\n', whichUserId);
}

export default onUserAuth;

// .leftJoin('users', `users.id`, `=`, `privaterooms.user_id`)
// .select(`*, users(id, userName, email)`)
// .eq(`users.id`, `${user.id}`);.select(`*, users(id, userName, email)`).eq(`users.id`, `${user.id}`).eq(`private`, `true`);
/*
const { data, error } = await supabase.from('teams').select(`
  id,
  team_name,
  users ( id, name )
`)
/*/
