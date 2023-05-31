import { supabase } from '../db/index.js';
import ogs from 'open-graph-scraper';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { getAllowOrigin } from '../index.js';
import getChatRooms from '../smalltalk/socket_related_db/getChatRooms.js';
import sendAccountVerificationSMS from '../account-verification/mailSender.js';
dotenv.config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// handle sign in
export const signInUserMiddleware = async (req, res) => {
  const { email, password } = req.body;

  // look up users(from form email & username field is same)
  const { data, error } = await supabase
    .from('user')
    .select('*') /*.except("password")*/
    .or(`email.eq.${email}, userName.eq.${email}`);
  // db query not successful
  if (error) {
    return res.status(401).json({
      message: error.message,
    });
  }

  // user not found
  if (!data.length) {
    return res.status(401).json({
      message: 'User not found, please sign up',
    });
  }
  const userExist = await verifyUserExists(email, password);
  // user found
  if (userExist) {
    // token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.header('Access-Control-Allow-Origin', getAllowOrigin());
    return res.status(200).json({
      status: 'ok',
      token,
      user: {
        ...data[0],
      },
    });
  } else {
    // user found but password or email is incorrect
    return res.status(401).json({
      message: 'Invalid password or email, please try again',
    });
  }
};

export function generateJwtToken(payload, secretKey) {
  return jwt.sign(payload, secretKey, { algorithm: 'HS256' });
}

export function verifyJwtToken(token, secretKey) {
  try {
    const payload = jwt.verify(token, secretKey, { algorithm: 'HS256' });
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { error: 'TokenExpiredError' };
    } else {
      return { error: 'UnauthorizedError' };
    }
  }
}

export const tolbelAccountVerificationMiddleware = async (req, res) => {
  const { email, code, userName } = req.body;

  console.log(email, code, userName);

  const { data, error } = await supabase.from('signup').select('*').eq('email', email);

  if (error) {
    return res.status(401).json({
      message: error.message,
      status: 'error',
    });
  }

  if (data.length === 0) {
    return res.status(401).json({
      message: 'User not found, please sign up',
      status: 'error',
    });
  }

  const tempCode = code.trim().replace(/\s/g, '');

  console.log('&', tempCode, data[0].smsCode, 'request body: ', req.body);
  if (tempCode === data[0].smsCode + '') {
    const { data: onSignUpUserData, error: onSignUpUserError } = await supabase.from('user').insert({
      email,
      userName,
      name: data[0].name,
      password: data[0].password,
    });

    if (onSignUpUserError) {
      return res.status(401).json({
        message: onSignUpUserError.message,
        status: 'error',
      });
    }
    // delete user  from signup table
    const { data: onSignUpUserDeleteData, error: onSignUpUserDeleteError } = await supabase.from('signup').delete().eq('email', email);

    if (onSignUpUserDeleteError) {
      return res.status(401).json({
        message: onSignUpUserDeleteError.message,
        status: 'error',
      });
    }

    return res.status(200).json({
      status: 'ok',
    });
  }
};

export const tolbelAccountVerificationByUrlMiddleware = async (req, res) => {
  try {
    const { token, smsCode } = req.body;

    console.log(token, smsCode);

    const payload = verifyJwtToken(token, process.env.JWT_SECRET);
    console.log(payload);

    if (payload.email && payload.userName) {
      const { data, error } = await supabase.from('signup').select('*').eq('email', payload.email);

      if (error) {
        return res.status(401).json({
          message: error.message,
          status: 'error',
        });
      }
      // user already verified check first.
      if (data.length === 0) {
        return res.status(200).json({
          message: 'User already verified',
          status: 'ok',
        });
      }
      if (smsCode === data[0].smsCode + '') {
        const { data: onSignUpUserData, error: onSignUpUserError } = await supabase.from('user').insert({
          email: payload.email,
          userName: payload.userName,
          name: data[0].name,
          password: data[0].password,
        });

        if (onSignUpUserError) {
          return res.status(401).json({
            message: onSignUpUserError.message,
            status: 'error',
          });
        }
        // delete user  from signup table
        const { data: onSignUpUserDeleteData, error: onSignUpUserDeleteError } = await supabase.from('signup').delete().eq('email', payload.email);

        if (onSignUpUserDeleteError) {
          return res.status(401).json({
            message: onSignUpUserDeleteError.message,
            status: 'error',
          });
        }

        return res.status(200).json({
          status: 'ok',
        });
      }
    } else
      return res.status(401).json({
        message: 'Link expired',
        status: 'error',
      });
  } catch (e) {
    return res.status(401).json({
      message: e.message,
      status: 'error',
    });
  }
};

// handle sign up
export const signUpUserMiddleware = async (req, res) => {
  const { email, password, name, userName } = req.body;
  console.log(req.body);
  // email or password is missing
  if (!email.trim() || !password.trim() || !name.trim() || !userName.trim()) {
    return res.status(401).json({
      message: 'Either email or password is missing',
      status: 'error',
    });
  }

  // check if user already exist
  const { data: userExist, error: userExistError } = await supabase.from('user').select('*').eq('email', email);

  // db query not successful
  if (userExistError) {
    return res.status(401).json({
      message: userExistError.message,
      status: 'error',
    });
  }

  // user already exist
  if (userExist.length) {
    return res.status(401).json({
      message: 'User already exist, please sign in',
      status: 'error',
    });
  }

  const generateSMSCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000);
    const formattedCode = code.toString().replace(/(\d{3})(\d{3})/, '$1 $2');

    return { code, formattedCode };
  };
  // hash a user password
  const hashedPassword = await hashPassword(password);
  const userSignUpJwtToken = generateJwtToken({ email, userName }, process.env.JWT_SECRET);
  const sms = generateSMSCode();
  // insert user into db
  const { data: onSignUpUserData, error: onSignUpUserError } = await supabase
    .from('signup')
    .insert({
      email,
      password: hashedPassword,
      name,
      userName,
      smsCode: sms.code,
      token: userSignUpJwtToken,
    })
    .select('*');

  // insertion not successful
  if (onSignUpUserError) {
    return res.status(401).json({
      message: onSignUpUserError.message,
      status: 'error',
    });
  }

  const url = process.env.REMOTE_ALLOW_ORIGIN + `/verify-account?token=${userSignUpJwtToken}&smsCode=${sms.code}`;

  const accountVerif = await sendAccountVerificationSMS(sms.formattedCode, url, name);
  console.log(accountVerif, url);
  if (accountVerif.status === 'error') {
    return res.status(401).json({
      ...accountVerif,
    });
  }

  // user created
  return res.status(200).json({
    status: 'ok',
    message: 'Success in signing up. Please verify your account',
  });
};

export const verifyAccountMiddleware = async (req, res) => {
  const { token, smsCode } = req.query;
};

export const logInCheckUserMiddleware = async (req, res) => {
  console.log('User logged In.');
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decodedToken;

    const { data, error } = await supabase.from('user').select('*').eq('email', email);

    // db query not successful
    if (error) {
      return res.status(401).json({
        message: error.message,
        status: 'error',
      });
    }

    // user not found
    if (!data.length) {
      return res.status(401).json({
        message: 'User not found, please sign up',
        status: 'error',
      });
    }

    // user found
    if (data.length) {
      // token
      res.header('Access-Control-Allow-Origin', getAllowOrigin());
      return res.status(200).json({
        status: 'ok',
        data: {
          id: data[0].user_id,
          email: data[0].email,
          username: data[0].username,
          name: data[0].name,
          createdAt: data[0].timestamp,
        },
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message,
      status: 'error',
    });
  }
};

export const verifyUserExists = async (email, password) => {
  try {
    const { data } = await supabase.from('user').select('*').or(`email.eq.${email}, username.eq.${email}`);
    const match = await bcrypt.compare(password, data[0]?.password);
    return match;
  } catch (error) {
    return error;
  }
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

//load all chat
export const userAllChatRoomLoader = async (req, res) => {
  const { id } = req.params;
  const data = await getChatRooms(id);

  if (data.status === 'error') {
    res.status(400).json({
      message: data.message,
      status: 'error',
    });
    return;
  }
  res.status(200).json({
    message: 'All chat rooms loaded successfully',
    status: 'ok',
    rooms: data.rooms,
  });
  return;
};

async function formatMessage(item, reply = {}) {
  return {
    id: item.messages.id,
    createdAt: item.messages.created_at,
    receiverId: item.messages.receiver_id,
    senderId: item.messages.sender_id,
    attachment: item.messages.attachment,
    emoji: item.messages.emoji,
    link: item.messages.link,
    reply: reply,
    text: item.messages.text,
    updatedAt: item.messages.updated_at,
    deletedAt: item.messages.deleted_at,
    initiatedBy: await getConnection(item.messages.initiated_by),
  };
}

async function getReplyMessage(id) {
  const { data, error } = await supabase.from('messages').select('*').eq('id', id);
  return {
    id: data[0].id,
    createdAt: data[0].created_at,
    receiverId: data[0].receiver_id,
    senderId: data[0].sender_id,
    attachment: data[0].attachment,
    emoji: data[0].emoji,
    link: data[0].link,
    text: data[0].text,
    updatedAt: data[0].updated_at,
    deletedAt: data[0].deleted_at,
    initiatedBy: data[0].initiated_by,
  };
}

async function getConnection(id) {
  const { data, error } = await supabase.from('connections').select('*').eq('id', id);
  return {
    ...data[0],
  };
}

export async function updateUserMiddleware(req, res) {
  const { type, value, userId } = req.body;
  console.log(req.body);
  const { data: userData, error: userError } = await supabase
    .from('user')
    .update({ [type]: value })
    .eq('userId', userId)
    .select('*');

  if (userError) {
    return res.status(401).json({
      message: userError.message,
      status: 'error',
    });
  }
  return res.status(200).json({
    message: 'User updated successfully',
    status: 'ok',
    user: {
      ...userData[0],
    },
  });
}

// when deleting account, check for connections, its PK is used as a FK in other tables.
export async function deleteUserAccountMiddleware(req, res) {
  const { id } = req.params;

  const { data: userData, error: userError } = await supabase.from('user').delete().eq('user_id', id).select('*');
  const { data: connectionData, error: connectionError } = await supabase.from('connections').delete().eq('id', id).select('*');

  if (userError || connectionError) {
    return res.status(401).json({
      message: error.message,
      status: 'error',
    });
  }
  res.status(200).json({
    message: 'User deleted successfully',
    status: 'success',
    data: {
      ...connectionData[0],
    },
  });
}

export async function getAllFriendRequestsMiddleware(req, res) {
  const { userId } = req.params;

  const { data: friendRequestData, error: friendRequestError } = await supabase.from('privateroom').select('*').eq('accepted', false).eq('inactive', false).or(`userOneId.eq.${userId},userTwoId.eq.${userId}`);

  if (friendRequestError) {
    return res.status(401).json({
      message: friendRequestError.message,
      status: 'error',
      user: [],
    });
  }
  const senderIds = friendRequestData.map((item) => (userId === item.userOneId ? item.userTwoId : item.userOneId));

  // get  the all senders
  const { data: senderData, error: senderError } = await supabase.from('user').select('*').in('userId', senderIds);

  if (senderError) {
    return res.status(401).json({
      message: senderError.message,
      status: 'error',
      user: [],
    });
  }

  res.status(200).json({
    message: 'Friend request loaded successfully',
    status: 'success',
    user: senderData, // if senderData is undefined , send empty array.
  });
}

export async function acceptDeclineRequestMiddleware(req, res) {
  const { senderId, receiverId, action } = req.body;

  const roomId = [senderId, receiverId].sort().join('-');

  let acceptDeclineRequestQuery, declinedFriendRequestQuery;

  if (action === 'accept') {
    // accept
    acceptDeclineRequestQuery = await supabase.from('privateroom').update({ accepted: true }).eq('roomId', roomId).select('*');
  } else if (action === 'decline') {
    // not friendship
    acceptDeclineRequestQuery = await supabase.from('privateroom').delete().eq('roomId', roomId).select('*');
    // add to declined friend requests
    declinedFriendRequestQuery = await supabase
      .from('declinedfriendrequest')
      .insert([{ requestSenderId: senderId, requestDeclinerId: receiverId, requestDeclineId: roomId }])
      .select('*');
  } else if (action === 'purgatory_state') {
    // put the row in a purgatory state (a user has not declined nor have they accepted)
    acceptDeclineRequestQuery = await supabase.from('privateroom').update({ inactive: true }).eq('roomId', roomId).select('*');
  }

  console.log('decline', declinedFriendRequestQuery);
  if (acceptDeclineRequestQuery.error) {
    return res.status(401).json({
      message: acceptDeclineRequestQuery.error.message,
      status: 'error',
    });
  }

  res.status(200).json({
    message: 'Friend request accepted successfully',
    status: 'ok',
    room: acceptDeclineRequestQuery.data[0],
  });
}

export async function declinedFriendRequestsMiddleware(req, res) {
  const { id } = req.params;

  const { data: declinedFriendRequestData, error: declinedFriendRequestError } = await supabase
    .from('declined_friend_requests')
    .insert([{ id: id }])
    .select('*');

  if (declinedFriendRequestError) {
    return res.status(401).json({
      message: declinedFriendRequestError.message,
      status: 'error',
    });
  }

  res.status(200).json({
    message: 'Friend request declined successfully',
    status: 'success',
  });
}

export async function uploadProfilePictureMiddleware(req, res) {
  try {
    const { dataUrl, userId, fileName } = req.body,
      folder = 'smalltalk-avatars'; //  profile pictures are stored at :smalltalk-avatar folder.

    const uploadOptions = {
      public_id: userId,
      folder,
      quality: 'auto',
      fetch_format: 'auto',
    };

    cloudinary.uploader.destroy(userId, { public_id: userId, folder });

    cloudinary.uploader.upload(dataUrl, uploadOptions, async (error, result) => {
      if (error) {
        console.log(error);
      }

      console.log(userId);
      const usersQuery = await supabase.from('user').update({ avatarUrl: result.secure_url, avatarId: result.public_id }).eq('userId', userId).select('*');

      if (usersQuery.error) {
        return res.status(401).json({
          message: usersQuery.error.message,
          status: 'error',
        });
      }

      console.log(usersQuery.data);
      res.status(200).json({
        status: 'ok',
        message: 'profile picture uploaded',
        user: usersQuery.data[0],
      });
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
}

export async function getUserProfileMiddleware(req, res) {
  const { id } = req.params;
  console.log('the id is : ', id);

  const { data: userData, error: userError } = await supabase.from('user').select('*').eq('userId', id);

  if (userError) {
    return res.status(401).json({
      message: userError.message,
      status: 'error',
    });
  }

  res.status(200).json({
    message: 'User profile loaded successfully',
    status: 'success',
    data: userData[0],
  });
}

export async function scrapWebsite(req, res) {
  try {
    if (!req.query.url) throw new Error('No Link is provided');
    const options = { url: req.query.url };

    const ogsRes = await ogs(options);

    const { error, result } = ogsRes;

    if (error) throw new Error(error);

    console.log(result);
    res.status(200).json({
      message: 'Scrapped website successfully',
      status: 'ok',
      data: result,
    });
  } catch (e) {
    // web scrap failed.
    res.status(500).json({
      message: e.message,
      status: 'error',
      data: [],
    });
  }
}

export async function getAllConnectedFriendsMiddleware(req, res) {
  const { userId } = req.params; // get userId

  const connectedFriendsQuery = await supabase.from('privateroom').select('*').eq('accepted', true).eq('inactive', false).or(`userOneId.eq.${userId}, userTwoId.eq.${userId}`);

  if (connectedFriendsQuery.error) {
    return res.status(401).json({
      message: connectedFriendsQuery.error.message,
      status: 'error',
    });
  }

  if (connectedFriendsQuery.data.length === 0) {
    return res.status(200).json({
      status: 'ok',
      message: 'no connected friends',
      data: [],
    });
  }

  // on success
  res.status(200).json({
    status: 'ok',
    message: 'all connected friends retrieved',
    data: connectedFriendsQuery.data,
  });
}

export async function determineUsercolumnInPrivateRoom(userId) {
  // the fn returns either (userOneId or userTwoId)
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

  return {
    status: 'ok',
    message: 'found',
    data: whichUserId,
  };
}
