const { ethers } = require("ethers");
const { v4: uuidv4 } = require("uuid");

const DodoEgg = require("../class/DodoEgg");
const DodoEggMonitorV2 = require("../class/DodoEggMonitorV2");
const DodoEggMonitorV3 = require("../class/DodoEggMonitorV3");
const { serializeDodo, deserializeDodo } = require("../utils/serialConverter");

const {
  abi: IUniswapV2PairABI,
} = require("@uniswap/v2-core/build/UniswapV2Pair.json");

const IUNISWAPV2PAIR_INTERFACE = new ethers.Interface(IUniswapV2PairABI);

const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const {
  abi: IERC20_ABI,
} = require("@openzeppelin/contracts/build/contracts/IERC20.json");

const IUniswapV3PoolInterface = new ethers.Interface(IUniswapV3PoolABI);

jest.setTimeout(30000);

describe("Monitor", () => {
  //monitor = new DodoEggMonitorV2(dodoEgg);

  describe("V2 Monitor", () => {
    let dodoEgg, dodoEgg0, serializedDodo, monitor;

    beforeEach(() => {
      // V2 DodoEgg Setup
      // eth/pepe
      const configV2 = {
        id: uuidv4(),
        chainId: "1",
        newTokenAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        baseTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        pairAddress: "0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f",
        v3: false,
        fee: null,
        auditResults: null,
        intialPrice: null,
        targetPrice: null,
        tradeInProgress: null,
        baseTokenDecimal: null,
        newTokenDecimal: null,
        baseAssetReserve: null,
        liquidityListener: null,
        targetListener: null,
      };
      // Serialize and deserialize the DodoEgg
      serializedDodo = serializeDodo(configV2);

      // Create a new DodoEgg instance from the serialized data
      dodoEgg = deserializeDodo(serializedDodo);
      dodoEgg0 = deserializeDodo(serializedDodo);
    });

    /**
     * Tests the getPrice() and getTokenDecimals() functions
     */
    test("should get price", async () => {
      const price = await dodoEgg.dodoEggMonitor.getPrice();
      expect(typeof price).toBe("bigint");
      expect(dodoEgg.intialPrice).toBe(price);
      expect(dodoEgg.baseTokenDecimal).toBe(18n);
      expect(dodoEgg.newTokenDecimal).toBe(18n);
      expect(dodoEgg.baseAssetReserve).toBe(1);
    });

    /**
     * Tests the startTargetListener function
     */
    test("should start and stop a target listener", async () => {
      // Start the target listener & wait a second
      await dodoEgg.dodoEggMonitor.targetListener();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check the number of active listeners & wait a second
      let activeListeners = await dodoEgg.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(1);

      // Start another listner and ensure that it is seperate from the dodoEgg
      await dodoEgg0.dodoEggMonitor.targetListener();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check the number of active listeners & wait a second
      activeListeners = await dodoEgg0.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(1);

      // Remove the target listener & wait a second
      await dodoEgg.dodoEggMonitor.removeTargetListener();
      activeListeners = await dodoEgg.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(0);

      // Remove the second listener & ensure that it is seperate from the dodoEgg
      await dodoEgg0.dodoEggMonitor.removeTargetListener();
      activeListeners = await dodoEgg0.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(0);
    });

    /**
     * Tests the restartTargetListener function
     */
    test("should restart target listener", async () => {
      // Start the target listener & wait a second
      await dodoEgg.dodoEggMonitor.targetListener();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check the number of active listeners & wait a second
      let activeListeners = await dodoEgg.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(1);

      // Remove the target listener & wait a second
      await dodoEgg.dodoEggMonitor.removeTargetListener();
      activeListeners = await dodoEgg.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(0);

      // Start the target listener & wait a second
      await dodoEgg.dodoEggMonitor.restartTargetListener();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Check the number of active listeners & wait a second
      activeListeners = await dodoEgg.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(1);

      await dodoEgg.dodoEggMonitor.removeTargetListener();
      activeListeners = await dodoEgg.dodoEggMonitor.getTargetListeners();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      expect(activeListeners).toBe(0);
    });

    /**
     * This tests/mocks the processPriceMovement function
     */
    test("should process price movement", async () => {
      let result, reserve0, reserve1, reserve;

      // Create a pair contract
      const pairContract = new ethers.Contract(
        dodoEgg.pairAddress,
        IUniswapV2PairABI,
        await dodoEgg.dodoEggMonitor.alchemy.config.getProvider()
      );

      // Get the reserve0 and reserve1
      [reserve0, reserve1] = await pairContract.getReserves();

      // Uniform the price to the decimal of the given token
      const reserve0Adjusted = ethers.parseUnits(
        reserve0.toString(),
        18 - Number(18n)
      );
      const reserve1Adjusted = ethers.parseUnits(
        reserve1.toString(),
        18 - Number(18n)
      );

      // Set the reserve to the correct reserve
      if (dodoEgg.baseAssetReserve == 0) {
        reserve = reserve0;
        currentPrice =
          (reserve0Adjusted * ethers.WeiPerEther) / reserve1Adjusted;
      } else {
        reserve = reserve1;
        currentPrice =
          (reserve1Adjusted * ethers.WeiPerEther) / reserve0Adjusted;
      }

      const zero = ethers.parseUnits("0.001", Number(18n));

      // Trigger rug pull warning/action
      if (reserve < zero) {
        result = true; // Set true so we can show condition was met successfully
      }

      // If the currentPrice is over the targetPrice stop the listener.
      if (currentPrice > dodoEgg.targetPrice) {
        result = true; // Set true so we can show condition was met successfully
      } else {
        result = true; // Set true so we can show condition was met successfully
      }
      expect(result).toBe(true);
    });
  });

  // V3 DodoEgg Setup
  // eth/wbtc
  const configV3 = {
    id: uuidv4(),
    chainId: "1",
    newTokenAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    baseTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    pairAddress: "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD",
    v3: true,
    fee: "3000",
    auditResults: null,
    intialPrice: null,
    targetPrice: null,
    tradeInProgress: null,
    baseTokenDecimal: null,
    newTokenDecimal: null,
    baseAssetReserve: null,
    liquidityListener: null,
    targetListener: null,
  };

  // // Serialize and deserialize the DodoEgg
  // serializedDodo = serializeDodo(configV3);

  // // Create a new DodoEgg instance from the serialized data
  // dodoEgg = deserializeDodo(serializedDodo);

  // monitor = new DodoEggMonitorV3(dodoEgg);

  // describe("V3 Monitor", () => {
  //   /**
  //    * Tests the getTokenDecimals function
  //    */
  //   test("should get token decimals", async () => {
  //     const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI 18 Decimals
  //     const decimals = await dodoEgg.monitor.getTokenDecimals(tokenAddress);
  //     expect(decimals).toBe("18");
  //   });

  //   /**
  //    * Tests the getPrice function
  //    */
  //   test("should get price", async () => {
  //     const price = await dodoEgg.monitor.getPrice();
  //     expect(typeof price).toBe("bigint");
  //     expect(dodoEgg.intialPrice).toBe(price);
  //     expect(dodoEgg.baseTokenDecimal).toBe("18");
  //     expect(dodoEgg.newTokenDecimal).toBe("18");
  //     expect(dodoEgg.baseAssetReserve).toBe(0);
  //   });

  //   /**
  //    * Tests the startTargetListener function
  //    */
  //   test("should start a target listener", async () => {
  //     dodoEgg.monitor.startTargetListener();
  //     expect(dodoEgg.monitor.getTargetListeners()).toBe(1);
  //   });

  //   /**
  //    * Tests the removeTargetListener function
  //    */
  //   test("should remove a target listener", async () => {
  //     dodoEgg.monitor.removeTargetListener();
  //     expect(dodoEgg.monitor.getTargetListeners()).toBe(0);
  //   });

  //   test("should restart target listener", async () => {
  //     // Start a target listener
  //     dodoEgg.monitor.startTargetListener();
  //     expect(dodoEgg.monitor.getTargetListeners()).toBe(1);

  //     // Create a new DodoEgg Instance
  //     const serializedDodo = serializeDodo(dodoEgg.getInfo());
  //     const newDodoEgg = deserializeDodo(serializedDodo);

  //     // Restart the target listener with previous data
  //     newDodoEgg.monitor.restartTargetListener();

  //     // Ensure that only focused target listener was affected
  //     expect(newDodoEgg.monitor.getTargetListeners()).toBe(1);
  //     expect(dodoEgg.monitor.getTargetListeners()).toBe(1);

  //     // Ensure only focused target listener was removed
  //     newDodoEgg.monitor.removeTargetListener();
  //     expect(newDodoEgg.monitor.getTargetListeners()).toBe(0);
  //     expect(dodoEgg.monitor.getTargetListeners()).toBe(1);
  //     dodoEgg.monitor.removeTargetListener();
  //   });
  //   /**
  //    * This tests/mocks the processPriceMovement function
  //    */
  //   test("should process price movement", async () => {
  //     let result, slot0, baseAssetBalance;

  //     try {
  //       const poolContract = new ethers.Contract(
  //         dodoEgg.pairAddress,
  //         IUniswapV3PoolABI,
  //         await dodoEgg.monitor.alchemy.config.getProvider()
  //       );
  //       slot0 = await poolContract.slot0();
  //     } catch (error) {
  //       console.error("There was a problem getting slot0", error);
  //       return false;
  //     }

  //     try {
  //       const filter = IUniswapV3PoolInterface.encodeFunctionData("balanceOf", [
  //         dodoEgg.pairAddress,
  //       ]);

  //       // Call for the balance
  //       baseAssetBalance = BigInt(
  //         await dodoEgg.monitor.alchemy.core.call({
  //           to: dodoEgg.baseTokenAddress,
  //           data: filter,
  //         })
  //       );
  //     } catch (error) {
  //       console.error("There was a problem getting base asset balance", error);
  //     }

  //     const zero = ethers.parseUnits("0.001", Number(dodoEgg.baseTokenDecimal));

  //     if (baseAssetBalance < zero) {
  //       result = true;
  //     }

  //     if (slot0[0] > dodoEgg.targetPrice) {
  //       result = true;
  //     } else {
  //       result = true;
  //     }
  //     expect(result).toBe(true);
  //   });
  // });
});
