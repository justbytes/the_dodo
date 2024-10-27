const Monitor = require("../class/Monitor");
const DodoEgg = require("../class/DodoEgg");

describe("Monitor", () => {
  let monitor;
  let dodoEgg;

  dodoEgg = new DodoEgg({
    // Add necessary configuration
    // apiKey: process.env.API_KEY,
    // network: 'mainnet',
  });
  monitor = new Monitor(realDodoEgg);

  test("should get token decimals", async () => {
    const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI 18 Decimals
    const decimals = await monitor.getTokenDecimals(tokenAddress);
    expect(decimals).toBe(18);
  }, 15000);

  test("should start and stop target listener", async () => {
    const mockCallback = jest.fn();
    await monitor.startTargetListener(mockCallback);
    expect(monitor.dodoEgg.targetListener).not.toBeNull();

    monitor.stopTargetListener();
    expect(monitor.dodoEgg.targetListener).toBeNull();
  }, 20000);

  test("should fetch latest block number", async () => {
    const blockNumber = await monitor.getLatestBlockNumber();
    expect(typeof blockNumber).toBe("number");
    expect(blockNumber).toBeGreaterThan(0);
  }, 15000);

  test("should fetch token balance", async () => {
    const address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"; // Example address
    const tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
    const balance = await monitor.getTokenBalance(address, tokenAddress);
    expect(typeof balance).toBe("bigint");
  }, 15000);

  test("should handle non-existent token address", async () => {
    const nonExistentAddress = "0x1234567890123456789012345678901234567890";
    await expect(
      monitor.getTokenDecimals(nonExistentAddress)
    ).rejects.toThrow();
  }, 15000);

  // Add more integration tests as needed
});
