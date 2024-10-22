const DodoEgg = require("../class/DodoEgg");
const { ethers } = require("ethers");

describe("DodoEgg", () => {
  let dodoEgg;
  const pairAddress = "0x1234567890123456789012345678901234567890"; // Replace with a real DODO pair address
  const baseTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const newTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI

  beforeAll(async () => {
    // Set up any global configurations
    // e.g., process.env.INFURA_API_KEY = 'your-infura-api-key';
  });

  beforeEach(() => {
    dodoEgg = new DodoEgg({
      pairAddress,
      baseTokenAddress,
      newTokenAddress,
      // Add any other necessary configuration
      // provider: new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`)
    });
  });

  test("should initialize with correct properties", () => {
    expect(dodoEgg.pairAddress).toBe(pairAddress);
    expect(dodoEgg.baseTokenAddress).toBe(baseTokenAddress);
    expect(dodoEgg.newTokenAddress).toBe(newTokenAddress);
    expect(dodoEgg.tradeInProgress).toBe(false);
  });

  test("should update target price", () => {
    dodoEgg.updateTargetPrice("2000000000000000000");
    expect(dodoEgg.targetPrice).toBe("2000000000000000000");
  });

  test("should fetch pair info", async () => {
    const pairInfo = await dodoEgg.getPairInfo();
    expect(pairInfo).toBeDefined();
    expect(typeof pairInfo._BASE_RESERVE_).toBe("string");
    expect(typeof pairInfo._QUOTE_RESERVE_).toBe("string");
  }, 15000);

  test("should fetch base token balance", async () => {
    const balance = await dodoEgg.getBaseTokenBalance();
    expect(typeof balance).toBe("bigint");
  }, 15000);

  test("should fetch new token balance", async () => {
    const balance = await dodoEgg.getNewTokenBalance();
    expect(typeof balance).toBe("bigint");
  }, 15000);

  test("should calculate price", async () => {
    const price = await dodoEgg.calculatePrice();
    expect(typeof price).toBe("string");
    expect(parseFloat(price)).toBeGreaterThan(0);
  }, 15000);

  test("should set up and remove target listener", async () => {
    const mockCallback = jest.fn();
    await dodoEgg.setTargetListener(mockCallback);
    expect(dodoEgg.targetListener).toBeDefined();

    dodoEgg.removeTargetListener();
    expect(dodoEgg.targetListener).toBeNull();
  }, 20000);

  test("should handle trade execution", async () => {
    // This test depends on your implementation and might need adjustments
    const mockTrade = jest
      .fn()
      .mockResolvedValue({ hash: "0x123...", wait: jest.fn() });
    dodoEgg.trade = mockTrade;

    await dodoEgg.executeTrade();
    expect(mockTrade).toHaveBeenCalled();
    expect(dodoEgg.tradeInProgress).toBe(false);
  }, 20000);

  // Add more tests for other methods in DodoEgg class
});
