const WebSocket = require("ws");
const { deserializeDodo } = require("./utils/dodoCoder");
const Audit = require("./controller/audit");
const { saveAuditedDodoEgg } = require("./utils/archive");
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
  const audit = new Audit();

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
      const auditResults = await audit.main(
        dodoEgg.chainId,
        dodoEgg.newTokenAddress
      );

      // Add the audit results to the DodoEgg object
      dodoEgg.auditResults = auditResults;

      // Save the audit results
      await saveAuditedDodoEgg(auditResults.success, dodoEgg.getDodoEgg());

      // If the audit was not successful, remove the pair from the Map
      if (!auditResults.success) {
        console.log("Audit was not successful");
        // Remove the pair from the Map
        dodos.delete(dodoEgg.id);
        return;
      }

      console.log("Audit was successful");

      // TODO: Take a snapshot of the blockchain and try to trade the token pair
    });

    ws.on("close", () => {
      console.log("**  Socket was disconnected  **\n");
      // TODO: Run a save function that saves all data to file before closing
    });
  });

  console.log("Dodo Inspector has begun inspecting on PORT 8000");
};

module.exports = dodoWebsocket;
