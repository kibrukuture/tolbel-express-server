import { supabase } from '../db/index.js';

const auth = async (email) => {
  const { data, error } = await supabase.from('user').select('*').or(`email.eq.${email}, userName.eq.${email}`);

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

  const user = data[0];
  return {
    status: 'ok',
    data: data[0],
  };
};

export default auth;
