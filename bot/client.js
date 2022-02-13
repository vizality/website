import { Constants as SocketConstants } from 'detritus-client-socket';
import { InteractionCommandClient } from 'detritus-client';

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

export default (async () => interactionClient.run())();
