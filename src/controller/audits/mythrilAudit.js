const { exec } = require("child_process");
const Web3 = require("web3");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Format Mythril results
 * @param {object} results
 * @returns {object} formatted results
 */
const formatResults = (results) => {
  return {
    issues: results.issues.map((issue) => ({
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      function: issue.function,
      lines: issue.lineno,
      confidence: issue.confidence,
    })),
    success: true,
    timestamp: new Date().toISOString(),
  };
};

// Example usage
const mythrilAudit = async (targetAddress) => {
  try {
    // Run Mythril using command line
    const { stdout, stderr } = await execPromise(
      `myth analyze -a ${targetAddress} --infura-id ${process.env.INFURA_ID} -o json` // still needs to be able to change chains
    );

    if (stderr) {
      console.error("Problem with running the mythril command\n", stderr);
      return false;
    }

    const results = JSON.parse(stdout);
    return formatResults(results);
  } catch (error) {
    console.error("Analysis failed:", error);
    return { error: error.message };
  }
};

module.exports = mythrilAudit;
