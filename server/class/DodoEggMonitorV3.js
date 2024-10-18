const { ethers } = require("ethers");
const Monitor = require("./Monitor");

const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const {
  abi: IERC20_ABI,
} = require("@openzeppelin/contracts/build/contracts/IERC20.json");

const IUniswapV3PoolInterface = new ethers.Interface(IUniswapV3PoolABI);

class DodoEggMonitorV3 extends Monitor {
  constructor(dodoEgg) {
    super(dodoEgg);
  }

  /**
   * Queries slot0 for token info
   * @returns the sqrtX96Price of the pool
   */
  async getPrice() {
    try {
      const poolContract = new ethers.Contract(
        this.dodoEgg.data.pairAddress,
        IUniswapV3PoolABI,
        await this.alchemy.config.getProvider()
      );

      const price = await poolContract.slot0();
      this.dodoEgg.data.baseTokenDecimal = await this.getTokenDecimals(
        this.dodoEgg.data.baseTokenAddress
      );

      this.dodoEgg.data.newTokenDecimal = await this.getTokenDecimals(
        this.dodoEgg.data.newTokenAddress
      );

      return price[0];
    } catch (error) {
      console.error("There was a problem getting v3 price!\n", error);
      return false;
    }
  }

  /**
   * Activates the v3 target listener
   */
  async targetListener() {
    // Filter for swap events
    const filter = {
      address: this.dodoEgg.data.pairAddress,
      topics: [IUniswapV3PoolInterface.getEvent("Swap").topicHash],
    };

    // Listen for swap events
    const listener = (log) => {
      console.log("Checking swap for updated price");

      // Check the price movement to see is it went above the targetPrice
      this.processPriceMovement(log);
    };

    // Listen to sync events
    this.alchemy.ws.on(filter, listener);

    // Set the targetListener instance varible
    this.dodoEgg.data.targetListener = { filter: filter, listener: listener };
  }

  /**
   * Decode v3 listener log for price data
   * @param log encoded output from listener
   */
  async processPriceMovement(log) {
    const decodedLog = IUniswapV3PoolInterface.parseLog(log);
    const {
      sender,
      recipient,
      amount0,
      amount1,
      sqrtPriceX96,
      liquidity,
      tick,
    } = decodedLog.args;

    const filter = IUniswapV3PoolInterface.encodeFunctionData("balanceOf", [
      this.dodoEgg.data.pairAddress,
    ]);

    // Call for the balance
    const baseAssetBalance = BigInt(
      await this.alchemy.core.call({
        to: this.dodoEgg.data.baseTokenAddress,
        data: filter,
      })
    );

    const zero = ethers.parseUnits(
      "0.001",
      Number(this.dodoEgg.data.baseTokenDecimal)
    );

    if (baseAssetBalance < zero) {
      // Signal that rug pull took place
      console.log(
        `!!***  RUG PULL DETECTED  ***!!\n *****  Pair Address: ${this.dodoEgg.data.pairAddress}  ******\n *****  Base Token Address: ${this.dodoEgg.data.baseTokenAddress}  ******\n *****  New Token Address: ${this.dodoEgg.newTokenAddress}  ******\n`
      );
      this.dodoEgg.data.tradeInProgress = false;
      this.stopTargetListener();
      // TODO: Send pair to DodoDetective
      //  ( Not yet implemented but will conduct audit on tokens
      //    and identifiy cause type of rug pull and investigate
      //    the addressess assosiated with )
    }

    if (sqrtPriceX96 > this.dodoEgg.data.targetPrice) {
      // TODO: Sell tokens for profit
      this.dodoEgg.data.tradeInProgress = false;
      this.stopTargetListener();
      console.log(
        `
*****************************************************************
*****************************************************************
**********                                                          
**********            Listener has been deactivated V3!!!        
**********    TIME TO SELL ${sqrtPriceX96}              
**********    Target Price ${this.dodoEgg.data.targetPrice}         
**********    Pair Address: ${this.dodoEgg.data.pairAddress}                 
**********                                                      
*****************************************************************
*****************************************************************
*****************************************************************
      `
      );
      console.log("");
    } else {
      console.log("Pair: ", this.dodoEgg.data.pairAddress);
      console.log("Current price: ", currentPrice);
      console.log("Target price: ", this.dodoEgg.data.targetPrice);
      console.log("Difference: ", currentPrice - this.dodoEgg.data.targetPrice);
      console.log("");
    }
  }
}

module.exports = DodoEggMonitorV3;
