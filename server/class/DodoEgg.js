const DodoEggMonitorV2 = require("./DodoEggMonitorV2");
const DodoEggMonitorV3 = require("./DodoEggMonitorV3");
const audit = require("../logic/audit");
const increaseByPercentage = require("./utils/increaseByPercentage");

class DodoEgg {
  /**
   * This constucter is used initially to create a new DodoEgg
   * @param {*} id uuidv4()
   * @param {*} chainId chain id of the blockchain
   * @param {*} newTokenAddress new token address
   * @param {*} baseTokenAddress base asset address (i.e. weth, usdc, ..)
   * @param {*} pairAddress address of the token pair
   * @param {*} v3 true if using Uniswap v3 protocol, false for Uniswap v2 protocol
   */
  constructor(
    id,
    chainId,
    newTokenAddress,
    baseTokenAddress,
    pairAddress,
    v3,
    auditResults,
    intialPrice,
    targetPrice,
    tradeInProgress,
    baseTokenDecimal,
    newTokenDecimal,
    baseAssetReserve,
    liquidityListener,
    targetListener
  ) {
    // Instance variables
    this.id = id;
    this.chainId = chainId;
    this.newTokenAddress = newTokenAddress;
    this.baseTokenAddress = baseTokenAddress;
    this.pairAddress = pairAddress;
    this.v3 = v3;

    this.auditResults = auditResults;
    this.intialPrice = intialPrice;
    this.targetPrice = targetPrice;
    this.tradeInProgress = tradeInProgress;

    this.baseTokenDecimal = baseTokenDecimal;
    this.newTokenDecimal = newTokenDecimal;
    this.baseAssetReserve = baseAssetReserve;
    this.liquidityListener = liquidityListener;
    this.targetListener = targetListener;

    this.dodoEggMonitor = null;
    this.monitorBattery = null;

    // Activate monitor
    this.batteryLife = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.plugInMonitor();
  }

  /**
   * Gives the dodoEgg monitoring abilities like:
   * getPrice, getTargetPrice, start/stop listeners
   */
  plugInMonitor() {
    if (this.v3) {
      this.dodoEggMonitor = new DodoEggMonitorV3(this);
    } else {
      this.dodoEggMonitor = new DodoEggMonitorV2(this);
    }
  }

  swapMonitorBattery() {
    if (this.monitorBattery) {
      clearTimeout(this.monitorBattery);
    }

    this.monitorBattery = setTimeout(() => {
      console.log("**  Battery will be replaced in 15 minutes!  **");
      this.plugInMonitor();
      if (this.tradeInProgress == true) {
        this.dodoEggMonitor.restartTargetListener();
      }
    }, this.batteryLife);
  }

  /**
   * Checks for liquidity and does a safty audit for malisious code
   * @returns true if the audit was safe false if it was unsafe
   */
  async conductAudit() {
    try {
      // Check for liqudity
      const waitForLiquid = await this.dodoEggMonitor.liquidityListener();

      // Check for a malicious code
      const auditResults = await audit(this.chainId, this.newTokenAddress);

      // Race between the token sniffer and the Mint event
      //const result = await Promise.race([auditResults, waitForLiquid]);

      if (result.liquidAdded) {
        // Wait for token aduit results
        const snifferResult = await auditResults;

        if (snifferResult.isSafe) {
          console.log(
            "******    Audit Results: Pass   ******\n",
            this.pairAddress
          );
          console.log("");
          this.auditResults = snifferResult.auditResults;

          return true;
        } else {
          console.log(`Token failed audit, unsafe pair: ${this.pairAddress}`);
          console.log("");

          return false;
        }
      } else {
        // Token sniffer completed first
        if (result.isSafe) {
          console.log(
            `Token is safe, waiting for liquidity on ${this.pairAddress}`
          );
          console.log("");

          const liquidCheck = await waitForLiquid;

          if (liquidCheck === false) {
            console.log(`Token didn't recieve liquidity`);
            console.log("");

            return false;
          }

          console.log(
            "******    Audit Results: Pass   ******\n",
            this.pairAddress
          );
          console.log("");

          this.auditResults = snifferResult.auditResults;

          return true;
        } else {
          console.log(`Token failed audit, unsafe pair: ${this.pairAddress}`);
          console.log("");

          this.dodoEggMonitor.stopLiquidityListener();

          return false;
        }
      }
    } catch (error) {
      console.log(
        "**  There was an error during the audit!  **\n **  Skipping pair: ",
        this.pairAddress
      );
      console.log("");
      this.dodoEggMonitor.stopLiquidityListener();
      return false;
    }
  }

  /**
   * set a target price of 25% higher than the current price
   */
  async setTargetPrice() {
    // Get the current price and update the instance variable
    const currentPrice = await this.dodoEggMonitor.getPrice();
    this.intialPrice = currentPrice;

    // Set the target price by increasing the current price 25%
    this.targetPrice = increaseByPercentage(currentPrice, 25);

    return this.targetPrice;
  }

  /**
   * Begins the trading process
   *  - starts by setting the target price
   *  - then it performs the trade
   *  -   - Maybe also start the lisnter that waits for a 2% increase
   *  -   - Or maybe wait for tx to be aproved
   *  - swap back to base asset
   *  - record trade profit/loss, date, amount, block
   */
  async incubator() {
    // TODO: SWAP FOR THE NEW TOKEN

    console.log("** Target Price  **\n", this.targetPrice);
    console.log("");

    // Todo activate listenr
    await this.dodoEggMonitor.targetListener();

    // Todo perform first swap
    // this.tradeInProgress = true

    // Todo second swap
  }

  /**
   * @returns current dodo egg info
   */
  getInfo() {
    return {
      id: this.id,
      chainId: this.chainId,
      newToken: this.newTokenAddress,
      baseToken: this.baseTokenAddress,
      pairAddress: this.pairAddress,
      v3: this.v3,
      auditResults: this.auditResults,
      intialPrice: this.intialPrice == null ? "0" : this.intialPrice.toString(),
      targetPrice: this.targetPrice == null ? "0" : this.targetPrice.toString(),
      tradeInProgress: this.tradeInProgress,
      baseTokenDecimal: this.baseTokenDecimal,
      newTokenDecimal: this.newTokenDecimal,
      baseAssetReserve: this.baseAssetReserve,
      liquidityListener: this.liquidityListener,
      targetListener: this.targetListener,
    };
  }
}

module.exports = DodoEgg;

// const v3 = false;
// const chain = "1";
// const id = "0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f";
// const baseToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const token = "0x6982508145454Ce325dDbE47a25d4ec3d2311933";

// const main = async () => {
//   const dodo = new DodoEgg("1", chain, token, baseToken, id, v3);

//   const target = await dodo.setTargetPrice();

//   console.log(target);
// };

// main();
