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
    const { userId } = req.query;

    /**
     * Run the middleware.
     */
    await runMiddleware(req, res, cors);

    if (userId) {
      const user = await fetchUser(userId);
      let extension = 'png';
      if (user) {
        console.log('user');
        let endpoint;
        if (user.banner) {
          console.log('banner');
          extension = user.banner.startsWith('a_') ? 'gif' : 'png';
          endpoint = `https://cdn.discordapp.com/banners/${userId}/${user.banner}.${extension}?size=600`;
        } else if (user.banner_color) {
          endpoint = `https://singlecolorimage.com/get/${user.banner_color.substring(1)}/600x120`;
        }

        const response = await fetch(endpoint);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', `image/${extension}`);
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
