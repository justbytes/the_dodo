const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8000 });
const dodoTrader = new WebSocket("ws://127.0.0.1:8001");
const { serealizeDodo, deserealizeDodo } = require("./utils/serialConverter");

/**
 * Opens a websocket that inspects a new pair for liquidity
 * and "ensures" that there isn't any malisicous code in
 * the new token.
 *
 * (Just because it passes an audit doesn't mean
 *  that it is safe. Most times its probably still
 *  a rugpull/honeypot...)
 */
wss.on("connection", (ws) => {
  console.log(`Someone connected to Dodo Inspector`);

  // Trigers when data is recieved
  ws.on("message", async (data) => {
    console.log("**  Dodo Inspector Recieved Data  **");
    console.log("");

    // Convert the data into a DodoEgg object
    const dodoEgg = deserealizeDodo(data);

    let audit;
    // Conduct a saftey audit
    try {
      audit = await dodoEgg.conductAudit();
    } catch (error) {
      console.error(
        "Dodo Inspector: Unsafe pair detected. \n Skipping pair " +
          dodoEgg.pairAddress +
          " \n\n"
      );
      return;
    }

    // Do not continue if the aduit failed
    if (!audit) return;

    // Convert the dodoEgg data to JSON and send to the DodoTrader
    const seralizedDodo = serealizeDodo(dodoEgg.getInfo());
    dodoTrader.send(seralizedDodo);
  });

  ws.on("close", () => {
    console.log("**  Socket was disconnected  **\n");
    // TODO: Run a save function that saves all data to file before closing
  });
});

console.log("Dodo Inspector has begun inspecting on PORT 8000");

// const DodoEgg = require("./class/DodoEgg");
// const v3 = false;
// const chain = "1";
// const id = "0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f";
// const baseToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const token = "0x6982508145454Ce325dDbE47a25d4ec3d2311933";

// const main = async () => {
//   const dodo = new DodoEgg(
//     id,
//     chain,
//     token,
//     baseToken,
//     id,
//     v3,
//     { something: "something" },
//     "0",
//     "0",
//     false,
//     "18",
//     "18",
//     0
//   );

//   console.log(dodo.getInfo());

//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   const seralizedDodo = serealizeDodo(dodo.getInfo());
//   dodoTrader.send(seralizedDodo);
// };
// main();
