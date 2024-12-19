/**
 * The Trader class is responsible for trading the token pairs
 *
 * Trader will be interacting with 2 Blockchain scripts, one that takes a snapshot of mainnet and tries to trade
 * the second that preforms real trades.
 *
 * Its first mission is to create a private/local snapshot of the targeted blockchain and should attempt to
 * trade the token pair to see if its safe / has any functions that prevent a buy/sell or other malisous behaviours.
 *
 * Its second mission is to then if it is safe snipe the token on the mainnet. When a target price is reached it should
 * exit a trade record everything and send it to the processTrade function in the app.js file for further research.
 */

class Trader {
  constructor(dodoEgg) {
    this.dodoEgg = dodoEgg;
  }

  /**
   * Starts the trader queue
   */
  startQueue() {
    console.log("Trader queue started");
  }

  stopQueue() {
    console.log("Trader queue stopped");
  }

  async main() {
    // TODO: Get the correct amount of the base asset to swap
    // TODO: Swap the token pair
    // TODO: Start the targetPriceListener
  }

  async swap() {
    // TODO: Swap the token pair
  }

  async startTargetPriceListener() {
    // TODO: Start the targetPriceListener
  }
}

module.exports = Trader;
