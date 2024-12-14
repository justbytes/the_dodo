const GoPlusAudit = require("./audits/GoPlusAudit");
const MythrilAudit = require("./audits/MythrilAudit");

/**
 * Runs the GoPlus and Mythril audits and returns the results
 * @class Audit
 * @description This class is used to run the audits on the new token
 */
class Audit {
  constructor() {
    this.mythrilAuditsActive = 0;
    this.mythrilAuditsQueue = [];

    // Run the Mythril audits every 5 seconds
    setInterval(() => {
      // If there are audits in the queue, run them
      if (this.mythrilAuditsQueue.length > 0) {
        this.mythrilAuditsQueue.forEach(({ chainId, newTokenAddress }) => {
          this.mythrilAudit(chainId, newTokenAddress);
        });
      }
    }, 5000); // 5 seconds
  }

  /**
   * Starts the Mythril audit
   * @param {string} chainId
   * @param {string} newTokenAddress
   * @returns
   */
  async mythrilAudit(chainId, newTokenAddress) {
    // If there are 4 audits running add the new audit to the queue
    if (this.mythrilAuditsActive >= 4) {
      // Check if the newTokenAddress is already in the queue
      const recorded = this.mythrilAuditsQueue.some(
        (queueItem) => queueItem.newTokenAddress === newTokenAddress
      );

      // If the newTokenAddress is already in the queue, return
      if (recorded) {
        return; // Token is already in queue
      }

      // Token is not in queue, add it
      this.mythrilAuditsQueue.push({ chainId, newTokenAddress });
      return;
    }

    // Start the Mythril audit
    this.mythrilAuditsActive++;

    // Run the Mythril audit
    const mythrilResults = await MythrilAudit(chainId, newTokenAddress);

    // Decrement the number of active audits
    this.mythrilAuditsActive--;

    return mythrilResults;
  }

  /**
   * Runs the audits
   * @returns
   */
  async main(chainId, newTokenAddress) {
    // GoPlus Audit
    const goPlusResults = await GoPlusAudit(chainId, newTokenAddress);

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
    const mythrilResults = await this.mythrilAudit(chainId, newTokenAddress);

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

module.exports = Audit;
