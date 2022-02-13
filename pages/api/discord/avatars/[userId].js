import { Constants as SocketConstants } from 'detritus-client-socket';
import { InteractionCommandClient } from 'detritus-client';
import Cors from 'cors';

/**
 * Instantiate the interaction command client with various options.
 */
const interactionClient = new InteractionCommandClient(process.env.BOT_TOKEN, {
  useClusterClient: false,
  gateway: {
    intents: [
      SocketConstants.GatewayIntents.GUILDS,
      SocketConstants.GatewayIntents.GUILD_MEMBERS,
      SocketConstants.GatewayIntents.GUILD_MESSAGES,
      SocketConstants.GatewayIntents.GUILD_PRESENCES,
      SocketConstants.GatewayIntents.GUILD_MESSAGE_REACTIONS,
      SocketConstants.GatewayIntents.DIRECT_MESSAGES,
      SocketConstants.GatewayIntents.DIRECT_MESSAGE_REACTIONS,
      SocketConstants.GatewayIntents.GUILD_VOICE_STATES
    ]
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

    if (!userId) {
      res.status(500).send({ error: 'User ID is required.' });
    }

    const client = await interactionClient.run();

    const user = await client.rest.fetchUser(userId);
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
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong retrieving the data.' });
  }
}
