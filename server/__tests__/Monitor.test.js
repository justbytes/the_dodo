const DodoEgg = require("../class/DodoEgg");
const V2Monitor = require("../class/DodoEggMonitorV2");

describe("Monitor", () => {
  let dodoEgg;

  // V2 DodoEgg Setup
  const configV2 = {
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

  describe("V2 Monitor", () => {
    test("should get token decimals", async () => {
      const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI 18 Decimals
      const decimals = await dodoEgg.monitor.getTokenDecimals(tokenAddress);
      expect(decimals).toBe("18");
    });

    test("should get price", async () => {
      const price = await dodoEgg.monitor.getPrice();
      expect(typeof price).toBe("bigint");
      expect(dodoEgg.intialPrice).toBe(price);
      expect(dodoEgg.baseTokenDecimal).toBe("18");
      expect(dodoEgg.newTokenDecimal).toBe("18");
      expect(dodoEgg.baseAssetReserve).not.toBeNull();
    });

    test("should start a target listener", async () => {
      dodoEgg.monitor.startTargetListener();
      expect(dodoEgg.targetListener).not.toBeNull();
    });
  });

  // V3 DodoEgg Setup
  const configV3 = {
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

  describe("V3 Monitor", () => {
    test("should get price", async () => {
      const price = await dodoEgg.monitor.getPrice();
      expect(typeof price).toBe("bigint");
    });
  });
});
