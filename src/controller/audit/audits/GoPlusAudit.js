const { GoPlus } = require("@goplus/sdk-node");

/**
 * @class GoPlusAudit
 * @description This class is used to run the GoPlus audit on the new token
 */
class GoPlusAudit {
  /**
   * @constructor
   * @description This constructor is used to initialize the GoPlusAudit class
   */
  constructor() {
    this.counter = 0;
    this.queue = [];

    // Runs the GoPlus audit every 60 seconds
    setInterval(async () => {
      console.log("*******   CHECKING GOPLUS AUDIT QUEUE   *******");
      // Allow for 30 more GoPlusAudits to be called
      this.counter = 0;

      // Storage var for the number of audits to run
      let auditsToRun = 0;

      // Get the number of audits to run
      if (this.queue.length === 0) {
        return;
      } else if (this.queue.length > 30) {
        auditsToRun = 30;
      } else {
        auditsToRun = 30 - this.queue.length;
      }

      // Run the audits
      for (let i = 0; i < auditsToRun; i++) {
        // Get the audit from the queue
        const { chainId, newTokenAddress } = this.queue[i];

        // Run the audit
        this.goPlusAudit(chainId, newTokenAddress);

        // Wait for 1 second before running the next audit
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }, 60000); // 60 seconds
  }

  /**
   * Checks if the address is malicious
   * @param {string} chainId
   * @param {string} targetAddress
   * @returns {object} malicious results
   */
  async maliciousCheck(chainId, targetAddress) {
    // Wait for 1 second if counter is greater than 30
    while (this.counter >= 30) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      // Get the address security data
      const response = await GoPlus.addressSecurity(chainId, targetAddress);

      // Increment the number of audits calls
      this.counter++;
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
    const MAX_RETRIES = 12;
    const RETRY_DELAY = 10000; // 10 seconds
    const TIMEOUT = 45;
    let retryCount = 0;

    // A recursive function to fetch the security data
    const fetchData = async () => {
      let response;
      // Wait for the counter to be less than 30
      while (this.counter >= 30) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Make the GoPlus API call
      try {
        response = await GoPlus.tokenSecurity(chainId, targetAddress, TIMEOUT);
        this.counter++;
      } catch (error) {
        console.error("GoPlus token security API call failed:", error);
        return false;
      }

      // Handle rate limit error
      if (response.code === 4029) {
        console.log("GoPlus Rate Limit Reached, waiting 10 seconds...");
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        retryCount++;
        return fetchData();
      }

      // Handle invalid or empty response
      if (
        !response ||
        response === undefined ||
        Object.keys(response).length === 0
      ) {
        console.log("GoPlus Data is invalid or empty, retrying...");
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        retryCount++;
        return fetchData();
      }

      // Check max retries
      if (retryCount >= MAX_RETRIES) {
        console.log("Max retries reached, unable to fetch data from GoPlus");
        return false;
      }

      // Return the first key's value from the response
      return response.result[Object.keys(response.result)[0]];
    };

    // Get the security data
    const response = await fetchData();

    // If the response is false, return the failure
    if (!response) {
      return {
        success: false,
        results: {
          securityData: null,
          reason: "Could not fetch GoPlus data",
        },
      };
    }

    return response;
  }

  /**
   * Checks if the contract is open source and if trading is secure
   * @param {string} chainId
   * @param {string} targetAddress
   * @returns {object} security data
   */
  async securityCheck(chainId, targetAddress) {
    // Trading Security Checks
    const tradingSecurityChecks = ["cannot_buy", "cannot_sell_all"];

    // Get the security data
    const data = await this.fetchSecurityData(chainId, targetAddress);
    // Check if contract is open source first
    if (data.is_open_source !== "1") {
      // If the contract is not open source, return the data and reason for failure
      return {
        success: false,
        results: {
          securityData: data,
          reason: "Contract is not open source",
        },
      };
    }

    // Check if trading is secure
    const isTradingSecure = tradingSecurityChecks.every(
      (check) => data[check] === "0"
    );

    if (!isTradingSecure) {
      // If the trading is not secure, return the data and reason for failure
      return {
        success: false,
        results: {
          securityData: data,
          reason: "Token cannot be freely traded",
        },
      };
    }

    // Check if the buy/sell tax is unknown
    if (data.buy_tax === "" || data.sell_tax === "") {
      // If the buy/sell tax is unknown, return the data and reason for failure
      return {
        success: false,
        results: {
          securityData: data,
          reason: "Unknown buy/sell tax",
        },
      };
    }

    const buyTax = parseFloat(data.buy_tax);
    const sellTax = parseFloat(data.sell_tax);
    const MAX_TAX = 0.1;

    if (buyTax <= MAX_TAX && sellTax <= MAX_TAX) {
      // If the buy/sell tax is less than the max tax, return the data and success
      return { success: true, results: { ...data } };
    } else {
      // If the buy/sell tax is greater than the max tax, return the data and reason for failure
      return {
        success: false,
        results: {
          securityData: { ...data },
          reason: "Buy/Sell tax too high",
        },
      };
    }
  }

  /**
   * Runs the GoPlus audit
   * @param {string} chainId
   * @param {string} newTokenAddress
   * @returns {object} audit results
   */
  async main(chainId, newTokenAddress) {
    // Check if the newTokenAddress is already in the queue
    const recorded = this.queue.some(
      (queueItem) => queueItem.newTokenAddress === newTokenAddress
    );

    // If there are 30 audits called within the minute, add the new audit to the queue
    if (this.goPlusAuditsActive >= 30) {
      // If the newTokenAddress is already in the queue, return
      if (recorded) {
        return;
      }

      // Token is not in queue, add it
      this.queue.push({ chainId, newTokenAddress });
      return;
    }

    // Get the security results
    const securityResults = await this.securityCheck(chainId, newTokenAddress);

    // Get the malicious results
    const maliciousResults = await this.maliciousCheck(
      chainId,
      newTokenAddress
    );

    // Remove the audit from the queue if it was recorded
    if (recorded) {
      this.queue = this.queue.filter(
        (item) =>
          !(
            item.chainId === chainId && item.newTokenAddress === newTokenAddress
          )
      );
    }

    return {
      success: securityResults.success,
      securityData: { ...securityResults.results },
      maliciousData: { ...maliciousResults },
    };
  }
}

// Export a factory function that creates a new instance
module.exports = GoPlusAudit;
