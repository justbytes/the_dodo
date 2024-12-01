const main = async (chainId, newTokenAddress) => {
  let goPlusAudit, mythrilAudit;

  // GoPlus audit
  try {
    const goPlusResults = await goPlusAudit(chainId, newTokenAddress);

    // If the audit failed, return false
    if (!goPlusResults) {
      return false;
    }
  } catch (error) {
    console.error(
      "| index.js | There was an error with the GoPlus audit.\n" + error
    );

    return false;
  }

  // Mythril audit
  try {
    console.log("Mythril audit");

    const mythrilResults = await mythrilAudit(chainId, newTokenAddress);

    if (!mythrilResults) {
      return false;
    }
  } catch (error) {
    console.error(
      "| index.js | There was an error with the Mythril audit.\n" + error
    );

    return false;
  }

  return { goPlusAudit, mythrilAudit };
};

module.exports = main;
