const { ethers } = require("ethers");
const { Alchemy, Interface } = require("alchemy-sdk");
const getAlchemySettings = require("./utils/getAlchemySettings");
const checkIfTokenIsNew = require("./utils/newTokenChecker");

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

  constructor(app, factoryAddress, chainId) {
    this.totalSent = 0;
    this.app = app;
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
      address: this.factoryAddress,
      topics: [FACTORY_V2_INTERFACE.getEvent("PairCreated").topicHash],
    };

    this.provider.ws.on(filter, (log) => {
      this.processEventLog(log).catch((err) => {
        console.log("Error processing event log", err);
      });
    });
  }

  /**
   * Decoded V2 log data
   * @param {string} log encoded event data
   */
  async processEventLog(log) {
    // Decode the log
    const decodedLog = FACTORY_V2_INTERFACE.parseLog(log);

    // Extract the token0, token1, and pair address from the decoded log
    const { token0, token1, pair } = decodedLog.args;

    console.log("************* | V2 pair detected | *************");
    console.log("");

    let data;

    // New token checking logic
    if (!checkIfTokenIsNew(token0)) {
      // Create a data object
      data = {
        chainId: this.chainId,
        newTokenAddress: token1,
        baseTokenAddress: token0,
        pairAddress: pair,
        v3: false,
      };
    } else {
      data = {
        chainId: this.chainId,
        newTokenAddress: token0,
        baseTokenAddress: token1,
        pairAddress: pair,
        v3: false,
      };
    }

    // Send it to the app
    await this.app.auditDodo(this.bigIntSafeSerialize(data));

    // Increment the total sent
    this.totalSent++;
  }

  // Utility function for BigInt-safe serialization
  bigIntSafeSerialize(obj) {
    return JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  }
}

module.exports = V2TokenPairListener;
