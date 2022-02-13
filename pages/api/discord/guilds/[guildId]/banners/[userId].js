import { InteractionCommandClient } from 'detritus-client';
import Cors from 'cors';

/**
 * Instantiate the interaction command client with various options.
 */
const interactionClient = new InteractionCommandClient(process.env.BOT_TOKEN, { useClusterClient: false });

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

  const client = await interactionClient.run();
  const user = await client.rest.fetchUser(userId);
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
    res.status(500).send({ error: 'User could not be found.' });
  }
}
