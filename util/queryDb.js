import { supabase } from '../db/index.js';

//search and find a user in the database
const queryDatabase = async (query) => {
  let userName = '';
  if (query[0] === '@') {
    // userName query. remove the @
    userName = query.slice(1, query.length);
  }
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .ilike(userName ? 'userName' : 'email', userName ? `%${userName}%` : `%${query}%`);

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
  if (!data.length) {
    return {
      status: 'error',
      message: 'User not found',
    };
  }

  return {
    status: 'ok',
    data: data,
  };
};

export default queryDatabase;
