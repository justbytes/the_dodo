const DodoEggMonitorV2 = require("./DodoEggMonitorV2");
const DodoEggMonitorV3 = require("./DodoEggMonitorV3");
const audit = require("../logic/audit");
const increaseByPercentage = require("./utils/increaseByPercentage");

class DodoEgg {
  /**
   * This constucter is used initially to create a new DodoEgg
   * @param {object} data JSON data of a DodoEgg
   */

  constructor(
    id,
    chainId,
    newTokenAddress,
    baseTokenAddress,
    pairAddress,
    v3,
    fee,
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
    this.fee = fee;
    this.auditResults = auditResults;
    this.intialPrice = intialPrice;
    this.targetPrice = targetPrice;
    this.tradeInProgress = tradeInProgress === null ? false : tradeInProgress; // Default to false if not provided
    this.baseTokenDecimal = baseTokenDecimal;
    this.newTokenDecimal = newTokenDecimal;
    this.baseAssetReserve = baseAssetReserve;
    this.liquidityListener = liquidityListener;
    this.targetListener = targetListener;

    this.auditResults = false;
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
    //
    // Check for a malicious code
    try {
      console.log("AuditResults");

      const auditResults = await audit(this.chainId, this.newTokenAddress);

      console.log("AuditResults Finsihed");

      // If the audit fails, return false
      if (!auditResults.isSafe) {
        console.log(
          "******    Audit Results: Fail   ******\n",
          this.pairAddress
        );
        console.log("");

        return false;
      }

      // If the audit passes, return true
      console.log("******    Audit Results: Pass   ******\n", this.pairAddress);
      console.log("");

      // Update the audit results
      this.auditResults = auditResults.fields;

      // Continue with liquidity check
    } catch (error) {
      // If there was an error during the audit, return false
      console.log("**  DodoEgg | error during the audit!  **\n", error);
      console.log("");

      return false;
    }

    // // Check for liquidity
    // try {
    //   console.log("Liquidity check!");

    //   const liqudityCheck = await this.dodoEggMonitor.liquidityListener();

    //   console.log("Liquidity done!", liqudityCheck);

    //   if (liqudityCheck) {
    //     console.log(`Liquidity check passed`);
    //     console.log("");

    //     return true;
    //   } else {
    //     console.log("Liquidity check failed");
    //     return false;
    //   }
    // } catch (error) {
    //   console.log(
    //     "**  DodoEgg | error when checking for liquidity!  **\n",
    //     error
    //   );
    //   console.log("");

    //   this.dodoEggMonitor.stopLiquidityListener();
    //   return false;
    // }
  }

  /**
   * set a target price of 25% higher than the current price
   */
  async setTargetPrice() {
    // Get the current price and update the instance variable
    const currentPrice = await this.dodoEggMonitor.getPrice();
    //this.intialPrice = currentPrice;

    // Set the target price by increasing the current price 25%
    const basisPoints = BigInt(25 * 100);

    // Perform the calculation
    const increase = (currentPrice * basisPoints) / BigInt(10000);
    const newValue = currentPrice + increase;

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
