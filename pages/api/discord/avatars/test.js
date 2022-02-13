import Cors from 'cors';

import discord from '#discord';

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
    const userId = '97549189629636608';

    /**
     * Retrieve the user's information via Discord's API.
     */
    const user = await (await discord).rest.fetchUser(userId);

    /**
     * Run the middleware.
     */
    await runMiddleware(req, res, cors);

    if (userId) {
      if (user) {
        let endpoint;
        if (user.avatar) {
          const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
          endpoint = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${extension}?size=256`;
        } else {
          endpoint = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
        }
        res.redirect(307, endpoint);
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
