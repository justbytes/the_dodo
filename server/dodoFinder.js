require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const WebSocket = require("ws");
const path = require("path");
const { ethers } = require("ethers");
const { Alchemy, Interface } = require("alchemy-sdk");
const dodoInspector = new WebSocket("ws://127.0.0.1:8000");

const checkIfTokenIsNew = require("./utils/newTokenChecker");
const getAlchemySettings = require("./utils/getAlchemySettings");

// Retrieve Uniswap address data file and parse the json
const UNISWAP_JSON = path.join(__dirname, "../data/uniswap.json");
const rawUniswapData = fs.readFileSync(UNISWAP_JSON);
const UNISWAP = JSON.parse(rawUniswapData);

// Get contract ABI's
const {
  abi: UniswapV2FactoryABI,
} = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");

const {
  abi: UniswapV3FactoryABI,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");

// Interface objects so the contract abis can be parsed
const FACTORY_V3_INTERFACE = new ethers.Interface(UniswapV3FactoryABI);
const FACTORY_V2_INTERFACE = new ethers.Interface(UniswapV2FactoryABI);

/**
 * Activates a listener for a pair that is created on the Uniswap v2 protocol
 */
const activateV2Listener = async (factoryAddress, chainId, provider) => {
  const filter = {
    address: factoryAddress,
    topics: [FACTORY_V2_INTERFACE.getEvent("PairCreated").topicHash],
  };

  provider.ws.on(filter, (log) => {
    console.log("New PairCreated event detected!");
    processV2EventLog(log, chainId);
  });
};

/**
 * Activates a listener for a pair that is created on the Uniswap v3 protocol
 */
const activateV3Listener = async (factoryAddress, chainId, provider) => {
  // Filter for PoolCreated events indicating a new pool
  const filter = {
    address: factoryAddress,
    topics: [FACTORY_V3_INTERFACE.getEvent("PoolCreated").topicHash],
  };

  // Activate the listener
  provider.ws.on(filter, (log) => {
    console.log("New PoolCreated event detected!");
    processV3EventLog(log, chainId);
  });
};

/**
 * Decoded V2 log data
 * @param {*} log encoded event data
 * @param {*} chainId pass the chain id of the blockchain
 */
const processV2EventLog = (log, chainId) => {
  const decodedLog = FACTORY_V2_INTERFACE.parseLog(log);

  const { token0, token1, pair } = decodedLog.args;

  console.log(
    `New pair detected: ${token0} - ${token1}, Pair Address: ${pair}`
  );
  console.log("");

  processEventData(token0, token1, pair, null, false, chainId);
};

/**
 * Decoded v3 log data
 * @param {*} log encoded event data
 * @param {*} chainId pass the chain id of the blockchain
 */
const processV3EventLog = (log, chainId) => {
  const decodedLog = FACTORY_V3_INTERFACE.parseLog(log);

  const { token0, token1, fee, tickSpacing, pool } = decodedLog.args;

  console.log(
    `New pool detected: ${token0} - ${token1}, Pool Address: ${pool}, Fee: ${fee}, Chain id: ${chainId}`
  );
  console.log("");

  processEventData(token0, token1, pool, fee, true, chainId);
};

/**
 * Determine if the pool/pair is new and if so send data to websocket server
 *
 * @param {*} token0
 * @param {*} token1
 * @param {*} pair
 * @param {*} fee
 * @param {*} v3
 * @param {*} chainId
 */
const processEventData = (token0, token1, pair, fee, v3, chainId) => {
  // Determine which token is the new token
  let tokenIsNew, newToken, baseToken;

  // New token checking logic
  if (checkIfTokenIsNew(token0)) {
    tokenIsNew = true;
    newToken = token0;
    baseToken = token1;
  } else if (checkIfTokenIsNew(token1)) {
    tokenIsNew = true;
    newToken = token1;
    baseToken = token0;
  } else {
    console.log("These are two already known tokens...");
    console.log(token0 + "/" + token1);
    console.log("");
    tokenIsNew = false;
  }

  // Only pass new tokens
  if (tokenIsNew) {
    // Create a data object
    const data = {
      chainId: chainId,
      newToken: newToken,
      baseToken: baseToken,
      pairAddress: pair,
      v3: v3,
      fee: fee,
    };

    // Send it to the auditing websocket
    dodoInspector.send(bigIntSafeSerialize(data));

    console.log(`Data sent to server`);
    console.log("");
  } else {
    console.log(`Token pair ${token0}/${token1} is not a new token pair.\n`);
    console.log("");
  }
};

// Utility function for BigInt-safe serialization
const bigIntSafeSerialize = (obj) => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
};

/**
 * Starts the program by activating listeners on all Uniswap v3 and v2 protocols
 */
const main = async () => {
  let chains = UNISWAP;

  for (let i = 0; i < chains.length; i++) {
    let name = chains[i].name;
    let chainId = chains[i].chain_id;
    let v2Factory = chains[i].v2.factory;
    let v3Factory = chains[i].v3.factory;

    // Connect to websocket provider instance
    let provider = new Alchemy(getAlchemySettings(chainId));

    if (v2Factory != null) {
      console.log(`Activating ${name} V2 Listener!`);
      await activateV2Listener(v2Factory, chainId, provider);
    }

    if (v3Factory != null) {
      console.log(`Activating ${name} V3 Listener!`);
      await activateV3Listener(v3Factory, chainId, provider);
    }
  }
};

main();
