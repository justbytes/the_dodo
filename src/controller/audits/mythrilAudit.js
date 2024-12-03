const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const getInfuraSettings = require("../utils/getInfuraSettings");
const { stderr } = require("process");

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

// Helper function to process audit results
const proccessAudit = (results, chainId) => {
  // If audit was unsuccessful, return false
  if (!results.success) {
    console.log("| mythrilAudit.js | Audit was unsuccessful");
    return false;
  }
  // Loop through issues and catch high severity issues
  for (const issue of results.issues) {
    console.log("Issue:", issue);
    console.log("IssueFunction:", issue.function);
    // Catch high severity issues
    if (issue.severity === "High") {
      // Function name() and symbol() are not issues on Base
      if (Number(chainId) === 8453) {
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
      console.log("Issue:", issue);
      return false;
    }
  }
  return results;
};

/**
 * Mythril audit
 * @param {string} chainId
 * @param {string} targetAddress
 * @returns {object} formatted results
 */
const mythrilAudit = async (chainId, targetAddress) => {
  let stdout, stderr, data, results;

  const handleResults = (stdout) => {
    data = JSON.parse(stdout);
    results = formatResults(data);

    if (results.issues.length === 0 && results.success) {
      return results;
    } else {
      return proccessAudit(results, chainId);
    }
  };

  // Run the mythril audit with the target address and chainId
  try {
    // Run Mythril command
    ({ stdout, stderr } = await execPromise(
      `myth analyze -a ${targetAddress} ${getInfuraSettings(
        chainId
      )} --infura-id ${process.env.INFURA_ID} -o json --execution-timeout 30
      `
    ));
    return handleResults(stdout);
  } catch (error) {
    if (error.code === 1) {
      return handleResults(error.stdout);
    } else {
      // If there is an error, return false
      if (stderr) {
        console.error("| mythrilAudit.js | stderr:", stderr);
        return false;
      }

      console.error(
        "| mythrilAudit.js | Their is a problem running the Mythril Audit\n",
        error
      );
    }
  }
};

module.exports = mythrilAudit;
