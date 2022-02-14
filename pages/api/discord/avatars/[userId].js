import fetch from 'node-fetch';
import Cors from 'cors';

import { fetchUser } from '#discord';

/**
 * Initialize the cors middleware.
 */
const cors = Cors({
  methods: [ 'GET', 'HEAD' ]
});

/**
 * Helper method to wait for a middleware to execute before continuing.
 * And to throw an error when an error happens in a middleware.
 */
function runMiddleware (req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, result => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler (req, res) {
  try {
  /**
   * Run the middleware.
   */
    await runMiddleware(req, res, cors);

    const { userId } = req.query;

    if (userId) {
      const user = await fetchUser(userId);
      let extension = 'png';
      if (user) {
        let endpoint;
        if (user.avatar) {
          extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
          endpoint = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${extension}?size=256`;
        } else {
          endpoint = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.${extension}`;
        }

        const response = await fetch(endpoint);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', `image/${extension}`);
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');

        res.send(buffer);
      } else {
        res.status(500).send({ error: 'User not found.' });
      }
    } else {
      res.status(500).send({ error: 'User ID is required.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong retrieving the data.' });
  }
}
