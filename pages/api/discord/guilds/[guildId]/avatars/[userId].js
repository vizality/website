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
  const { guildId, userId } = req.query;

  const member = await (await discord).rest.fetchGuildMember(guildId, userId);

  /**
   * Run the middleware.
   */
  await runMiddleware(req, res, cors);

  if (member) {
    let endpoint;
    let extension;
    if (member.avatar) {
      extension = member.avatar?.startsWith('a_') ? 'gif' : 'png';
      endpoint = `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${member.avatar}.${extension}?size=256`;
    } else if (member.user?.avatar) {
      extension = member.avatar?.startsWith('a_') ? 'gif' : 'png';
      endpoint = `https://cdn.discordapp.com/avatars/${userId}/${member.user.avatar}.${extension}?size=256`;
    } else {
      endpoint = `https://cdn.discordapp.com/embed/avatars/${member.user.discriminator % 5}.png`;
    }
    res.redirect(307, endpoint);
  } else {
    res.status(500).send({ error: 'Guild or user not found.' });
  }
}
