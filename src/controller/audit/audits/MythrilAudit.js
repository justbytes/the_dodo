const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const getInfuraSettings = require("../../utils/getInfuraSettings");

/**
 * @class MythrilAudit
 * @description This class is used to run the Mythril audit on the new token
 */
class MythrilAudit {
  constructor(chainId, newTokenAddress) {
    this.chainId = chainId;
    this.newTokenAddress = newTokenAddress;
    this.results;
  }

  /**
   * Format Mythril results
   * @param {object} results
   * @returns {object} formatted results
   */
  formatResults = (stdout) => {
    // Parse the stdout
    const data = JSON.parse(stdout);

    return {
      error: data.error,
      issues: data.issues.map((issue) => ({
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        function: issue.function,
      })),
      success: true,
    };
  };

  /**
   * Checks the results of the Mythril Audit
   * @param {object} results
   * @param {string} chainId
   * @returns {object} results
   */
  proccessAudit = () => {
    // Loop through issues and catch high severity issues
    for (const issue of this.results.MythrilAudit.issues) {
      // Catch high severity issues
      if (issue.severity === "High") {
        // Function name() and symbol() are not issues on Base
        if (Number(this.chainId) === 8453) {
          // If the function is name() or symbol(), continue
          if (
            issue.function === "name()" ||
            issue.function ===
              "link_classic_internal(uint64,int64) or symbol()" ||
            issue.function === "symbol() or link_classic_internal(uint64,int64)"
          ) {
            continue;
          }
        }
        console.log("High severity issue found");
        // TODO: create a snapshot of the dodo instance and save it for analysis in the future
        return false;
      }
    }
    return this.results;
  };

  /**
   * Handles control flow results of the Mythril audit
   * @param {string} stdout
   * @returns {object} formatted results
   */
  handleResults = (stdout) => {
    // Format the results
    this.results = this.formatResults(stdout);

    // If the audit was unsuccessful, return false
    if (!this.results.MythrilAudit.success) {
      return false;
    }

    // If no issues are found, return results, otherwise process them
    if (this.results.MythrilAudit.issues.length === 0) {
      return this.results;
    } else {
      return this.proccessAudit();
    }
  };

  /**
   * runs the mythril python command and does the audit
   * @returns {object} formatted results
   */
  async main() {
    try {
      // Run the mythril audit with the target address and chainId
      const { stdout, stderr } = await execPromise(
        `myth analyze -a ${this.newTokenAddress} ${getInfuraSettings(
          this.chainId
        )} --infura-id ${process.env.INFURA_ID} -o json --execution-timeout 30
      `
      );

      // If there is an error, return false
      if (stderr) {
        console.error("| mythrilAudit.js | stderr:", stderr);
        return false;
      }

      // Handle the results
      return this.handleResults(stdout);
    } catch (error) {
      // Error code 1 happens because of the --execution-timeout flag but still has the results
      if (error.code === 1) {
        return this.handleResults(error.stdout);
      }

      console.error(
        "| mythrilAudit.js | Their is a problem running the Mythril Audit\n",
        error
      );

      return false;
    }
  }
}

module.exports = (chainId, newTokenAddress) =>
  new MythrilAudit(chainId, newTokenAddress).main();
