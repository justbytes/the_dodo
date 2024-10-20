const { ethers, AlchemyProvider, Interface } = require("ethers");
const { Alchemy } = require("alchemy-sdk");
const getAlchemySettings = require("../utils/getAlchemySettings");
const verifyCode = require("./utils/verifyDeployment");

// ABI's for smart contracts

const {
  abi: ERC20_ABI,
} = require("@openzeppelin/contracts/build/contracts/ERC20.json");

const ERC20_INTERFACE = new ethers.Interface(ERC20_ABI);

/**
 * Base class for the v2 and v3 egg monitorsreturn;
 */
class Monitor {
  /**
   * Initilize constructor variables
   */
  constructor(dodoEgg) {
    // Instance variables
    this.dodoEgg = dodoEgg;
    this.stop = false;

    // Initialize providers
    this.alchemy = new Alchemy(getAlchemySettings(this.dodoEgg.chainId));
  }

  /**
   * gets the token decimals
   * @param tokenAddress address of target token
   * @returns decimal of a token
   */
  async getTokenDecimals(tokenAddress) {
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        await this.alchemy.config.getProvider()
      );

      return await tokenContract.decimals();
    } catch (error) {
      console.error("There was an error gettting token decimals! \n", error);
    }
  }

  /**
   * Every 5 seconds calls balance of on the base token address
   * @returns the balance of the base token in the pair
   */
  async liquidityListener() {
    console.log("Liquidity Listener");

    // try {
    //   await verifyCode(
    //     await this.alchemy.config.getProvider(),
    //     this.dodoEgg.newTokenAddress,
    //     this.dodoEgg.pairAddress
    //   );
    // } catch (error) {
    //   console.log(
    //     "***  ERROR | There was an error verifying token and pair deployment  ***\n"
    //   );
    //   return false;
    // }

    // Checks to ensure liquidity is added
    try {
      let count = 0;
      while (this.stop === false) {
        // Create a balanceOf filter with alchemy-sdk
        const filter = ERC20_INTERFACE.encodeFunctionData("balanceOf", [
          this.dodoEgg.pairAddress,
        ]);

        // Call for the balance
        const balance = BigInt(
          await this.alchemy.core.call({
            to: this.dodoEgg.baseTokenAddress,
            data: filter,
          })
        );

        console.log(`Balance: ${balance} Count: ${count}`);

        // If the balance is greater then 0 resolve else wait 5 seconds and retry
        if (balance > 0) {
          console.log("Liquidity added: ", balance);

          this.stop = true;

          return true;
        } else {
          console.log(`Liquidity not added yet still waiting. Count: ${count}`);

          // Allows for a 1 minute and 15 second window to look for liquidity
          if (count < 30) {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            count++;
          } else {
            console.log("Liquidity Check Failed.");
            this.stop = true;
            return false;
          }
        }
      }
    } catch (error) {
      console.log(
        "ERROR | There was an error calling balanceOf on pair: ",
        this.dodoEgg.pairAddress
      );
      console.log("");

      return false;
    }
  }

  /**
   * Stops liquidity listener
   */
  stopLiquidityListener() {
    this.stop = true;
  }

  restartTargetListener() {
    this.alchemy.ws.on(
      this.dodoEgg.targetListener.filter,
      this.dodoEgg.targetListener.listener
    );
  }

  /**
   * Removes a "Sync" event filter
   */
  stopTargetListener() {
    this.alchemy.ws.off(
      this.dodoEgg.targetListener.filter,
      this.dodoEgg.targetListener.listener
    );
  }
}

module.exports = Monitor;

// const v3 = false;
// const chain = "1";
// const id = "0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f";
// const baseToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const token = "0x6982508145454Ce325dDbE47a25d4ec3d2311933";

// const main = async () => {
//   const monitor = new DodoEggMonitor(chain, token, baseToken, id, v3);

//   let slot0 = await monitor.getCurrentPrice();

//   console.log(slot0);
// };

// const v3 = true;
// const chain = "1";
// const id = "0x1d42064Fc4Beb5F8aAF85F4617AE8b3b5B8Bd801";
// const baseToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// const token = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

// const main = async () => {
//   const monitor = new DodoEggMonitor(chain, token, baseToken, id, v3);

//   let slot0 = await monitor.getCurrentPrice();
// };

// main();
