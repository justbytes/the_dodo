const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8001 });
const { saveDodoEggs } = require("./logic/archive");
const { deserealizeDodo } = require("./utils/serialConverter");

wss.on("connection", (ws) => {
  console.log("New connection was made to computer websocket!");
  // Map of the active tokens being monitored or traded
  const dodosTrading = new Map();

  // Listen for a messeage that should be coming from the listener
  ws.on("message", async (data) => {
    console.log("******   Dodo Trader Recieved Data   ******\n");
    console.log("");

    // Convert the data into a DodoEgg object
    const dodoEgg = deserealizeDodo(data);

    // Add a new pair to the Map if it hasn't already been added
    if (!dodosTrading.has(dodoEgg.id)) {
      dodosTrading.set(dodoEgg.id, dodoEgg);
    }

    // Set a target price
    await dodoEgg.setTargetPrice();

    // Activate targetListener and perform swaps. once target price has been reached
    // it trigger the swap back to the orginal token
    await dodoEgg.incubator();

    // TODO: record the trade for taxs
    // TODO: IF rug pulled, not allowed to sell, only sell half etc..., record results to file for investigation
    // TODO: Archive the trade data (profits, losses, date, ect..)

    // TODO: SEND TO ANOTHER WEBSOCKET or SOMETHING
    //   Keep anaylyzing token to see if it was a rug pull if it was
    //   save all of the data and build an investiagor bot that gathers all of the information
    //   and stores it in a file for future project of building an investigation bot
  });

  ws.on("close", () => {
    console.log("Socket disconnected!");
    // TODO: Run a save function that saves all data to file before closing
  });
});

console.log("Dodo Trader started on ws://localhost:8001");
