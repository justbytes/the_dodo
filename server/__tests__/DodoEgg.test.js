const { ethers } = require("ethers");
const DodoEgg = require("../class/DodoEgg");
const { v4: uuidv4 } = require("uuid");
const { serializeDodo, deserializeDodo } = require("../utils/serialConverter");

jest.setTimeout(30000); // Set timeout to 30 seconds for all tests in this file

/**
 * Testing a DodoEgg instance on the ETH network
 */
describe("ETH DodoEgg", () => {
  let dodoEgg, serializedDodo;


  // V2 DodoEgg Setup
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

  // Serialize and deserialize the DodoEgg
  serializedDodo = serializeDodo(ethConfigV2);

  // Create a new DodoEgg instance from the serialized data
  dodoEgg = deserializeDodo(serializedDodo);

  /**
   * V2 DodoEgg Tests
   */
  describe("V2 DodoEgg", () => {

    // DodoEgg Initialization Test
    test("DodoEgg initializes correctly", () => {
      expect(dodoEgg.pairAddress).toBe(ethConfigV2.pairAddress);
      expect(dodoEgg.baseTokenAddress).toBe(ethConfigV2.baseTokenAddress);
      expect(dodoEgg.newTokenAddress).toBe(ethConfigV2.newTokenAddress);
      expect(dodoEgg.tradeInProgress).toBe(false);
      expect(dodoEgg.v3).toBe(ethConfigV2.v3);
      expect(dodoEgg.fee).toBe(ethConfigV2.fee);
    });

    // Token Audit Test
    test("should pass token audit", async () => {
      const auditResults = await dodoEgg.conductAudit();
      expect(auditResults).toBe(true);
      expect(dodoEgg.auditResults).toBe(auditResults);
    });

    // Set Target Price Test
    test("should set target price", async () => {
      const targetPrice = await dodoEgg.setTargetPrice();
      expect(typeof targetPrice).toBe("bigint");
      expect(dodoEgg.targetPrice).toBe(targetPrice);
    });

    // Update DodoEgg Instance Variables Test
    test("should update dodoEgg instance variables", () => {
      const dodoInfo = dodoEgg.getInfo();
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
      // Simulate with target listener activated
      dodoEgg.incubator();

      // Setup for new DodoEgg
      const oldEgg = dodoEgg.getInfo();
      const newDodoEgg = new DodoEgg({
        ...oldEgg,
      });

      expect(newDodoEgg.targetListener.filter).toBe(
        dodoEgg.targetListener.filter
      );
      expect(newDodoEgg.targetListener.listener).toBe(
        dodoEgg.targetListener.listener
      );
      expect(newDodoEgg.intialPrice).toBe(dodoEgg.intialPrice);
      expect(newDodoEgg.targetPrice).toBe(dodoEgg.targetPrice);

      dodoEgg.dodoEggMonitor.removeTargetListener();
      expect(dodoEgg.targetListener).toBeNull();
    });
  });

  // V3 DodoEgg Setup
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

  // Serialize and deserialize the DodoEgg
  serializedDodo = serializeDodo(ethConfigV3);

  // Create a new DodoEgg instance from the serialized data
  dodoEgg = deserializeDodo(serializedDodo);

  /**
   * V3 DodoEgg Tests
   */
  describe("V3 DodoEgg", () => {

    test("DodoEgg initializes correctly", () => {
      expect(dodoEgg.pairAddress).toBe(ethConfigV3.pairAddress);
      expect(dodoEgg.baseTokenAddress).toBe(ethConfigV3.baseTokenAddress);
      expect(dodoEgg.newTokenAddress).toBe(ethConfigV3.newTokenAddress);
      expect(dodoEgg.tradeInProgress).toBe(false);
      expect(dodoEgg.v3).toBe(ethConfigV3.v3);
      expect(dodoEgg.fee).toBe(ethConfigV3.fee);
    });

    // Token Audit Test
    test("should pass token audit", async () => {
      const auditResults = await dodoEgg.conductAudit();
      expect(auditResults).toBe(true);
      expect(dodoEgg.auditResults).toBe(auditResults);
    });

    // Set Target Price Test
    test("should set target price", async () => {
      const targetPrice = await dodoEgg.setTargetPrice();
      expect(typeof targetPrice).toBe("bigint");
      expect(dodoEgg.targetPrice).toBe(targetPrice);
    });

    // Update DodoEgg Instance Variables Test
    test("should update dodoEgg instance variables", () => {
      const dodoInfo = dodoEgg.getInfo();
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
      // Simulate with target listener activated
      dodoEgg.incubator();

      // Setup for new DodoEgg
      const oldEgg = dodoEgg.getInfo();
      const newDodoEgg = new DodoEgg({
        ...oldEgg,
      });

      expect(newDodoEgg.targetListener.filter).toBe(
        dodoEgg.targetListener.filter
      );
      expect(newDodoEgg.targetListener.listener).toBe(
        dodoEgg.targetListener.listener
      );
      expect(newDodoEgg.intialPrice).toBe(dodoEgg.intialPrice);
      expect(newDodoEgg.targetPrice).toBe(dodoEgg.targetPrice);

      dodoEgg.dodoEggMonitor.removeTargetListener();
      expect(dodoEgg.targetListener).toBeNull();
    });
  });
});

/**
 * Testing a DodoEgg instance on the Base network
 */
describe("Base DodoEgg", () => {
  let dodoEgg, serializedDodo;

  // V2 DodoEgg Setup
  const baseConfigV2 = {
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

  // Serialize and deserialize the DodoEgg
  serializedDodo = serializeDodo(baseConfigV2);

  // Create a new DodoEgg instance from the serialized data
  dodoEgg = deserializeDodo(serializedDodo);

  /**
   * V2 DodoEgg Tests
   */
  describe("V2 DodoEgg", () => {

    // DodoEgg Initialization Test
    test("DodoEgg initializes correctly", () => {
      expect(dodoEgg.pairAddress).toBe(ethConfigV2.pairAddress);
      expect(dodoEgg.baseTokenAddress).toBe(ethConfigV2.baseTokenAddress);
      expect(dodoEgg.newTokenAddress).toBe(ethConfigV2.newTokenAddress);
      expect(dodoEgg.tradeInProgress).toBe(false);
      expect(dodoEgg.v3).toBe(ethConfigV2.v3);
      expect(dodoEgg.fee).toBe(ethConfigV2.fee);
    });

    // Token Audit Test
    test("should pass token audit", async () => {
      const auditResults = await dodoEgg.conductAudit();
      expect(auditResults).toBe(true);
      expect(dodoEgg.auditResults).toBe(auditResults);
    });

    // Set Target Price Test
    test("should set target price", async () => {
      const targetPrice = await dodoEgg.setTargetPrice();
      expect(typeof targetPrice).toBe("bigint");
      expect(dodoEgg.targetPrice).toBe(targetPrice);
    });

    // Update DodoEgg Instance Variables Test
    test("should update dodoEgg instance variables", () => {
      const dodoInfo = dodoEgg.getInfo();
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
      // Simulate with target listener activated
      dodoEgg.incubator();

      // Setup for new DodoEgg
      const oldEgg = dodoEgg.getInfo();
      const newDodoEgg = new DodoEgg({
        ...oldEgg,
      });

      expect(newDodoEgg.targetListener.filter).toBe(
        dodoEgg.targetListener.filter
      );
      expect(newDodoEgg.targetListener.listener).toBe(
        dodoEgg.targetListener.listener
      );
      expect(newDodoEgg.intialPrice).toBe(dodoEgg.intialPrice);
      expect(newDodoEgg.targetPrice).toBe(dodoEgg.targetPrice);

      dodoEgg.dodoEggMonitor.removeTargetListener();
      expect(dodoEgg.targetListener).toBeNull();
    });
  });

  // V3 DodoEgg Setup
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

  // Serialize and deserialize the DodoEgg
  serializedDodo = serializeDodo(baseConfigV3);

  // Create a new DodoEgg instance from the serialized data
  dodoEgg = deserializeDodo(serializedDodo);

  /**
   * V3 DodoEgg Tests
   */
  describe("V3 DodoEgg", () => {

    test("DodoEgg initializes correctly", () => {
      expect(dodoEgg.pairAddress).toBe(ethConfigV3.pairAddress);
      expect(dodoEgg.baseTokenAddress).toBe(ethConfigV3.baseTokenAddress);
      expect(dodoEgg.newTokenAddress).toBe(ethConfigV3.newTokenAddress);
      expect(dodoEgg.tradeInProgress).toBe(false);
      expect(dodoEgg.v3).toBe(ethConfigV3.v3);
      expect(dodoEgg.fee).toBe(ethConfigV3.fee);
    });

    // Token Audit Test
    test("should pass token audit", async () => {
      const auditResults = await dodoEgg.conductAudit();
      expect(auditResults).toBe(true);
      expect(dodoEgg.auditResults).toBe(auditResults);
    });

    // Set Target Price Test
    test("should set target price", async () => {
      const targetPrice = await dodoEgg.setTargetPrice();
      expect(typeof targetPrice).toBe("bigint");
      expect(dodoEgg.targetPrice).toBe(targetPrice);
    });

    // Update DodoEgg Instance Variables Test
    test("should update dodoEgg instance variables", () => {
      const dodoInfo = dodoEgg.getInfo();
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
      // Simulate with target listener activated
      dodoEgg.incubator();

      // Setup for new DodoEgg
      const oldEgg = dodoEgg.getInfo();
      const newDodoEgg = new DodoEgg({
        ...oldEgg,
      });

      expect(newDodoEgg.targetListener.filter).toBe(
        dodoEgg.targetListener.filter
      );
      expect(newDodoEgg.targetListener.listener).toBe(
        dodoEgg.targetListener.listener
      );
      expect(newDodoEgg.intialPrice).toBe(dodoEgg.intialPrice);
      expect(newDodoEgg.targetPrice).toBe(dodoEgg.targetPrice);

      dodoEgg.dodoEggMonitor.removeTargetListener();
      expect(dodoEgg.targetListener).toBeNull();
    });
  });
});