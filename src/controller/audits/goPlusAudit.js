const { GoPlus } = require("@goplus/sdk-node");

/**
 * Performs a GoPlus malicious check on new token address. This data isn't going to be used
 * immediately but will be used to record the results for future analysis.
 * @param {*} chainId
 * @param {*} targetAddress
 * @returns
 */
const maliciousCheck = async (chainId, targetAddress) => {
  // Make the api call and return the data if it is successful
  try {
    const response = await GoPlus.addressSecurity(chainId, targetAddress, 45);
    return response.result;
  } catch (error) {
    console.log(
      "There was a problem retrieving data from GoPlus address security api call.\n",
      error
    );
    return null;
  }
};

/**
 * Handles the api request for the token security data and handles retrys in the event that the data
 * data returned is an empty object
 * @param {*} chainId Blockchain id
 * @param {*} targetAddress target address of the new token to be audited
 * @returns token security data
 */
const getSecurityData = async (chainId, targetAddress) => {
  // Constants at the top for better maintainability
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 10000; // 10 seconds
  const TIMEOUT = 45;

  // Helper function in case we need to retry the api call
  const fetchTokenSecurity = async () => {
    try {
      const response = await GoPlus.tokenSecurity(
        chainId,
        targetAddress,
        TIMEOUT
      );

      console.log("GoPlus response:", response);

      return { data: response.result, error: null };
    } catch (error) {
      console.error("GoPlus token security API call failed:", error);
      return { data: null, error };
    }
  };

  // Initial API call
  const results = await fetchTokenSecurity();

  //console.log(results);

  // If there is an error exit
  if (results.error) {
    return { success: false, fields: null };
  }

  //console.log(results.data);

  // If we have valid data, return early
  if (Object.keys(results.data).length > 0) {
    const key = Object.keys(results.data)[0];
    return results.data[key];
  }

  // Retry logic in case the data is empty
  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    console.log(`Retry attempt: ${retry + 1}/${MAX_RETRIES}`);

    const { data: retryData, error: retryError } = await fetchTokenSecurity();
    if (retryError) {
      return { success: false, fields: null };
    }

    if (Object.keys(retryData).length > 0) {
      const key = Object.keys(retryData)[0];
      return retryData[key];
    }

    if (retry < MAX_RETRIES - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  console.log("Maximum retry attempts reached, token fails.");
  return { success: false, fields: null };
};

/**
 * Performs a security check on the token
 * @param {*} chainId
 * @param {*} targetAddress
 * @returns
 */
const securityCheck = async (chainId, targetAddress) => {
  // Get the security data
  const data = await getSecurityData(chainId, targetAddress);

  // Check if contract is open source first
  if (data.is_open_source !== "1") {
    console.log("Contract is not open source!");
    return false;
  }

  // Trading Security Checks
  const tradingSecurityChecks = ["cannot_buy", "cannot_sell_all"];

  // Check if trading is secure
  const isTradingSecure = tradingSecurityChecks.every(
    (check) => data[check] === "0"
  );

  if (!isTradingSecure) {
    console.log("Token cannot be freely traded!");
    return false;
  }

  // Check if the buy/sell tax is unknown
  if (data.buy_tax === "" || data.sell_tax === "") {
    console.log("Unknown buy or sell tax!");
    return false;
  }

  const buyTax = parseFloat(data.buy_tax);
  const sellTax = parseFloat(data.sell_tax);
  const MAX_TAX = 0.1;

  if (buyTax <= MAX_TAX && sellTax <= MAX_TAX) {
    console.log("***  Token passes security check!  ***");

    return data;
  } else {
    console.log(
      `Token buy or sell tax is too high! \nBuy Tax: ${data.buy_tax} Sell Tax: ${data.sell_tax}`
    );
    return false;
  }
};

/**
 * Run the GoPlus audit on the new token address and collect the results for analysis
 * @param {number} chainId
 * @param {string} targetAddress - the new token address
 */
const goPlusAudit = async (chainId, targetAddress) => {
  // Get the malicious results can be null if something went wrong with the api call
  const maliciousResults = await maliciousCheck(chainId, targetAddress);

  // Get the security results
  const securityResults = await securityCheck(chainId, targetAddress);

  // If the security check fails, return false
  if (!securityResults) {
    return false;
  }

  // Combine the results
  return { GoPlusAudit: { ...maliciousResults, ...securityResults } };
};

module.exports = goPlusAudit;
