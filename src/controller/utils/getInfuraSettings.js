const path = require("path");
require("dotenv").config(path.join(__dirname, "../../../.env"));

/**
 * Get Infura settings
 * @param {string} chainId
 * @returns {object} settings
 */
const getInfuraSettings = (chainId) => {
  switch (Number(chainId)) {
    case 1:
      return {
        url: `https://mainnet.infura.io/v3/`,
        id: process.env.INFURA_ID,
      };
    default:
      return false;
  }
};

module.exports = getInfuraSettings;
