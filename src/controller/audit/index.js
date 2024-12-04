const GoPlusAudit = require("./audits/GoPlusAudit");
const MythrilAudit = require("./audits/MythrilAudit");

/**
 * Runs the GoPlus and Mythril audits and returns the results
 * @class Audit
 * @description This class is used to run the audits on the new token
 */
class Audit {
  constructor(chainId, newTokenAddress, speed) {
    this.chainId = chainId;
    this.newTokenAddress = newTokenAddress;
  }

  /**
   * Runs the audits
   * @returns
   */
  async main() {
    // GoPlus Audit
    const goPlusResults = await GoPlusAudit(this.chainId, this.newTokenAddress);

    // If the audit failed, return false
    if (!goPlusResults) {
      return false;
    }

    // Mythril Audit
    const mythrilResults = await MythrilAudit(
      this.chainId,
      this.newTokenAddress
    );

    // If the audit failed, return false
    if (!mythrilResults.success) {
      return false;
    }

    console.log("| AUDIT RESULTS |\n", { ...goPlusResults, ...mythrilResults });

    return { ...goPlusResults, ...mythrilResults };
  }
}

module.exports = (chainId, newTokenAddress) =>
  new Audit(chainId, newTokenAddress).main();
