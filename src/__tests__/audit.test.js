const audit = require("../controller/audit");
const data = {
  id: "1234",
  chainId: "1",
  newTokenAddress: "0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24",
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

/**
 * Testing a DodoEgg instance on the ETH network
 */
describe("Test audit function", () => {
  it("should pass audit", async () => {
    const auditResults = await audit(data.chainId, data.newTokenAddress);
    console.log(auditResults);

    expect(auditResults.isSafe).toEqual(true);
  });
});
