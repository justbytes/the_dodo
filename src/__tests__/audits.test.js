const GoPlusAudit = require("../controller/audit/audits/GoPlusAudit");
const MythrilAudit = require("../controller/audit/audits/MythrilAudit");
const Audit = require("../controller/audit/index");
const { ETH_PAIR, BASE_PAIR, V3_ETH_FALSE_POSITIVE } = require("./utils/pairs");

jest.setTimeout(1800000); // 1800 seconds

describe("Audit", () => {
  it("Should pass GoPlus Audit", async () => {
    const goPlusResults = await GoPlusAudit(
      "1",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    );

    expect(goPlusResults.success).toBe(true);
  });

  it("Should handle more then 30 requests to GoPlus", async () => {
    const goPlusResults = await GoPlusAudit(
      "1",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    );

    expect(goPlusResults.success).toBe(true);
  });

  // it("Should pass mythril audit with Ethereum WETH", async () => {
  //   const mythrilResults = await MythrilAudit(
  //     "1",
  //     "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  //   );

  //   expect(mythrilResults.success).toBe(true);
  //   expect(mythrilResults.issues.length).toBe(0);
  // });

  // it("Should pass mythril audit with Base USDC", async () => {
  //   const mythrilResults = await MythrilAudit(
  //     "8453",
  //     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  //   );

  //   expect(mythrilResults.success).toBe(true);
  //   expect(mythrilResults.issues.length).toBe(0);
  // });

  // it("Should pass mythril audit with Base WETH", async () => {
  //   const mythrilResults = await MythrilAudit(
  //     "8453",
  //     "0x4200000000000000000000000000000000000006"
  //   );

  //   expect(mythrilResults.success).toBe(true);
  //   expect(mythrilResults.issues.length).toBe(2);
  // });

  // it("Should test the Audit class", async () => {
  //   const auditResults = await Audit(
  //     "1",
  //     "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  //   );

  //   expect(auditResults.success).toBe(true);
  //   expect(auditResults).not.toBeNull();
  // });
});
