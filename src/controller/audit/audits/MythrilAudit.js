const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const getInfuraSettings = require("../../utils/getInfuraSettings");

/**
 * @class MythrilAudit
 * @description This class is used to run the Mythril audit on the new token
 */
class MythrilAudit {
  constructor(parent, chainId, newTokenAddress) {
    this.parent = parent;
    this.chainId = chainId;
    this.newTokenAddress = newTokenAddress;
    this.results;
  }

  /**
   * Checks the results of the Mythril Audit
   * @param {object} results
   * @param {string} chainId
   * @returns {object} results
   */
  proccessedResults = (stdout) => {
    // Parse the stdout
    let data = JSON.parse(stdout);

    // Return if audit failed
    if (!data.success) {
      return data;
    }

    // If the audit was successful and there are no issues, return the data
    if (data.success && data.issues.length === 0) {
      return data;
    }

    // If we made it to this line the audit was successful but has more than 0 issues.
    // Loop through issues and catch high severity issues
    for (const issue of data.issues) {
      if (issue.severity === "High") {
        // Check if we're on Base chain (8453)
        if (Number(this.chainId) === 8453) {
          // Known safe functions on Base chain
          const safeFunctions = [
            "name()",
            "symbol()",
            "link_classic_internal(uint64,int64) or symbol()",
            "symbol() or link_classic_internal(uint64,int64)",
          ];

          // Only fail if the function is NOT in the safeFunctions list
          if (!safeFunctions.includes(issue.function)) {
            data.success = false;
            return data;
          }
        } else {
          // For non-Base chains, any High severity issue should fail
          data.success = false;
          return data;
        }
      }
    }

    // Return the data
    return data;
  };

  /**
   * runs the mythril python command and does the audit
   * @returns {object} formatted results
   */
  async main() {
    // Run the mythril audit with the target address and chainId
    try {
      // Run the python mythril command
      const { stdout, stderr } = await execPromise(
        `myth analyze -a ${this.newTokenAddress} ${getInfuraSettings(
          this.chainId
        )} --infura-id ${process.env.INFURA_ID} -o json --execution-timeout 30
      `
      );

      // If there is an error, return false
      if (stderr) {
        console.error("| mythrilAudit.js | stderr:", stderr);

        // Return the error
        return stderr;
      }

      // Handle the results
      return this.proccessedResults(stdout);
    } catch (error) {
      // Error code 1 happens because of the --execution-timeout flag but still has the results
      if (error.code === 1) {
        // Decrement the mythril instances tracker
        this.parent.mythrilInstances--;

        // Return the results
        return this.proccessedResults(error.stdout);
      }

      // Display the error
      console.error(
        "| mythrilAudit.js | Their is a problem running the Mythril Audit\n",
        error
      );

      // Return the error
      return error;
    }
  }
}

module.exports = (parent, chainId, newTokenAddress) =>
  new MythrilAudit(parent, chainId, newTokenAddress).main();
