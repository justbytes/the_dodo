const WebSocket = require("ws");
const { deserializeDodo } = require("./utils/dodoCoder");
const Audit = require("./controller/audit/Audit");
const Trader = require("./controller/trader/Trader");
const { saveAuditedDodoEgg } = require("./utils/archive");

class App {
  #dodos = new Map();

  constructor() {
    this.totalReceived = 0;
    this.audit = new Audit();
    this.trader = new Trader();
  }

  /**
   * A token pair listener will call this method to have a token pair/new token audited,
   * it will then add the pair as a DodoEgg into the dodos map.
   * @param {string} data
   */
  async auditDodo(data) {
    // Increment the total received
    this.totalReceived++;

    // Convert the data into a DodoEgg object
    const dodoEgg = deserializeDodo(data);

    // Add the new pair to the Map
    this.#dodos.set(dodoEgg.id, dodoEgg);

    // Do the audit
    const auditResults = await this.audit.run(
      dodoEgg.chainId,
      dodoEgg.newTokenAddress
    );

    // Add the audit results to the DodoEgg object
    dodoEgg.auditResults = auditResults;

    // Save the audit results
    saveAuditedDodoEgg(auditResults.success, dodoEgg.getDodoEgg());

    // If the audit was not successful, remove the pair from the Map
    if (auditResults.success) {
      console.log("*******   AUDIT SUCCESS   *******");
      console.log("");

      // Try to trade the token pair
      //await this.testTrade(dodoEgg);

      return;
    } else {
      console.log("*******   AUDIT FAILED   *******");
      console.log("");

      // Remove the pair from the Map
      this.#dodos.delete(dodoEgg.id);
      return;
    }
  }

  /**
   * Should create a snapshot of the blockchain and try to trade the token pair to see if there is anything that
   * stops a buy or sell from happening
   * @param {DodoEgg} dodoEgg
   */
  async testTrade(dodoEgg) {
    console.log("*******   TESTING TRADE   *******");
    console.log("");

    // TODO: Create a snapshot of the blockchain
    // TODO: Should go to /blockchain/testTrade.js and run the script that creates a private instance of the blockchain
    //       and then try to trade the token pair

    return;
  }

  async snipeDodo(dodoEgg) {
    console.log("*******   SNIPING DODO   *******");
    console.log("");

    // TODO:

    return;
  }
}

module.exports = App;

// const dodoWebsocket = () => {
//   // Create the websocket server
//   const wss = new WebSocket.Server({ port: 8000 });

//   // Create a map to store the dodoEggs
//   const dodos = new Map();
//   const audit = new Audit();

//   wss.on("connection", (ws) => {
//     console.log(`     New connection to app.js     `);

//     // Trigers when data is recieved
//     ws.on("message", async (data) => {
//       console.log("    Recieved New Data   ");
//       console.log("");

//       // Convert the data into a DodoEgg object
//       const dodoEgg = deserializeDodo(data);

//       // Add the new pair to the Map
//       dodos.set(dodoEgg.id, dodoEgg);

//       // Do the audit
//       const auditResults = await audit.main(
//         dodoEgg.chainId,
//         dodoEgg.newTokenAddress
//       );

//       // Add the audit results to the DodoEgg object
//       dodoEgg.auditResults = auditResults;

//       // Save the audit results
//       await saveAuditedDodoEgg(auditResults.success, dodoEgg.getDodoEgg());

//       // If the audit was not successful, remove the pair from the Map
//       if (!auditResults.success) {
//         console.log("Audit was not successful");
//         // Remove the pair from the Map
//         dodos.delete(dodoEgg.id);
//         return;
//       }

//       console.log("Audit was successful");

//       // TODO: Take a snapshot of the blockchain and try to trade the token pair
//     });

//     ws.on("close", () => {
//       console.log("**  Socket was disconnected  **\n");
//       // TODO: Run a save function that saves all data to file before closing
//     });
//   });

//   console.log("Dodo Inspector has begun inspecting on PORT 8000");
// };

// module.exports = dodoWebsocket;
