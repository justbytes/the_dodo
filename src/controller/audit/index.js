const GoPlusAudit = require("./audits/GoPlusAudit");
const MythrilAudit = require("./audits/MythrilAudit");

/**
 * Runs the GoPlus and Mythril audits and returns the results
 * @class Audit
 * @description This class is used to run the audits on the new token
 */
class Audit {
  constructor(chainId, newTokenAddress) {
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
    if (!goPlusResults.success) {
      return {
        success: false,
        goPlusAudit: { ...goPlusResults },
        mythrilAudit: null,
        timestamp: new Date().toISOString(),
      };
    }

    // Mythril Audit
    const mythrilResults = await MythrilAudit(
      this.chainId,
      this.newTokenAddress
    );

    // If the audit failed, return false
    if (!mythrilResults.success) {
      return {
        success: false,
        goPlusAudit: { ...goPlusResults },
        mythrilAudit: { ...mythrilResults },
        timestamp: new Date().toISOString(),
      };
    }

    // Combine the results
    return {
      success: goPlusResults.success && mythrilResults.success,
      goPlusAudit: { ...goPlusResults },
      mythrilAudit: { ...mythrilResults },
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = (chainId, newTokenAddress) =>
  new Audit(chainId, newTokenAddress).main();
