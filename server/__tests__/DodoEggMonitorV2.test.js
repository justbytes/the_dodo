/**
 * V2 DodoEgg Monitor Tests
 */
describe("V2 DodoEgg Monitor", () => {
  // V2 DodoEgg Setup
 const ethConfigV2 = {
   id: uuidv4(),
    chainId: "1",
    newTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    baseTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    pairAddress: "0x1234567890123456789012345678901234567890",
    v3: false,
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
  dodoEgg = new DodoEgg({
    ...ethConfigV2,
  });

  test("should get current price", async () => {
    const price = await dodoEgg.dodoEggMonitor.getPrice();
    expect(typeof price).toBe("bigint");
    expect(dodoEgg.intialPrice).toBe(price);
    expect(dodoEgg.baseTokenDecimal).toBe("18");
    expect(dodoEgg.newTokenDecimal).toBe("18");
    expect(dodoEgg.baseAssetReserve).not.toBeNull();
  });

  
});
