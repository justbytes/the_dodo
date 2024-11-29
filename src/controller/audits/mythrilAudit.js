const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const getInfuraSettings = require("../utils/getInfuraSettings");

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
const mythrilAudit = async (chainId, targetAddress) => {
  try {
    // Run Mythril using command line
    const { stdout, stderr } = await execPromise(
      `myth analyze -a ${targetAddress} ${getInfuraSettings(
        chainId
      )} --infura-id ${process.env.INFURA_ID} -o json`
    );

    if (stderr) {
      console.error("Problem with running the mythril command\n", stderr);
      return false;
    }

    const results = JSON.parse(stdout);
    console.log(results);
    return formatResults(results);
  } catch (error) {
    console.error("Analysis failed:", error);
    return { error: error.message };
  }
};

mythrilAudit(1, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

//module.exports = mythrilAudit;
