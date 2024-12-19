const fs = require("fs");
const path = require("path");
const App = require("./app");
const V2TokenPairListener = require("./model/V2TokenPairListener");
const V3TokenPairListener = require("./model/V3TokenPairListener");

// Retrieve Uniswap address data file and parse the json
const UNISWAP_JSON = path.join(__dirname, "../data/uniswap.json");
const rawUniswapData = fs.readFileSync(UNISWAP_JSON);
const UNISWAP = JSON.parse(rawUniswapData);

const activateListeners = () => {
  // Loop through each Uniswap protocol and activate listeners
  for (let i = 0; i < UNISWAP.length; i++) {
    let name = UNISWAP[i].name;
    let chainId = UNISWAP[i].chain_id;
    let v2Factory = UNISWAP[i].v2.factory;
    let v3Factory = UNISWAP[i].v3.factory;

    // Start V2 listener
    if (v2Factory != null) {
      new V2TokenPairListener(v2Factory, chainId);
    }

    // Start V3 listener
    if (v3Factory != null) {
      new V3TokenPairListener(v3Factory, chainId);
    }
  }
};

/**
 * Starts the program by activating listeners on all Uniswap v3 and v2 protocols
 */
const main = () => {
  try {
    // New instance of the app
    const app = new App();

    // Activate listeners
    activateListeners();

    // Start the app
    app.start();

    console.log("Welcome to the Dodo Finder!");
  } catch (error) {
    console.error(`There was an error starting the program\n` + error);
  }
};

main();
