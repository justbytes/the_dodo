const goPlusAudit = require("../controller/audits/goPlusAudit");
const mythrilAudit = require("../controller/audits/mythrilAudit");

jest.setTimeout(1850000);

// Test Data
const eth_data = {
  id: "1234",
  chainId: "1",
  newTokenAddress: "0xc47ef9b19c3e29317a50f5fbe594eba361dada4a",
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
const base_data = {
  id: "1234",
  chainId: "8453",
  newTokenAddress: "0x0000000000000000000000000000000000000000",
  baseTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  pairAddress: "0x0000000000000000000000000000000000000000",
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

/**
 * Test to see if audits pass
 */
describe("__Audits__", () => {
  describe("GoPlus Audit", () => {
    it("Should pass", async () => {
      const goPlusResults = await goPlusAudit(
        eth_data.chainId,
        eth_data.baseTokenAddress
      );
      //console.log(goPlusResults);

      expect(goPlusResults).not.toBeNull();
    });
  });

  describe("Mythril Audit", () => {
    it("Should pass", async () => {
      const results = await mythrilAudit(
        8453,
        "0x4200000000000000000000000000000000000006"
      );
      console.log(results);

      expect(results.success).toBe(true);
      expect(results.issues.length).toBe(2);
    });

    // it("Should pass", async () => {
    //   const [ethResults, baseResults, baseWethResults] = await Promise.all([
    //     mythrilAudit(eth_data.chainId, eth_data.baseTokenAddress),
    //     mythrilAudit(base_data.chainId, base_data.baseTokenAddress),
    //     mythrilAudit(
    //       base_data.chainId,
    //       "0x4200000000000000000000000000000000000006"
    //     ),
    //   ]);

    //   //ETH chain assertions
    //   console.log("ETH Results:", ethResults);
    //   expect(ethResults).toBe(true);
    //   expect(ethResults.issues.length).toBe(0);

    //   // Base chain assertions
    //   console.log("Base Results:", baseResults);
    //   expect(baseResults.success).toBe(true);
    //   expect(baseResults.issues.length).toBe(0);

    //   // Base WETH assertions
    //   console.log("Base WETH Results:", baseWethResults);
    //   expect(baseWethResults).toBe(true);
    //   expect(baseWethResults.issues.length).toBe(2);
    // });
  });
});
