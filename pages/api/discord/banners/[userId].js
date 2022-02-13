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
      if (user) {
        let endpoint;
        if (user.banner) {
          const extension = user?.banner?.startsWith('a_') ? 'gif' : 'png';
          endpoint = `https://cdn.discordapp.com/banners/${userId}/${user.banner}.${extension}?size=600`;
        } else {
          endpoint = `https://singlecolorimage.com/get/${user.bannerColor.substring(1)}/600x120`;
        }
        res.redirect(endpoint);
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
