const DodoEggMonitorV2 = require("./DodoEggMonitorV2");
const DodoEggMonitorV3 = require("./DodoEggMonitorV3");
const audit = require("../logic/audit");
const increaseByPercentage = require("./utils/increaseByPercentage");

class DodoEgg {
  /**
   * This constucter is used initially to create a new DodoEgg
   * @param {object} data JSON data of a DodoEgg
   */
  constructor(data) {
    // Instance variables
    this.data = data;

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
    if (this.data.v3) {
      this.dodoEggMonitor = new DodoEggMonitorV3(this.data);
    } else {
      this.dodoEggMonitor = new DodoEggMonitorV2(this.data);
    }
  }

  swapMonitorBattery() {
    if (this.monitorBattery) {
      clearTimeout(this.monitorBattery);
    }

    this.monitorBattery = setTimeout(() => {
      console.log("**  Battery will be replaced in 15 minutes!  **");
      this.plugInMonitor();
      if (this.data.tradeInProgress == true) {
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
    // Check for liquidity
    try {
      const liqudityCheck = await this.dodoEggMonitor.liquidityListener();

      if (liqudityCheck === false) {
        console.log(`Token didn't recieve liquidity`);
        console.log("");

        return false;
      }
    } catch (error) {
      console.log(
        "**  DodoEgg | error when checking for liquidity!  **\n",
        error
      );
      console.log("");

      this.dodoEggMonitor.stopLiquidityListener();
      return false;
    }

    // Check for a malicious code
    try {
      const auditResults = await audit(
        this.data.chainId,
        this.data.newTokenAddress
      );

      // If the audit fails, return false
      if (!auditResults.isSafe) {
        console.log(
          "******    Audit Results: Fail   ******\n",
          this.data.pairAddress
        );
        console.log("");

        return false;
      }

      // If the audit passes, return true
      console.log(
        "******    Audit Results: Pass   ******\n",
        this.data.pairAddress
      );
      console.log("");

      // Update the audit results
      this.data.auditResults = auditResults.fields;

      // Return true
      return true;
    } catch (error) {
      // If there was an error during the audit, return false
      console.log("**  DodoEgg | error during the audit!  **\n", error);
      console.log("");

      return false;
    }
  }

  /**
   * set a target price of 25% higher than the current price
   */
  async setTargetPrice() {
    // Get the current price and update the instance variable
    const currentPrice = await this.dodoEggMonitor.getPrice();
    this.data.intialPrice = currentPrice;

    // Set the target price by increasing the current price 25%
    this.data.targetPrice = increaseByPercentage(currentPrice, 25);

    return this.data.targetPrice;
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

    console.log("** Target Price  **\n", this.data.targetPrice);
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
      id: this.data.id,
      chainId: this.data.chainId,
      newToken: this.data.newTokenAddress,
      baseToken: this.data.baseTokenAddress,
      pairAddress: this.data.pairAddress,
      v3: this.data.v3,
      auditResults: this.data.auditResults,
      intialPrice:
        this.data.intialPrice == null ? "0" : this.data.intialPrice.toString(),
      targetPrice:
        this.data.targetPrice == null ? "0" : this.data.targetPrice.toString(),
      tradeInProgress: this.data.tradeInProgress,
      baseTokenDecimal: this.data.baseTokenDecimal,
      newTokenDecimal: this.data.newTokenDecimal,
      baseAssetReserve: this.data.baseAssetReserve,
      liquidityListener: this.data.liquidityListener,
      targetListener: this.data.targetListener,
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
