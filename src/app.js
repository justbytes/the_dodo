const WebSocket = require("ws");
const { deserializeDodo, serializeDodo } = require("./utils/dodoCoder");
const { audit } = require("./controller/audit");

/**
 * Opens a websocket that inspects a new pair for liquidity
 * and "ensures" that there isn't any malisicous code in
 * the new token.
 *
 * (Just because it passes an audit doesn't mean
 *  that it is safe. Most times its probably still
 *  a rugpull/honeypot...)
 */

const dodoWebsocket = () => {
  const wss = new WebSocket.Server({ port: 8000 });
  const dodos = new Map();

  wss.on("connection", (ws) => {
    console.log(`     New connection to app.js     `);

    // Trigers when data is recieved
    ws.on("message", async (data) => {
      console.log("    Recieved New Data   ");
      console.log("");

      // Convert the data into a DodoEgg object
      const dodoEgg = deserializeDodo(data);

      console.log("app: ", dodoEgg);
      // // Add the new pair to the Map
      // dodos.set(dodoEgg.id, dodoEgg);

      // // Conduct an audit to make sure the pair is safe
      // try {
      //   const audit = await audit();

      //   // If the audit failed, delete the pair from the Map
      //   if (!audit) {
      //     dodos.delete(dodoEgg.id);
      //     return;
      //   }
      // } catch (error) {
      //   console.error(
      //     "There was an error when conducting the audit. | app.js\n" + error
      //   );
      //   dodos.delete(dodoEgg.id);
      //   return;
      // }

      // await dodoEgg.setTargetPrice();
    });

    ws.on("close", () => {
      console.log("**  Socket was disconnected  **\n");
      // TODO: Run a save function that saves all data to file before closing
    });
  });

  console.log("Dodo Inspector has begun inspecting on PORT 8000");
};

module.exports = dodoWebsocket;
