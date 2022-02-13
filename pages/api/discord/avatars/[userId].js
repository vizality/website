import Cors from 'cors';


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
        let avatar;
        if (user.avatar) {
          const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
          avatar = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${extension}?size=256`;
        } else {
          avatar = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
        }
        res.status(200).json({ url: avatar });
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
