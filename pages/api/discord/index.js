import { InteractionCommandClient } from 'detritus-client';

/**
 * Instantiate the interaction command client with various options.
 */
const interactionClient = new InteractionCommandClient(process.env.BOT_TOKEN, {
  useClusterClient: false,
  gateway: {
    intents: 'all'
  }
});

export default (async () => interactionClient.run())();
