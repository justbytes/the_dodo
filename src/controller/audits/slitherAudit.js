const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Format Slither results
 * @param {object} results
 * @returns {object} formatted results
 */
const formatResults = (results) => {
  return {
    issues: results.results.detectors.map((issue) => ({
      title: issue.check,
      description: issue.description,
      severity: issue.impact,
      confidence: issue.confidence,
      lines: issue.first_markdown_element.lines,
      function: issue.first_markdown_element.function || "N/A",
    })),
    success: true,
    timestamp: new Date().toISOString(),
  };
};

const slitherAudit = async (contractPath) => {
  try {
    // Run Slither using command line with JSON output
    const { stdout, stderr } = await execPromise(
      `slither ${contractPath} --json -`
    );

    if (stderr) {
      console.error("Problem with running the slither command\n", stderr);
      return false;
    }

    const results = JSON.parse(stdout);
    return formatResults(results);
  } catch (error) {
    console.error("Analysis failed:", error);
    return { error: error.message };
  }
};

module.exports = slitherAudit;
