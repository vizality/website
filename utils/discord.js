import fetch from 'node-fetch';

const API_ENDPOINT = 'https://discord.com/api';

const options = {
  headers: new Headers({
    Authorization: `Bot ${process.env.BOT_TOKEN}`
  })
};

export async function fetchUser (userId) {
  const response = await fetch(`${API_ENDPOINT}/users/${userId}`, options);
  return response.json();
}

export async function fetchGuildMember (guildId, userId) {
  const response = await fetch(`${API_ENDPOINT}/guilds/${guildId}/users/${userId}`, options);
  return response.json();
}

