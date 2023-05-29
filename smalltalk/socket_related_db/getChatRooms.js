import { supabase } from '../../db/index.js';

async function getChatRooms(userId) {
  const whichUser = await supabase.from('privateroom').select('*').or(`userOneId.eq.${userId}, userTwoId.eq.${userId}`).single();

  // check if room does not exist.
  if (whichUser.error) {
    return {
      status: 'error',
      message: whichUser.error.message,
    };
  }

  if (!whichUser.data) {
    return {
      status: 'error',
      message: 'room does not exist',
    };
  }

  let whichUserId;
  if (whichUser.data.userOneId == userId) {
    whichUserId = 'userTwoId';
  } else {
    whichUserId = 'userOneId';
  }

  const allRoomsQuery = await supabase.from('privateroom').select(`*, user!privateroom_${whichUserId}_fkey(*),message(*,link(*), attachment(*), message(*))`).is('message.replyId', null).or(`userOneId.eq.${userId}, userTwoId.eq.${userId}`);

  if (allRoomsQuery.error) {
    return {
      status: 'error',
      message: allRoomsQuery.error.message,
    };
  }

  return {
    status: 'ok',
    message: 'all rooms fetched',
    rooms: allRoomsQuery.data,
  };
}

export default getChatRooms;
