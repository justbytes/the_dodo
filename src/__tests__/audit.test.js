const goPlusAudit = require("../controller/audits/goPlusAudit");
const data = {
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

/**
 * Testing Audits
 */
describe("||||| Audit Results |||||", () => {
  it("Should pass the goPlus audit!", async () => {
    const goPlusResults = await goPlusAudit(data.chainId, data.newTokenAddress);
    console.log(goPlusResults);

    expect(goPlusResults).not.toBeNull();
  });

  it("Should pass the slither audit", async () => {
    console.log(">..");
  });

  it("Should pass the mythril audit", async () => {
    console.log(">..");
  });
});
