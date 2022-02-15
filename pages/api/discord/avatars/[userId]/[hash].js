/**
 * Fetch the user's avatar at a specific hash, converts it to a buffer, and returns it.
 * If the user's avatar at the specific hash isn't found (it gets deleted from Discord's server
 * eventually, after the user changes their avatar), it will fetch the current latest avatar, and cache
 * that instead. In essence, this should always return a valid image, assuming the user ID is correct.
 * It is cached for one year.
 */

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

    const { userId, hash } = req.query;

    /**
     * Make sure a user ID is provided.
     */
    if (userId) {
      /**
       * Fetch the endpoint and convert it to an image buffer.
       */
      let response;
      response = await fetch(`https://cdn.discordapp.com/avatars/${userId}/${hash}.gif?size=512`);
      if (!response.ok) {
        response = await fetch(`https://cdn.discordapp.com/avatars/${userId}/${hash}.png?size=512`);
        if (!response.ok) {
          response = await fetch(`https://vizality.com/api/discord/avatars/${userId}`);
          if (!response.ok) {
            return res.status(500).send({ error: 'User not found.' });
          }
        }
      }

      /**
       * Convert the response to an image buffer.
       */
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      /**
       * Set the response headers.
       */
      res.setHeader('Content-Type', response.headers.get('content-type'));
      res.setHeader('Content-Length', response.headers.get('content-length'));
      res.setHeader('Cache-Control', 'public, max-age=31536000, must-revalidate');
      return res.send(buffer);
    }
    return res.status(500).send({ error: 'User ID is required.' });
  } catch (err) {
    return res.status(500).json({ error: 'Something went wrong retrieving the data.' });
  }
}

