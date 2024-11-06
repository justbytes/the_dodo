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
  // eth/pepe
  const ethConfigV2 = {
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
  // eth/wbtc
  const ethConfigV3 = {
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
    chainId: "8453",
    newTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    baseTokenAddress: "0x4200000000000000000000000000000000000006",
    pairAddress: "0x88A43bbDF9D098eEC7bCEda4e2494615dfD9bB9C",
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
    newTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    baseTokenAddress: "0x4200000000000000000000000000000000000006",
    pairAddress: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
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