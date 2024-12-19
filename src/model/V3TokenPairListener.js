const { ethers } = require("ethers");
const { Alchemy, Interface } = require("alchemy-sdk");
const getAlchemySettings = require("./utils/getAlchemySettings");
const checkIfTokenIsNew = require("./utils/newTokenChecker");
const WebSocket = require("ws");

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
    this.totalSent = 0;
    this.server = new WebSocket("ws://localhost:8069");
    this.factoryAddress = factoryAddress;
    this.chainId = chainId;
    this.provider = new Alchemy(getAlchemySettings(chainId));
    this.activateListener();
  }

  /**
   * Activates a listener for a pair that is created on the Uniswap v3 protocol
   */
  activateListener() {
    console.log("************* | Activating V3 listener | *************");
    try {
      // Filter for PoolCreated events indicating a new pool
      const filter = {
        address: this.factoryAddress,
        topics: [FACTORY_V3_INTERFACE.getEvent("PoolCreated").topicHash],
      };

      // Activate the listener
      this.provider.ws.on(filter, (log) => {
        this.processEventLog(log);
      });
    } catch (error) {
      console.error(
        `There was an error activating the ${this.chainId} V3 listener.\n` +
          error
      );
    }
  }

  /**
   * Decoded v3 log data
   * @param {*} log encoded event data
   * @param {*} chainId pass the chain id of the blockchain
   */
  async processEventLog(log) {
    const decodedLog = FACTORY_V3_INTERFACE.parseLog(log);

    const { token0, token1, fee, tickSpacing, pool } = decodedLog.args;

    console.log("************* | V3 pair detected | *************");
    console.log("");

    let data;

    // Find out which token is new
    const { newToken, baseToken } = checkIfTokenIsNew(token0, token1);

    // If both tokens are known, return
    if (!newToken) {
      console.log("************* | Both tokens are known | *************");
      return;
    }

    // Create a data object
    data = {
      chainId: this.chainId,
      newTokenAddress: newToken,
      baseTokenAddress: baseToken,
      pairAddress: pool,
      v3: true,
      fee: fee,
    };

    // Send it to the server
    this.server.send(this.bigIntSafeSerialize(data));

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

module.exports = V3TokenPairListener;
