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
  const extension = user?.banner?.startsWith('a_') ? 'gif' : 'png';

  /**
   * Run the middleware.
   */
  await runMiddleware(req, res, cors);

  if (user) {
    if (user.banner) {
      res.redirect(307, `https://cdn.discordapp.com/banners/${userId}/${user.banner}.${extension}?size=600`);
    } else {
      res.redirect(307, `https://singlecolorimage.com/get/${user.bannerColor.substring(1)}/600x120`);
    }
  } else {
    res.status(500).send({ error: 'User not found.' });
  }
}
