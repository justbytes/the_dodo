const WebSocket = require("ws");
const { deserializeDodo } = require("./utils/dodoCoder");
const Audit = require("./controller/audit");
/**
 * Opens a websocket that inspects a new pair for liquidity
 * and "ensures" that there isn't any malisicous code in
 * the new token.
 */
const dodoWebsocket = () => {
  // Create the websocket server
  const wss = new WebSocket.Server({ port: 8000 });

  // Create a map to store the dodoEggs
  const dodos = new Map();

  wss.on("connection", (ws) => {
    console.log(`     New connection to app.js     `);

    // Trigers when data is recieved
    ws.on("message", async (data) => {
      console.log("    Recieved New Data   ");
      console.log("");

      // Convert the data into a DodoEgg object
      const dodoEgg = deserializeDodo(data);

      // Add the new pair to the Map
      dodos.set(dodoEgg.id, dodoEgg);

      // Do the audit
      const audit = await Audit(dodoEgg.chainId, dodoEgg.newTokenAddress);

      //console.log(audit);

      if (audit.success) {
        console.log("Audit was successful");
        // TODO: Save the pair to the successful pairs file
        // TODO: Take a snapshot of the blockchain and try to trade the token pair
      } else {
        console.log("Audit was not successful");
        // TODO: Remove the pair from the Map
        // TODO: send to the failed pairs file for further inspection
      }

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
