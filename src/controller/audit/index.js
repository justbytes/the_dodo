const GoPlusAudit = require("./audits/GoPlusAudit");
const MythrilAudit = require("./audits/MythrilAudit");

/**
 * Runs the GoPlus and Mythril audits and returns the results
 * @class Audit
 * @description This class is used to run the audits on the new token
 */
class Audit {
  constructor() {
    this.mythrilInstances = 0;
    this.mythrilAuditsQueue = [];

    this.goPlusAudit = new GoPlusAudit();

    // Checks the queue to see if we can run an audit every 90 seconds
    setInterval(async () => {
      // If there are audits in the queue, run them
      if (this.mythrilAuditsQueue.length > 0 && this.mythrilInstances < 4) {
        // Get the number of audits to run
        const auditsToRun = 4 - this.mythrilInstances;

        // Run the audits
        for (let i = 0; i < auditsToRun; i++) {
          // Get the audit from the queue
          const { chainId, newTokenAddress } = this.mythrilAuditsQueue[i];

          // Run the audit
          this.mythrilAudit(chainId, newTokenAddress);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }, 90000); // 90 seconds
  }

  /**
   * Starts the Mythril audit
   * @param {string} chainId
   * @param {string} newTokenAddress
   * @returns
   */
  async mythrilAudit(chainId, newTokenAddress) {
    // Check if the newTokenAddress is already in the queue
    const recorded = this.mythrilAuditsQueue.some(
      (queueItem) => queueItem.newTokenAddress === newTokenAddress
    );
    // If there are 4 audits running add the new audit to the queue
    if (this.mythrilInstances >= 4) {
      // If the newTokenAddress is already in the queue, return
      if (recorded) {
        return;
      }

      // Token is not in queue, add it
      this.mythrilAuditsQueue.push({ chainId, newTokenAddress });
      return;
    }

    // Start the Mythril audit
    this.mythrilInstances++;

    // Run the Mythril audit
    const mythrilResults = await MythrilAudit(chainId, newTokenAddress);

    // Remove the audit from the queue if it was recorded
    if (recorded) {
      this.mythrilAuditsQueue = this.mythrilAuditsQueue.filter(
        (item) =>
          !(
            item.chainId === chainId && item.newTokenAddress === newTokenAddress
          )
      );
    }

    // Decrement the number of active audits
    this.mythrilInstances--;

    return mythrilResults;
  }

  /**
   * Runs the audits
   * @returns
   */
  async main(chainId, newTokenAddress) {
    // GoPlus Audit
    const goPlusResults = await this.goPlusAudit.main(chainId, newTokenAddress);

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
