const GoPlusAudit = require("../controller/audit/audits/GoPlusAudit");
const MythrilAudit = require("../controller/audit/audits/MythrilAudit");
const Audit = require("../controller/audit/Audit");
const { ETH_PAIR, BASE_PAIR, V3_ETH_FALSE_POSITIVE } = require("./utils/pairs");

jest.setTimeout(1800000); // 1800 seconds

describe("Audit", () => {
  // Create an array of audits for Mythril testing
  const audits = [
    {
      chainId: "8453",
      newTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
    {
      chainId: "8453",
      newTokenAddress: "0x4200000000000000000000000000000000000006",
    },
  ];

  // /**
  //  * Should pass a basic GoPlus audit
  //  */
  // it("Should pass GoPlus Audit", async () => {
  //   // Run the GoPlus audit
  //   const goPlusResults = await GoPlusAudit(
  //     new Audit(),
  //     "1",
  //     "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  //   );
  //
  //   // Expect the audit to be successful
  //   expect(goPlusResults.success).toBe(true);
  // });

  /**
   * Test a basic contract to audit with Mythril
   */
  it("Should pass Mythril Audit", async () => {
    const mythrilResults = await MythrilAudit(
      new Audit(),
      "1",
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    );
    console.log(mythrilResults);
    expect(mythrilResults.success).toBe(true);
  });

  // it("Audit Class should complete GoPlus audit", async () => {
  //   const audit = new Audit();

  //   audit.add({
  //     id: "123",
  //     chainId: "1",
  //     newTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  //   });
  //   audit.start();

  //   await new Promise((resolve) => setTimeout(resolve, 10000));

  //   audit.stop();
  //   expect(audit.goPlusQueue.length).toBe(0);
  // });

  // /**
  //  * Should catch high risk issues
  //  */
  // it("Should catch high risk issues", async () => {
  //   const mythrilResults = await MythrilAudit(
  //     "8453",
  //     "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b"
  //   );
  //   expect(mythrilResults.success).toBe(false);
  // });

  // /**
  //  * Test a few contracts to audit with Mythril
  //  */
  // it("Should pass multiple Mythril audits", async () => {
  //   // Test each contract
  //   audits.forEach(async (audit) => {
  //     const mythrilResults = await MythrilAudit(
  //       audit.chainId,
  //       audit.newTokenAddress
  //     );
  //     expect(mythrilResults.success).toBe(true);
  //   });
  // });

  // /**
  //  * Should pass a full basic audit
  //  */
  // it("Should pass full audit", async () => {
  //   const audit = new Audit();
  //   // Run the audit
  //   const auditResults = await audit.run(
  //     "1",
  //     "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  //   );
  //   expect(auditResults.success).toBe(true);
  // });

  // /**
  //  * Should handle the audit queue successfully
  //  */
  // it("Should run audits in Audit queue", async () => {
  //   let length;
  //   // Create a new Audit instance
  //   const audit = new Audit();
  //   // Add a pair to the queue
  //   audit.auditQueue.push(audits[0]);
  //   // Start the audit queue
  //   audit.startQueue();
  //   // Get the length of the queue
  //   length = audit.auditQueue.length;
  //   // Wait for the queue to empty
  //   while (length > 0) {
  //     await new Promise((resolve) => setTimeout(resolve, 5000));
  //     length = audit.auditQueue.length;
  //   }
  //   // Stop the audit queue
  //   audit.stopQueue();
  //   // Expect the queue to be empty
  //   expect(audit.auditQueue.length).toBe(0);
  // });
});
