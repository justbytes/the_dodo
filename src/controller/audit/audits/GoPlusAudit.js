const { GoPlus } = require("@goplus/sdk-node");

/**
 * @class GoPlusAudit
 * @description This class is used to run the GoPlus audit on the new token
 */
class GoPlusAudit {
  /**
   * Checks if the address is malicious
   * @param {string} chainId
   * @param {string} targetAddress
   * @returns {object} malicious results
   */
  async maliciousCheck(chainId, targetAddress) {
    try {
      // Get the address security data
      const response = await GoPlus.addressSecurity(chainId, targetAddress);

      return response.result;
    } catch (error) {
      console.log(
        "There was a problem retrieving data from GoPlus address security api call.\n",
        error
      );

      return null;
    }
  }

  /**
   * Fetches the security data from the GoPlus API
   * @param {string} chainId
   * @param {string} targetAddress
   * @returns {object} security data
   */
  async fetchSecurityData(chainId, targetAddress) {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 10000; // 10 seconds
    const TIMEOUT = 45;

    // Get the token security data
    const fetchData = async () => {
      try {
        const response = await GoPlus.tokenSecurity(
          chainId,
          targetAddress,
          TIMEOUT
        );

        return response.result;
      } catch (error) {
        console.error("GoPlus token security API call failed:", error);
        return false;
      }
    };

    // Retry logic in case the data is empty
    const handleRetry = async () => {
      for (let retry = 0; retry < MAX_RETRIES; retry++) {
        console.log(`Retry attempt: ${retry + 1}/${MAX_RETRIES}`);

        const retryData = await fetchData();
        if (!retryData) {
          return false;
        }

        if (Object.keys(retryData).length > 0) {
          const key = Object.keys(retryData)[0];
          return retryData[key];
        }

        if (retry < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
      }
    };

    // Get the token security data
    const response = await fetchData();

    // If we have valid data, return early otherwise retry
    if (Object.keys(response).length > 0) {
      const key = Object.keys(response)[0];
      return response[key];
    } else {
      return handleRetry();
    }
  }

  /**
   * Checks if the contract is open source and if trading is secure
   * @param {string} chainId
   * @param {string} targetAddress
   * @returns {object} security data
   */
  async securityCheck(chainId, targetAddress) {
    // Get the security data
    const data = await this.fetchSecurityData(chainId, targetAddress);

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
  }

  /**
   * Runs the GoPlus audit
   * @param {string} chainId
   * @param {string} targetAddress
   * @returns {object} audit results
   */
  async main(chainId, targetAddress) {
    // Get the security results
    const securityResults = await this.securityCheck(chainId, targetAddress);

    // If the audit failed, return false
    if (!securityResults) {
      return false;
    }

    // Get the malicious results
    const maliciousResults = await this.maliciousCheck(chainId, targetAddress);

    return { GoPlusAudit: { ...securityResults, ...maliciousResults } };
  }
}

// Export a factory function that creates a new instance
module.exports = (chainId, targetAddress) =>
  new GoPlusAudit().main(chainId, targetAddress);
