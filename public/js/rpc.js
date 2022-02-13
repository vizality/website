/**
 * Class to interact with Vizality through Discord's RPC WebSocket server.
 * @see {@link https://gist.github.com/Bowser65/5756e490860aa122f5ad13f5cf19fd7d}
 * @author Bowser65, modified by AAGaming00 and dperolio
 * @license MIT
 */

class VizalityRPC {
  get ws () {
    return this._ws;
  }

  set ws (ws) {
    // Prevents multiple alive WebSockets
    if (this._ws) {
      this._ws.close();
    }
    this._ws = ws;
  }

  /**
   * Checks if there is an available Vizality-decorated RPC server.
   * @returns {Promise<boolean>}
   */
  async isRPCAvailable () {
    if (this.ws) {
      return true;
    }

    try {
      await this._connect();
      return true;
    } catch (ignored) {
      return false;
    }
  }

  /**
   * Opens Vizality's store page for a given product.
   * @param {string} type Addon type
   * @param {string} id Addon ID
   * @returns {Promise<object>}
   */
  installProduct (type, id) {
    if (![ 'plugin', 'theme' ].includes(type)) {
      throw new Error('Invalid product type');
    }
    return this.sendRaw('VIZALITY_OPEN_STORE', {
      type,
      id
    });
  }

  /**
   * Opens the addon page for a given addon.
   * @param {string} type Addon type
   * @param {string} addonId Addon ID
   * @returns {Promise<object>}
   */
  openProductSettings (type, addonId) {
    if (![ 'plugin', 'theme' ].includes(type)) {
      throw new Error('Invalid product type');
    }
    return this.sendRaw('VIZALITY_OPEN_SETTINGS', {
      type,
      addonId
    });
  }

  /**
   * Subscribes to an RPC event.
   * @param {string} event Name of the event
   * @param {object} args Args for the event
   * @param {Function} callback Function to call with the event data when it is fired
   * @returns {Promise}
   */
  subscribe (event, args, callback) {
    if (!callback && typeof args === 'function') {
      callback = args;
      args = void 0;
    }
    return this.sendRaw('SUBSCRIBE', args, event).then(() => {
      const subid = this._genSubKey(event, args);
      this._subscriptions.set(subid, callback);
    });
  }

  /**
   * Unsubscribes from an RPC event.
   * @param {string} event Name of the event
   * @param {object} args Arguments for the event
   * @returns {Promise}
   */
  unsubscribe (event, args) {
    return this.sendRaw('UNSUBSCRIBE', args, event).then(() => {
      const subid = this._genSubKey(event, args);
      this._subscriptions.delete(subid);
    });
  }

  /**
   * Sends a message to Discord's RPC server.
   * @param {string} command Name of the command
   * @param {object} args Data to send
   * @returns {Promise<object>}
   */
  sendRaw (command, args, evt) {
    return new Promise(async (resolve, reject) => {
      if (!this.ws) {
        try {
          await this._connect();
        } catch (e) {
          reject(e);
          return;
        }
      }

      const nonce = this._v4();
      this._callbacks[nonce] = resolve;
      this.ws.send(JSON.stringify({
        cmd: command,
        args,
        evt,
        nonce
      }));
    });
  }

  /**
   * Connects to Discord's RPC WebSocket
   * @returns {Promise<WebSocket>}
   * @private
   */
  _connect (portInc = 0) {
    const port = VizalityRPC.RPC_STARTING_PORT + portInc;
    this._log('Attempting to connect on port', port);
    return new Promise(async (resolve, reject) => {
      // @todo make this a Map
      this._callbacks = {};
      this._subscriptions = new Map();
      this._ready = false;
      try {
        // DISCOVERY
        const res = await fetch(`http://127.0.0.1:${port}/`).catch(() => console.log('test'));
        if (res.status === 404) {
          const data = await res.json();
          if (data.code === 0) {
            this._log('Discovered Discord RPC on port', port);
          } else {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error('Discovery failed');
          }
        } else {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error('Discovery failed');
        }

        // CONNECTING
        this.ws = new WebSocket(`ws://127.0.0.1:${port}/?v=${VizalityRPC.RPC_VERSION}&client_id=vizality`);
        this.ws.addEventListener('message', msg => {
          const data = JSON.parse(msg.data);
          if (!this._ready && data.cmd === 'DISPATCH' && data.evt === 'READY') {
            this._log('Connection successful');
            this._ready = true;
            this.sendRaw('IS_VIZALITY')
              .then((e) => {
                if (e === 'true') {
                  resolve();
                  this._log('Found Vizality RPC');
                } else {
                  throw 'not vz rpc'; // this will trigger the catch handler
                }
              })
              .catch(() => {
                if (portInc++ === VizalityRPC.RPC_PORT_RANGE) {
                  reject(new Error('No available RPC'));
                  return;
                }
                setTimeout(() => {
                  this._connect(portInc).then(resolve).catch(reject);
                }, 100);
                this.ws.close();
              });
          } else if (this._ready) {
            if (data.cmd === 'DISPATCH') {
              const subid = this._genSubKey(data.evt, data.args);
              if (!this._subscriptions.has(subid)) return;
              this._subscriptions.get(subid)(data.data);
            } else {
              const callback = this._callbacks[data.nonce];
              if (callback) {
                delete this._callbacks[data.nonce];
                return callback(data.data);
              }
            }
          }
        });
        this.ws.addEventListener('close', (e) => {
          this._log('Connection closed.', e.code, e.reason || 'Unknown', e.wasClean);
          Object.values(this._callbacks).forEach(cb => cb());
          this.ws = null;
        });
      } catch (e) {
        this._log('Connection failed.');
        if (portInc++ === VizalityRPC.RPC_PORT_RANGE) {
          reject(new Error('No available RPC'));
          return;
        }
        setTimeout(() => {
          this._connect(portInc).then(resolve).catch(reject);
        }, 100);
      }
    });
  }

  /**
   * Genrates a random UUID v4
   * @returns {string} Generated UUID
   * @private
   */
  _v4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  }

  _genSubKey (event, args) {
    return `${event}${JSON.stringify(args)}`;
  }

  _log (...args) {
    console.log('%c[VizalityRPC]', 'color: #7C41FF', ...args);
  }
}

VizalityRPC.RPC_STARTING_PORT = 6463;
VizalityRPC.RPC_PORT_RANGE = 10;
VizalityRPC.RPC_VERSION = 1;
const rpc = new VizalityRPC();

(async () => {
  try {
    await rpc._connect();
  } catch (err) {
    console.log('pie');
  }
  rpc.sendRaw('VIZALITY_NAVIGATE', 'home');
})();
