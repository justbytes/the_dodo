const path = require("path");
require("dotenv").config(path.join(__dirname, "../../../.env"));

/**
 * Get Infura settings
 * @param {string} chainId
 * @returns {object} settings
 */
const getInfuraSettings = (chainId) => {
  switch (Number(chainId)) {
    case 1: // Eth Mainnet
      return `--rpc infura-mainnet`;
    case 8453: // Base mainnet
      return `--rpc mainnet.base.org:443 --rpctls True`;
    default:
      return false;
  }
};

module.exports = getInfuraSettings;
