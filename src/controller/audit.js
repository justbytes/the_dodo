const { GoPlus } = require("@goplus/sdk-node");

const securityChecks = [
  "cybercrime",
  "money_laundering",
  "number_of_malicious_contracts_created",
  "financial_crime",
  "darkweb_transactions",
  "reinit",
  "fake_kyc",
  "fake_standard_interface",
  "stealing_attack",
  "blackmail_activities",
  "sanctioned",
  "malicious_mining_activities",
  "mixer",
  "fake_token",
  "honeypot_related_address",
];

// Contract Security Checks || Not used currently because it doesn't work pass popular meme coins
const contractSecurityChecks = [
  "is_mintable",
  "can_take_back_ownership",
  "owner_change_balance",
  "hidden_owner",
  "selfdestruct",
];

// Trading Security Checks
const tradingSecurityChecks = ["cannot_buy", "cannot_sell_all"];

/**
 * Performs a GoPlus malicious check on the token
 * @param {*} chainId
 * @param {*} targetAddress
 * @returns
 */
const maliciousCheck = async (chainId, targetAddress) => {
  try {
    console.log("chainId", chainId);
    console.log("targetAddress", targetAddress);
    console.log("");

    const response = await GoPlus.addressSecurity(chainId, targetAddress, 45);
    const data = response.result;

    const isSecure = securityChecks.every((check) => data[check] === "0");

    if (isSecure) {
      return { sucess: true, fields: data };
    }

    console.log("Failed malicious check\n", data);
    return { sucess: false, fields: null };
  } catch (error) {
    console.log(
      "There was a problem retrieving data from GoPlus address security api call.\n",
      error
    );
    return { sucess: false, fields: null };
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
      return { data: response.result, error: null };
    } catch (error) {
      console.error("GoPlus token security API call failed:", error);
      return { data: null, error };
    }
  };

  // Initial API call
  const { data: initialData, error: initialError } = await fetchTokenSecurity();

  // If there is an error exit
  if (initialError) {
    return { success: false, fields: null };
  }

  // If we have valid data, return early
  if (Object.keys(initialData).length > 0) {
    const key = Object.keys(initialData)[0];
    return initialData[key];
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
    return { sucess: false, fields: null };
  }

  // Check if trading is secure
  const isTradingSecure = tradingSecurityChecks.every(
    (check) => data[check] === "0"
  );

  if (!isTradingSecure) {
    console.log("Token cannot be freely traded!");
    return { sucess: false, fields: null };
  }

  // Check if the buy/sell tax is unknown
  if (data.buy_tax === "" || data.sell_tax === "") {
    console.log("Unknown buy or sell tax!");
    return { sucess: false, fields: null };
  }

  const buyTax = parseFloat(data.buy_tax);
  const sellTax = parseFloat(data.sell_tax);
  const MAX_TAX = 0.1;

  if (buyTax <= MAX_TAX && sellTax <= MAX_TAX) {
    console.log("***  Token passes security check!  ***");
    return { sucess: true, fields: data };
  } else {
    console.log(
      `Token buy or sell tax is too high! \nBuy Tax: ${data.buy_tax} Sell Tax: ${data.sell_tax}`
    );
    return { sucess: false, fields: null };
  }
};

/**
 * Handles the audit process
 * @param {number} chainId
 * @param {string} targetAddress - the new token address
 */
const audit = async (chainId, targetAddress) => {
  const malicious = await maliciousCheck(chainId, targetAddress);
  if (!malicious.sucess) {
    return { isSafe: false, fields: null };
  }

  const secure = await securityCheck(chainId, targetAddress);
  if (!secure.sucess) {
    return { isSafe: false, fields: null };
  }

  const auditResults = { ...malicious.fields, ...secure.fields };
  return { isSafe: true, fields: auditResults };
};

module.exports = audit;
