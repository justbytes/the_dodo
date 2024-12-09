const { ethers } = require("ethers");
const { Alchemy, Interface } = require("alchemy-sdk");
const WebSocket = require("ws");
const app = new WebSocket("ws://127.0.0.1:8000");
const getAlchemySettings = require("./utils/getAlchemySettings");
const checkIfTokenIsNew = require("./utils/newTokenChecker");

const {
  abi: UniswapV3FactoryABI,
} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json");

// Interface objects so the contract abis can be parsed
const FACTORY_V3_INTERFACE = new ethers.Interface(UniswapV3FactoryABI);

class V3TokenPairListener {
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
   * Activates a listener for a pair that is created on the Uniswap v3 protocol
   */
  activateListener() {
    console.log(`Activating ${this.chainId} V3 listener!`);
    // Filter for PoolCreated events indicating a new pool
    const filter = {
      address: this.factoryAddress,
      topics: [FACTORY_V3_INTERFACE.getEvent("PoolCreated").topicHash],
    };

    // Activate the listener
    this.provider.ws.on(filter, (log) => {
      console.log("New PoolCreated event detected!");
      this.processEventLog(log);
    });
  }

  /**
   * Decoded v3 log data
   * @param {*} log encoded event data
   * @param {*} chainId pass the chain id of the blockchain
   */
  processEventLog(log) {
    const decodedLog = FACTORY_V3_INTERFACE.parseLog(log);

    const { token0, token1, fee, tickSpacing, pool } = decodedLog.args;

    console.log(
      `
************* | V3 pair detected | *************\n
******\n
****** chainId: ${this.chainId}\n
****** token0: ${token0}\n
****** token1: ${token1}\n
****** pair address: ${pool}\n
****** fee: ${fee}\n
******\n
************************************************
`
    );
    console.log("");

    let data;

    // New token checking logic
    if (!checkIfTokenIsNew(token0)) {
      // Create a data object
      data = {
        chainId: this.chainId,
        newTokenAddress: token1,
        baseTokenAddress: token0,
        pairAddress: pool,
        v3: true,
        fee: fee,
      };
    } else {
      data = {
        chainId: this.chainId,
        newTokenAddress: token0,
        baseTokenAddress: token1,
        pairAddress: pool,
        v3: true,
        fee: fee,
      };
    }

    // Send it to the app
    app.send(this.bigIntSafeSerialize(data));

    console.log(`Data sent to server`);
    console.log("");
  }

  // Utility function for BigInt-safe serialization
  bigIntSafeSerialize(obj) {
    return JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
  }
}

module.exports = V3TokenPairListener;
