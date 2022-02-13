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
  const { userId } = req.query;

  const user = await (await discord).rest.fetchUser(userId);
  const extension = user?.avatar?.startsWith('a_') ? 'gif' : 'png';

  /**
   * Run the middleware.
   */
  await runMiddleware(req, res, cors);

  if (user) {
    if (user.avatar) {
      res.redirect(307, `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${extension}?size=256`);
    } else {
      res.redirect(307, `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`);
    }
  } else {
    res.status(500).send({ error: 'User not found.' });
  }
}