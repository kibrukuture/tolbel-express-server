import express from 'express';
import verifyToken from '../util/verifyToken.js';
import auth from '../util/authenticateUser.js';
import queryDb from '../util/queryDb.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { searchItem } = req.body;
  const token = req.headers.authorization.split(' ')[1];

  try {
    const { email } = await verifyToken(token); // email or username depending on user signing in with email or username
    const { status, message } = await auth(email);

    console.log(email, status, message);
    if (status === 'error') {
      return res.status(401).json({
        message,
        status,
      });
    }

    if (status === 'ok') {
      const { status, message, data } = await queryDb(searchItem);

      // user not found
      if (status === 'error') {
        return res.status(401).json({
          message,
          status,
        });
      }

      // user found
      if (status === 'ok') {
        return res.status(200).json({
          status: 'ok',
          data,
        });
      }
    }
  } catch (e) {}
  res.status(401).json({
    message: 'Invalid token',
    status: 'error',
  });
});

export default router;
