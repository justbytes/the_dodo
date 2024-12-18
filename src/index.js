const fs = require("fs");
const path = require("path");
const App = require("./app");
const V2TokenPairListener = require("./model/V2TokenPairListener");
const V3TokenPairListener = require("./model/V3TokenPairListener");

// Retrieve Uniswap address data file and parse the json
const UNISWAP_JSON = path.join(__dirname, "../data/uniswap.json");
const rawUniswapData = fs.readFileSync(UNISWAP_JSON);
const UNISWAP = JSON.parse(rawUniswapData);

/**
 * Starts the program by activating listeners on all Uniswap v3 and v2 protocols
 */
const main = async () => {
  // Start websocket server
  const app = new App();

  // Loop through each Uniswap protocol and activate listeners
  for (let i = 0; i < UNISWAP.length; i++) {
    let name = UNISWAP[i].name;
    let chainId = UNISWAP[i].chain_id;
    let v2Factory = UNISWAP[i].v2.factory;
    let v3Factory = UNISWAP[i].v3.factory;

    // Start V2 listener
    try {
      if (v2Factory != null) {
        new V2TokenPairListener(app, v2Factory, chainId);
      }
    } catch (error) {
      console.error(
        `There was an error activating the ${chainId} V2 listener. | index.js\n` +
          error
      );
    }

    // Start V3 listener
    try {
      if (v3Factory != null) {
        new V3TokenPairListener(app, v3Factory, chainId);
      }
    } catch (error) {
      console.error(
        `There was an error activating the ${chainId} V3 listener. | index.js\n` +
          error
      );
    }
  }

  console.log("Welcome to the Dodo Finder!");
};

main();
