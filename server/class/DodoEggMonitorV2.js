const { ethers, Interface } = require("ethers");
const Monitor = require("./Monitor");

const {
  abi: IUniswapV2PairABI,
} = require("@uniswap/v2-core/build/UniswapV2Pair.json");

const IUNISWAPV2PAIR_INTERFACE = new ethers.Interface(IUniswapV2PairABI);

class DodoEggMonitorV2 extends Monitor {
  constructor(dodoEgg) {
    super(dodoEgg);
  }

  /**
   * Gets the price of the pair
   * @returns the price in terms of base token
   */
  async getPrice() {
    try {
      console.log("GEtting price");

      const pairContract = new ethers.Contract(
        this.dodoEgg.data.pairAddress,
        IUniswapV2PairABI,
        await this.alchemy.config.getProvider()
      );

      const [reserve0, reserve1] = await pairContract.getReserves();

      console.log(reserve0, reserve1);

      const token0 = await pairContract.token0();

      console.log("Token 0: ", token0);

      // Get token decimals
      this.dodoEgg.data.baseTokenDecimal = await this.getTokenDecimals(
        this.dodoEgg.data.baseTokenAddress
      );
      this.dodoEgg.data.newTokenDecimal = await this.getTokenDecimals(
        this.dodoEgg.data.newTokenAddress
      );

      // Adjust the big number to
      const reserve0Adjusted = ethers.parseUnits(
        reserve0.toString(),
        18 - Number(this.dodoEgg.data.baseTokenDecimal)
      );
      const reserve1Adjusted = ethers.parseUnits(
        reserve1.toString(),
        18 - Number(this.dodoEgg.data.newTokenDecimal)
      );

      if (
        this.dodoEgg.data.baseTokenAddress.toLowerCase() ===
        token0.toLowerCase()
      ) {
        const price =
          (reserve0Adjusted * ethers.WeiPerEther) / reserve1Adjusted;

        this.dodoEgg.data.baseAssetReserve = 0;

        return price;
      } else {
        const price =
          (reserve1Adjusted * ethers.WeiPerEther) / reserve0Adjusted;
        this.dodoEgg.data.baseAssetReserve = 1;
        return price;
      }
    } catch (error) {
      console.error("There was a problem getting v2 price!\n", error);
      return false;
    }
  }

  /**
   * Activates v2 target listener
   */
  async targetListener() {
    // Filter for a sync event
    const filter = {
      address: this.dodoEgg.data.pairAddress,
      topics: [IUNISWAPV2PAIR_INTERFACE.getEvent("Sync").topicHash],
    };

    const listener = (log) => {
      console.log("Checking sync for updated price");

      // Check the price movement to see is it went above the targetPrice
      this.processPriceMovement(log);
    };

    // Listen to sync events
    this.alchemy.ws.on(filter, listener);

    this.dodoEgg.data.targetListener = { filter: filter, listener: listener };
  }

  /**
   * Decode v2 data from listener
   * @param log
   */
  processPriceMovement(log) {
    let currentPrice, reserve;

    // Decode log data
    const decodedLog = IUNISWAPV2PAIR_INTERFACE.parseLog(log);
    const { reserve0, reserve1 } = decodedLog.args;

    // Uniform the price to the decimal of the given token
    const reserve0Adjusted = ethers.parseUnits(
      reserve0.toString(),
      18 - Number(this.dodoEgg.data.baseTokenDecimal)
    );

    const reserve1Adjusted = ethers.parseUnits(
      reserve1.toString(),
      18 - Number(this.dodoEgg.data.newTokenDecimal)
    );

    if (this.dodoEgg.data.baseAssetReserve == 0) {
      reserve = reserve0;
      currentPrice = (reserve0Adjusted * ethers.WeiPerEther) / reserve1Adjusted;
    } else {
      reserve = reserve1;
      currentPrice = (reserve1Adjusted * ethers.WeiPerEther) / reserve0Adjusted;
    }

    const zero = ethers.parseUnits(
      "0.001",
      Number(this.dodoEgg.data.baseTokenDecimal)
    );

    // Signal that rug pull took place
    if (reserve < zero) {
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

    // If the currentPrice is over the targetPrice stop the listener.
    if (currentPrice > this.dodoEgg.data.targetPrice) {
      // TODO: Sell tokens for profit
      this.dodoEgg.data.tradeInProgress = false;
      this.stopTargetListener();
      console.log(
        `
*****************************************************************
*****************************************************************
**********                                                          
**********            Listener has been deactivated V2!!!        
**********    TIME TO SELL ${currentPrice}              
**********    Target Price ${this.dodoEgg.data.targetPrice}         
**********    Pair Address: ${this.dodoEgg.data.pairAddress}                 
**********                                                      
*****************************************************************
*****************************************************************
*****************************************************************
      `
      );
    } else {
      console.log("**** Pair: ", this.dodoEgg.data.pairAddress);
      console.log("*** Current price: ", currentPrice);
      console.log("** Target price: ", this.dodoEgg.data.targetPrice);
      console.log(
        "* Difference: ",
        this.dodoEgg.data.targetPrice - currentPrice
      );
      console.log("");
    }
  }
}

module.exports = DodoEggMonitorV2;
