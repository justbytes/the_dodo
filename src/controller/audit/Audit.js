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
    this.auditQueue = [];
    this.intervalId = null;
    this.goPlusAudit = new GoPlusAudit();
  }

  /**
   * Starts the Mythril audit queue
   */
  startQueue() {
    if (this.intervalId) {
      console.log("Audit queue is already running");
      return;
    }

    this.goPlusAudit.startGoPlusQueue();

    // Checks the queue to see if we can run an audit every 90 seconds
    this.intervalId = setInterval(async () => {
      console.log("*******   CHECKING MYTHRIL AUDIT QUEUE   *******");
      console.log("");

      // If there are audits in the queue, run them
      if (this.auditQueue.length > 0 && this.mythrilInstances < 4) {
        let auditsToRun = 0;

        // Get the amount of audits to run
        if (this.auditQueue.length > 4) {
          auditsToRun = 4;
        } else {
          auditsToRun = this.auditQueue.length;
        }

        // Run the audits
        for (let i = 0; i < auditsToRun; i++) {
          // Get and remove the first item from the queue (FIFO)
          const audit = this.auditQueue.shift();

          // Run the audit
          this.mythrilAudit(audit.chainId, audit.newTokenAddress);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }, 90000); // 90 seconds
  }

  /**
   * Stops the Mythril audit queue
   */
  stopQueue() {
    clearInterval(this.intervalId);
    this.goPlusAudit.stopGoPlusQueue();
    this.intervalId = null;
  }

  /**
   * Starts the Mythril audit
   * @param {string} chainId
   * @param {string} newTokenAddress
   * @returns
   */
  async mythrilAudit(chainId, newTokenAddress) {
    // Check if the newTokenAddress is already in the queue
    const recorded = this.auditQueue.some(
      (queueItem) => queueItem.newTokenAddress === newTokenAddress
    );
    // If there are 4 audits running add the new audit to the queue
    if (this.mythrilInstances >= 4) {
      // If the newTokenAddress is already in the queue, return
      if (recorded) {
        return;
      }

      // Token is not in queue, add it
      this.auditQueue.push({ chainId, newTokenAddress });
      return;
    }

    // Start the Mythril audit
    this.mythrilInstances++;

    // Run the Mythril audit
    const mythrilResults = await MythrilAudit(chainId, newTokenAddress);

    // Remove the audit from the queue if it was recorded
    if (recorded) {
      this.auditQueue = this.auditQueue.filter(
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
  async run(chainId, newTokenAddress) {
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
