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
        this.dodoEgg.pairAddress,
        IUniswapV3PoolABI,
        await this.alchemy.config.getProvider()
      );

      const price = await poolContract.slot0();
      this.dodoEgg.baseTokenDecimal = await this.getTokenDecimals(
        this.dodoEgg.baseTokenAddress
      );

      this.dodoEgg.newTokenDecimal = await this.getTokenDecimals(
        this.dodoEgg.newTokenAddress
      );

      return price[0];
    } catch (error) {
      console.error("There was a problem getting v3 price!\n", error);
      return false;
    }
  }

  // /**
  //  * Every 5 seconds calls balance of on the base token address
  //  * @returns the balance of the base token in the pair
  //  */
  // async liquidityListener() {
  //   return new Promise(async (resolve, reject) => {
  //     // Filter by the event we want to listen to
  //     const filter = {
  //       address: this.dodoEgg.pairAddress,
  //       topics: [IUniswapV3PoolInterface.getEvent("Mint").topicHash],
  //     };

  //     // Function that will be carried out when listener is triggered
  //     const listener = (log) => {
  //       // Check the price movement to see is it went above the targetPrice
  //       const result = this.processMintEvent(log);

  //       if (result) {
  //         console.log("Liquidity was added!");

  //         this.alchemy.ws.off(filter, listener);
  //         resolve({ liquidAdded: true });
  //       }
  //     };

  //     // Listen to mint events
  //     this.alchemy.ws.on(filter, listener);
  //     this.dodoEgg.liquidityListener = { filter: filter, listener: listener };

  //     // 5 minutes timeout
  //     setTimeout(() => {
  //       this.alchemy.ws.off(filter, listener);
  //       reject({ liquidAdded: false });
  //     }, 300000);
  //   });
  // }

  // processMintEvent(log) {
  //   const decodedLog = IUniswapV3PoolInterface.parseLog(log);
  //   const { sender, owner, tickLower, tickUpper, amount, amount0, amount1 } =
  //     decodedLog.args;

  //   if (amount0 > 0 && amount1 > 0) {
  //     return true;
  //   }
  // }

  /**
   * Activates the v3 target listener
   */
  async targetListener() {
    // Filter for swap events
    const filter = {
      address: this.dodoEgg.pairAddress,
      topics: [IUniswapV3PoolInterface.getEvent("Swap").topicHash],
    };

    // Listen for swap events
    const listener = (log) => {
      console.log("Checking sync for updated price");

      // Check the price movement to see is it went above the targetPrice
      this.processPriceMovement(log);
    };

    // Listen to sync events
    this.alchemy.ws.on(filter, listener);

    // Set the targetListener instance varible
    this.dodoEgg.targetListener = { filter: filter, listener: listener };
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

    const baseTokenContract = new ethers.Contract(
      this.dodoEgg.baseTokenAddress,
      IERC20_ABI,
      this.provider
    );

    const baseAssetBalance = await baseTokenContract.balanceOf(
      this.dodoEgg.pairAddress
    );

    if (
      baseAssetBalance <
      ethers.parseUnits("0.001", Number(this.dodoEgg.baseTokenDecimal))
    ) {
      // Signal that rug pull took place
      console.log(
        `!!***  RUG PULL DETECTED  ***!!\n *****  Pair Address: ${this.dodoEgg.pairAddress}  ******\n *****  Base Token Address: ${this.dodoEgg.baseTokenAddress}  ******\n *****  New Token Address: ${this.dodoEgg.newTokenAddress}  ******\n`
      );

      this.stopTargetListener();
      // TODO: Send pair to DodoDetective
      //  ( Not yet implemented but will conduct audit on tokens
      //    and identifiy cause type of rug pull and investigate
      //    the addressess assosiated with )
    }

    if (sqrtPriceX96 > this.dodoEgg.targetPrice) {
      // TODO: Sell tokens for profit

      this.stopTargetListener();
      console.log(
        `
*****************************************************************
*****************************************************************
**********                                                          
**********            Listener has been deactivated V3!!!        
**********    TIME TO SELL ${sqrtPriceX96}              
**********    Target Price ${this.dodoEgg.targetPrice}         
**********    Pair Address: ${this.dodoEgg.pairAddress}                 
**********                                                      
*****************************************************************
*****************************************************************
*****************************************************************
      `
      );
      console.log("");
    } else {
      console.log("Pair: ", this.dodoEgg.pairAddress);
      console.log("Current price: ", currentPrice);
      console.log("Target price: ", this.dodoEgg.targetPrice);
      console.log("Difference: ", currentPrice - this.dodoEgg.targetPrice);
      console.log("");
    }
  }
}

module.exports = DodoEggMonitorV3;
