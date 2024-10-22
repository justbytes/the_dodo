const { ethers } = require("ethers");
const DodoEgg = require("../class/DodoEgg");
const { v4: uuidv4 } = require("uuid");

jest.setTimeout(30000); // Set timeout to 30 seconds for all tests in this file
const ethConfigV2 = {
  id: uuidv4(),
  chainId: "1",
  newTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  baseTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  pairAddress: "0x1234567890123456789012345678901234567890",
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

const ethConfigV3 = {
  id: uuidv4(),
  chainId: "1",
  newTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  baseTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  pairAddress: "0x1234567890123456789012345678901234567890",
  v3: true,
  fee: null, // TODO: add fee
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

const baseConfigV2 = {
  id: uuidv4(),
  chainId: "8453",
  newTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  baseTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  pairAddress: "0x1234567890123456789012345678901234567890",
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

const baseConfigV3 = {
  id: uuidv4(),
  chainId: "8453",
  newTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  baseTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  pairAddress: "0x1234567890123456789012345678901234567890",
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

describe("ETH DodoEgg", async () => {
  let dodoEggV2, dodoEggV3;

  dodoEggV2 = new DodoEgg({
    ...ethConfig,
  });

  dodoEggV3 = new DodoEgg({
    ...ethConfigV3,
  });

  describe("V2 DodoEgg", () => {
    test("DodoEgg initializes correctly", () => {
      expect(dodoEggV2.pairAddress).toBe(ethConfigV2.pairAddress);
      expect(dodoEggV2.baseTokenAddress).toBe(ethConfigV2.baseTokenAddress);
      expect(dodoEggV2.newTokenAddress).toBe(ethConfigV2.newTokenAddress);
      expect(dodoEggV2.tradeInProgress).toBe(false);
      expect(dodoEggV2.v3).toBe(ethConfigV2.v3);
      expect(dodoEggV2.fee).toBe(ethConfigV2.fee);
    });

    test("should get current price", async () => {
      const price = await dodoEggV2.dodoEggMonitor.getPrice();
      expect(typeof price).toBe("bigint");
      expect(dodoEggV2.intialPrice).toBe(price);
      expect(dodoEggV2.baseTokenDecimal).not.toBeNull();
      expect(dodoEggV2.newTokenDecimal).not.toBeNull();
      expect(dodoEggV2.baseAssetReserve).not.toBeNull();
    });

    test("should set target price", async () => {
      const targetPrice = await dodoEggV2.setTargetPrice();
      expect(typeof targetPrice).toBe("bigint");
      expect(dodoEggV2.targetPrice).toBe(targetPrice);
    });

    test("should start target listener", async () => {
      not.toBeNull();
      dodoEggV2.dodoEggMonitor.targetListener();
      expect(dodoEggV2.targetListener).toBeDefined();
    });

    test("should pass token audit", async () => {
      const auditResults = await dodoEggV2.passTokenAudit();
      expect(auditResults).toBe(true);
      expect(dodoEggV2.auditResults).toBe(auditResults);
    });

    test("should update dodoEgg instance variables", () => {
      const dodoInfo = dodoEggV2.getInfo();
      expect(dodoInfo.baseAssetReserve).not.toBeNull();
      expect(dodoInfo.newTokenDecimal).not.toBeNull();
      expect(dodoInfo.baseTokenDecimal).not.toBeNull();
      expect(dodoInfo.intialPrice).not.toBeNull();
      expect(dodoInfo.targetPrice).not.toBeNull();
      expect(dodoInfo.tradeInProgress).toBe(false);
      expect(dodoInfo.auditResults).not.toBeNull();
      expect(dodoInfo.targetListener).not.toBeNull();
    });

    test("should recreate old dodoEgg instance", async () => {
      const oldEgg = dodoEggV2.getInfo();

      const newDodoEgg = new DodoEgg({
        ...oldEgg,
      });
      expect(newDodoEgg.targetListener.filter).toBe(
        dodoEggV2.targetListener.filter
      );
      expect(newDodoEgg.targetListener.listener).toBe(
        dodoEggV2.targetListener.listener
      );
      expect(newDodoEgg.intialPrice).toBe(dodoEggV2.intialPrice);
      expect(newDodoEgg.targetPrice).toBe(dodoEggV2.targetPrice);

      newDodoEgg.dodoEggMonitor.restartTargetListener();
      expect(newDodoEgg.targetListenerActive).toBe(true);
    });

    test("should remove target listener", async () => {
      dodoEggV2.dodoEggMonitor.stopTargetListener();
      expect(dodoEggV2.targetListener).toBeNull();
    });

    // test("should handle trade execution", async () => {
    // });
  });

  describe("V3 DodoEgg", () => {
    test("DodoEgg initializes correctly", () => {
      expect(dodoEggV3.pairAddress).toBe(ethConfigV3.pairAddress);
      expect(dodoEggV3.baseTokenAddress).toBe(ethConfigV3.baseTokenAddress);
      expect(dodoEggV3.newTokenAddress).toBe(ethConfigV3.newTokenAddress);
      expect(dodoEggV3.tradeInProgress).toBe(false);
      expect(dodoEggV3.v3).toBe(ethConfigV3.v3);
      expect(dodoEggV3.fee).toBe(ethConfigV3.fee);
    });

    test("should update target price", () => {
      dodoEggV3.updateTargetPrice("2000000000000000000");
      expect(dodoEggV3.targetPrice).toBe("2000000000000000000");
    });

    test("should fetch pair info", async () => {
      const pairInfo = await dodoEggV3.getPairInfo();
      expect(pairInfo).toBeDefined();
      expect(typeof pairInfo._BASE_RESERVE_).toBe("string");
      expect(typeof pairInfo._QUOTE_RESERVE_).toBe("string");
    }, 15000);

    test("should fetch base token balance", async () => {
      const balance = await dodoEggV3.getBaseTokenBalance();
      expect(typeof balance).toBe("bigint");
    }, 15000);

    test("should fetch new token balance", async () => {
      const balance = await dodoEggV3.getNewTokenBalance();
      expect(typeof balance).toBe("bigint");
    }, 15000);

    test("Gets current price", async () => {}, 15000);

    test("should set up and remove target listener", async () => {
      const mockCallback = jest.fn();
      await dodoEggV3.setTargetListener(mockCallback);
      expect(dodoEggV3.targetListener).toBeDefined();

      dodoEggV3.removeTargetListener();
      expect(dodoEggV3.targetListener).toBeNull();
    }, 20000);

    // test("should handle trade execution", async () => {

    // }, 20000);
  });
});

describe("Base DodoEgg", () => {
  let dodoEggV2, dodoEggV3;

  dodoEggV2 = new DodoEgg({
    ...baseConfigV2,
  });

  dodoEggV3 = new DodoEgg({
    ...baseConfigV3,
  });

  describe("V2 DodoEgg", () => {});

  describe("V3 DodoEgg", () => {});
});
