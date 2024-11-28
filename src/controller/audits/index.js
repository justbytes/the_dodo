const main = async (chainId, newTokenAddress) => {
  let goPlusAudit, slitherAudit, mythrilAudit;

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

  // Slither audit
  try {
    console.log("Slither audit");

    if (!slitherResults) {
      return false;
    }
  } catch (error) {
    console.error(
      "| index.js | There was an error with the Slither audit.\n" + error
    );

    return false;
  }

  // Mythril audit
  try {
    console.log("Mythril audit");

    if (!mythrilAudit) {
      return false;
    }
  } catch (error) {
    console.error(
      "| index.js | There was an error with the Mythril audit.\n" + error
    );

    return false;
  }

  return { goPlusAudit, slitherAudit, mythrilAudit };
};

module.exports = main;
