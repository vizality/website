/**
 * Fetch the user's current avatar, converts it to a buffer, and returns it.
 * This can be used to always get the user's current avatar. It is cached for one hour.
 */

import { fetchUser } from '#discord';
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
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @param {Function} fn The middleware function to execute.
 * @returns {Promise}
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

/**
 * Handles the request.
 * @param {Request} req The request object.
 * @param {Response} res The response object.
 * @returns {Promise<void>}
 */
export default async function handler (req, res) {
  try {
    /**
     * Run the middleware.
     */
    await runMiddleware(req, res, cors);

    const { userId } = req.query;

    /**
     * Make sure a user ID is provided.
     */
    if (userId) {
      const user = await fetchUser(userId);
      /**
       * Check if a user is found.
       */
      if (user) {
        let endpoint;
        /**
         * Check if the user has a custom avatar.
         */
        if (user.avatar) {
          const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
          endpoint = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${extension}?size=512`;
        /**
         * If they don't have a custom avatar, determine what default to use based on their discriminator.
         */
        } else {
          endpoint = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
        }

        /**
         * Fetch the endpoint and convert it to an image buffer.
         */
        const response = await fetch(endpoint);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        /**
         * Set the response headers.
         */
        res.setHeader('Content-Type', response.headers.get('content-type'));
        res.setHeader('Content-Length', response.headers.get('content-length'));
        res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');

        return res.send(buffer);
      }
      return res.status(500).send({ error: 'User not found.' });
    }
    return res.status(500).send({ error: 'User ID is required.' });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong retrieving the data.' });
  }
}
