import { Constants as SocketConstants } from 'detritus-client-socket';
import { InteractionCommandClient } from 'detritus-client';
import Cors from 'cors';

/**
 * Instantiate the interaction command client with various options.
 */
const interactionClient = new InteractionCommandClient(process.env.BOT_TOKEN, {
  useClusterClient: false,
  gateway: {
    intents: 'ALL'
  }
});

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
     * Get our authorized bot client.
     */
    const client = await interactionClient.run();

    /**
     * Retrieve the user's information via Discord's API.
     */
    const user = await client.rest.fetchUser(userId);

    /**
     * Run the middleware.
     */
    await runMiddleware(req, res, cors);

    if (userId) {
      if (user) {
        let endpoint;
        if (user.banner) {
          const extension = user?.banner?.startsWith('a_') ? 'gif' : 'png';
          endpoint = `https://cdn.discordapp.com/banners/${userId}/${user.banner}.${extension}?size=600`;
        } else {
          endpoint = `https://singlecolorimage.com/get/${user.bannerColor.substring(1)}/600x120`;
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
