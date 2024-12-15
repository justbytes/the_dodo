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

    // Get the token security data
    const fetchData = async () => {
      let response;
      // Wait for the counter to be less than 30
      while (this.counter >= 30) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
      }

      // Get the token security data
      try {
        // GoPlus token security API call
        response = await GoPlus.tokenSecurity(chainId, targetAddress, TIMEOUT);

        // Increment the number of audits calls
        this.counter++;
      } catch (error) {
        console.error("GoPlus token security API call failed:", error);
        return false;
      }

      // Check if the response is a rate limit error
      if (response.code === 4029) {
        console.log("GoPlus Rate Limit Reached, waiting 10 seconds...");

        // Wait for 10 seconds
        await new Promise((resolve) => setTimeout(resolve, 10000));

        // Increment the retry count
        retryCount++;

        // Retry the fetchData
        return fetchData();
      } else if (response === undefined) {
        console.log("Goplus Data is undefined waiting 5 seconds...");

        // Wait for 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Increment the retry count
        retryCount++;

        // Retry the fetchData
        return fetchData();
      }

      // If the retry count is greater than the max retries, return false
      if (retryCount === MAX_RETRIES) {
        console.log("Max retries reached, unable to fetch data from GoPlus");
        return false;
      }

      return response.result;
    };
    // Get the token security data
    const response = await fetchData();

    if (!response) {
      return {
        success: false,
        results: {
          securityData: null,
          reason: "Could not fetch GoPlus data",
        },
      };
    }

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
    const recorded = this.goPlusAuditsQueue.some(
      (queueItem) => queueItem.newTokenAddress === newTokenAddress
    );

    // If there are 30 audits called within the minute, add the new audit to the queue
    if (this.goPlusAuditsActive >= 30) {
      // If the newTokenAddress is already in the queue, return
      if (recorded) {
        return;
      }

      // Token is not in queue, add it
      this.goPlusAuditsQueue.push({ chainId, newTokenAddress });
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
module.exports = (chainId, targetAddress) =>
  new GoPlusAudit().main(chainId, targetAddress);
