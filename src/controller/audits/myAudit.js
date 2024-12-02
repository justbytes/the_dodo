const { Alchemy } = require("alchemy-sdk");
const getAlchemySettings = require("../../model/utils/getAlchemySettings");

const personalAudit = async (alchemy, contractAddress) => {};

/**
 * @param {number} chainId - The chain ID of the target contract
 * @param {string} targetAddress - The address of the target contract
 * @returns {Object} - The security checks object
 */
async function myAudit(chainId, contractAddress) {
  let code, metadata;
  const alchemy = new Alchemy(getAlchemySettings(chainId));

  // Fetch contract code and metadata
  try {
    // Get contract code but use Alchemy provider
    code = await alchemy.core.getCode(contractAddress);
    metadata = await alchemy.core.isContractAddress(contractAddress);
  } catch (error) {
    console.error(
      "|myAudit.js| Error fetching contract code or metadata:",
      error
    );
    return false;
  }

  console.log("|myAudit.js| Code:", code);
  console.log("|myAudit.js| Metadata:", metadata);

  // Basic security checks
  const securityChecks = {
    hasCode: code !== "0x",
    isOpenSource: metadata?.sourcecode ? true : false,
    potentialIssues: [],
    canTrade: true,
  };

  // If contract is not open source set canTrade to false
  if (!securityChecks.isOpenSource) {
    securityChecks.potentialIssues.push("Contract is not open source");
    securityChecks.canTrade = false;
  }

  // Check for common dangerous patterns in bytecode
  const dangerousPatterns = [
    {
      pattern: "selfdestruct",
      risk: "HIGH",
      message: "Contains selfdestruct capability",
    },
  ];

  // Loop through dangerous patterns and check if they are in the bytecode
  for (const { pattern, risk, message } of dangerousPatterns) {
    if (code.toLowerCase().includes(pattern.toLowerCase())) {
      securityChecks.potentialIssues.push(pattern, risk, message);
      securityChecks.canTrade = false;
    }
  }

  console.log("|myAudit.js| Security checks:", securityChecks);

  return securityChecks;
}

myAudit("1", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
module.exports = myAudit;
