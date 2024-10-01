const { GoPlus } = require("@goplus/sdk-node");

/**
 * Takes a chain id and token target address which then checks for popular scams or malicious token code
 * This is the first quick check before a more detailed examination of the token.
 *
 * Returns true if the token is safe
 * Returns false if there is an error or if the tokne is unsafe
 */
const maliciousCheck = async (chainId, targetAddress) => {
  let response;

  // Looks to see if token code displays popular scams or if its a known scammer address
  try {
    response = await GoPlus.addressSecurity(
      chainId,
      targetAddress,
      45 // 30 second timeout
    );
  } catch (error) {
    console.log(
      "There was an problem retreiving data from GoPlus address security api call."
    );
  }

  const data = response.result;

  if (
    data.cybercrime == "0" &&
    data.money_laundering == "0" &&
    data.number_of_malicious_contracts_created == "0" &&
    data.financial_crime == "0" &&
    data.darkweb_transactions == "0" &&
    data.reinit == "0" &&
    data.phishing_activities == "0" &&
    data.fake_kyc == "0" &&
    data.blacklist_doubt == "0" &&
    data.fake_standard_interface == "0" &&
    data.stealing_attack == "0" &&
    data.blackmail_activities == "0" &&
    data.sanctioned == "0" &&
    data.malicious_mining_activities == "0" &&
    data.mixer == "0" &&
    data.fake_token == "0" &&
    data.honeypot_related_address == "0"
  ) {
    return { sucess: true, fields: data };
  } else {
    console.log("Failed malicious check\n", data);

    return { sucess: false, fields: null };
  }
};

/**
 * Handles the api request for the token security data and handles retrys in the event that the data
 * data returned is an empty object
 *
 * @param {*} chainId Blockchain id
 * @param {*} targetAddress target address of the new token to be audited
 * @returns token security data
 */
const getSecurityData = async (chainId, targetAddress) => {
  let response, data;

  // Initial API call to fetch data
  try {
    response = await GoPlus.tokenSecurity(chainId, targetAddress, 45);

    data = response.result;
  } catch (error) {
    console.error(
      "There was a problem retrieving data from GoPlus token security API call. \n" +
        error
    );

    return { sucess: false, fields: null }; // Return early if the initial call fails
  }

  // Sometimes you have to wait few seconds to get the data from the token sniffer
  // Retry 5 times if an empty object was returned
  //
  if (Object.keys(data).length === 0) {
    let retryData;
    let retry = 0;

    while (retry < 5) {
      console.log("Retry attempt: ", retry);

      try {
        const retryResponse = await GoPlus.tokenSecurity(
          chainId,
          targetAddress,
          45
        );
        retryData = retryResponse.result;
      } catch (error) {
        console.error(
          "There was a problem retrieving data from GoPlus token security API call. \n" +
            error
        );
        return { sucess: false, fields: null };
      }

      // Check if the data is no longer an empty object
      //
      if (Object.keys(retryData).length > 0) {
        // Update the data and continue on
        data = retryData;
        break;
      }

      // Increment the retry counter
      //
      retry++;

      // Wait 10 seconds before the next iteration
      //
      if (retry < 5) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    // If the maximum retry is reached and is_open_source is still undefined
    if (Object.keys(data).length === 0) {
      console.log("Maximum retry attempts have been reached, token fails.");
      return { sucess: false, fields: null };
    }
  }

  // Define the key of the object
  //
  let key = Object.keys(data)[0];

  // return the security data
  //
  return data[key];
};

/**
 * Does the security check that gets the buy/sell tax and more...
 */
const securityCheck = async (chainId, targetAddress) => {
  // Perform the security audit with GoPlus.tokenSecurity data call
  const data = await getSecurityData(chainId, targetAddress);

  // If the contract does not have open source code then it fails immediately
  if (data.is_open_source == "1") {
    // Contract Security Audit
    if (
      data.is_proxy == "0" &&
      data.is_mintable == "0" &&
      data.can_take_back_ownership == "0" &&
      data.owner_change_balance == "0" &&
      data.hidden_owner == "0" &&
      data.selfdestruct == "0" &&
      data.gas_abuse === undefined
    ) {
      // Trading Security Audit
      if (
        data.cannot_buy == "0" &&
        data.cannot_sell_all == "0" &&
        data.is_honeypot == "0" &&
        data.transfer_pausable == "0" &&
        data.is_blacklisted == "0" &&
        data.is_anti_whale == "0" &&
        data.anti_whale_modifiable == "0" &&
        data.trading_cooldown == "0" &&
        data.personal_slippage_modifiable == "0"
      ) {
        // Checks the buy and sell tax
        if (data.buy_tax === "" || data.sell_tax === "") {
          console.log("Unknown buy or sell tax!");
          console.log("");
          return { sucess: false, fields: null };
        } else if (
          parseFloat(data.buy_tax) <= 0.1 &&
          parseFloat(data.sell_tax) <= 0.1
        ) {
          console.log("***  Token passes security check!  ***");
          console.log("");
          return { sucess: true, fields: data };
        } else if (
          parseFloat(data.buy_tax) > 0.1 &&
          parseFloat(data.sell_tax) > 0.1
        ) {
          console.log(
            `Token buy or sell tax is too high! \n Buy Tax: ${data.buy_tax} Sell Tax: ${data.sell_tax}`
          );
          console.log("");
          return { sucess: false, fields: null };
        } else {
          console.error("**Unkown condition! | audit.js line 187**");
          console.log("");
          return { sucess: false, fields: null };
        }
      } else {
        console.log("Token cannot be freely traded!");
        console.log("");
        return { sucess: false, fields: null };
      }
    } else {
      console.log("Token fails contract security audit!");
      console.log("");
      return { sucess: false, fields: null };
    }
  } else {
    console.log("Contract is not open source!");
    console.log("");
    return { sucess: false, fields: null };
  }
};

const audit = async (chainId, targetAddress) => {
  return new Promise(async (resolve) => {
    const malicious = await maliciousCheck(chainId, targetAddress);

    if (!malicious.sucess) {
      resolve({ isSafe: false, fields: null });
      return;
    }

    const secure = await securityCheck(chainId, targetAddress);

    if (!secure.sucess) {
      resolve({ isSafe: false, fields: null });
      return;
    }

    const auditResults = { ...malicious.fields, ...secure.fields };
    resolve({ isSafe: true, auditResults: auditResults });
    return;
  });
};

module.exports = audit;
