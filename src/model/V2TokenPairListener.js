const { ethers } = require("ethers");
const { Alchemy, Interface } = require("alchemy-sdk");
const WebSocket = require("ws");
const app = new WebSocket("ws://127.0.0.1:8000");
const getAlchemySettings = require("./model/utils/getAlchemySettings");

// Get contract ABI's
const {
  abi: UniswapV2FactoryABI,
} = require("@uniswap/v2-periphery/build/IUniswapV2Factory.json");

const FACTORY_V2_INTERFACE = new ethers.Interface(UniswapV2FactoryABI);

class V2TokenPairListener {
  /**
   *
   * @param {string} factoryAddress
   * @param {number} chainId
   */

  constructor(factoryAddress, chainId) {
    this.factoryAddress = factoryAddress;
    this.chainId = chainId;
    this.provider = new Alchemy(getAlchemySettings(chainId));
    this.activateListener();
  }

  /**
   * Activates a listener for a pair that is created on the Uniswap v2 protocol
   */
  activateListener() {
    const filter = {
      address: factoryAddress,
      topics: [FACTORY_V2_INTERFACE.getEvent("PairCreated").topicHash],
    };

    provider.ws.on(filter, (log) => {
      console.log("New PairCreated event detected!");
      this.processEventLog(log);
    });
  }

  /**
   * Decoded V2 log data
   * @param {string} log encoded event data
   */
  processEventLog(log) {
    // Decode the log
    const decodedLog = FACTORY_V2_INTERFACE.parseLog(log);

    // Extract the token0, token1, and pair address from the decoded log
    const { token0, token1, pair } = decodedLog.args;

    console.log(
      `
            ************* | V2 pair detected | *************\n
            ******\n
            ****** token0: ${token0}\n
            ****** token1: ${token1}\n
            ****** pair address: ${pair}\n
            ******\n
            ************************************************
            `
    );
    console.log("");

    // New token checking logic
    if (checkIfTokenIsNew(token0)) {
      // Create a data object
      const data = {
        chainId: this.chainId,
        newToken: token0,
        baseToken: token1,
        pairAddress: pair,
        v3: false,
      };

      // Send it to the app
      app.send(bigIntSafeSerialize(data));

      console.log(`Data sent to server`);
      console.log("");
    } else {
      // Check if the second token is new
      if (checkIfTokenIsNew(token1)) {
        // Create a data object
        const data = {
          chainId: this.chainId,
          newToken: token1,
          baseToken: token0,
          pairAddress: pair,
          v3: false,
        };

        // Send it to the app
        app.send(this.bigIntSafeSerialize(data));

        console.log(`Data sent to server`);
        console.log("");
      } else {
        console.log("These are two already known tokens...");
        console.log(token0 + "/" + token1);
        console.log("");
      }
    }
  }

  // Utility function for BigInt-safe serialization
  bigIntSafeSerialize(obj) {
    return JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  }
}

module.exports = V2TokenPairListener;
