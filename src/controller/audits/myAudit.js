const { Alchemy } = require("alchemy-sdk");
const getAlchemySettings = require("../../model/utils/getAlchemySettings");

const personalAudit = async (alchemy, contractAddress) => {
  try {
    // Get contract code but use Alchemy provider
    const code = await alchemy.core.getCode(contractAddress);

    // Basic security checks
    const securityChecks = {
      hasCode: code !== "0x",
      potentialIssues: [],
      riskLevel: "LOW",
    };

    // Check for common dangerous patterns in bytecode
    const dangerousPatterns = [
      {
        pattern: "selfdestruct",
        risk: "HIGH",
        message: "Contains selfdestruct capability",
      },
      {
        pattern: "delegatecall",
        risk: "MEDIUM",
        message: "Uses delegatecall",
      },
      {
        pattern: "transfer.{0,10}owner",
        risk: "MEDIUM",
        message: "Has owner transfer function",
      },
    ];

    for (const { pattern, risk, message } of dangerousPatterns) {
      if (code.toLowerCase().includes(pattern.toLowerCase())) {
        securityChecks.potentialIssues.push(message);
        if (risk === "HIGH") {
          securityChecks.riskLevel = "HIGH";
        } else if (risk === "MEDIUM" && securityChecks.riskLevel !== "HIGH") {
          securityChecks.riskLevel = "MEDIUM";
        }
      }
    }

    return securityChecks;
  } catch (error) {
    console.error("MyAudit failed:", error);
    return false;
  }
};

// Example usage
async function myAudit(chainId, targetAddress) {
  const alchemy = new Alchemy(getAlchemySettings(chainId));

  const results = await personalAudit(alchemy, targetAddress);

  if (!results) {
    return false;
  }

  return results;
}

module.exports = myAudit;
