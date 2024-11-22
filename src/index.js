const fs = require("fs");
const path = require("path");
const dodoWebsocket = require("./app");
const V2TokenPairListener = require("./utils/tokenFetchers/v2TokenPairListener");
const V3TokenPairListener = require("./utils/tokenFetchers/v3TokenPairListener");

// Retrieve Uniswap address data file and parse the json
const UNISWAP_JSON = path.join(__dirname, "../data/uniswap.json");
const rawUniswapData = fs.readFileSync(UNISWAP_JSON);
const UNISWAP = JSON.parse(rawUniswapData);

/**
 * Starts the program by activating listeners on all Uniswap v3 and v2 protocols
 */
const main = async () => {
  // Start websocket server
  const wss = dodoWebsocket();

  // Loop through each Uniswap protocol and activate listeners
  for (let i = 0; i < UNISWAP.length; i++) {
    let name = UNISWAP[i].name;
    let chainId = UNISWAP[i].chain_id;
    let v2Factory = UNISWAP[i].v2.factory;
    let v3Factory = UNISWAP[i].v3.factory;

    if (v2Factory != null) {
      console.log(`Activating ${name} V2 Listener!`);
      new V2TokenPairListener(v2Factory, chainId);
    }

    if (v3Factory != null) {
      console.log(`Activating ${name} V3 Listener!`);
      new V3TokenPairListener(v3Factory, chainId);
    }
  }
};

main();
