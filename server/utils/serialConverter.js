const { v4: uuidv4 } = require("uuid");
const DodoEgg = require("../class/DodoEgg");

/**
 * JSON data that should be parsed and converted into a DodoEgg object
 * @param {object} data JSON DATA
 * @returns {object} a DodoEgg
 */
const deserealizeDodo = (data) => {
  // Convert and parse data
  const dataToString = data.toString();
  const parsedData = JSON.parse(dataToString);

  // Create a new DodoEgg paramsobject
  const params = {
    id: parsedData.id ?? uuidv4(),
    chainId: parsedData.chainId,
    newTokenAddress: parsedData.newToken,
    baseTokenAddress: parsedData.baseToken,
    pairAddress: parsedData.pairAddress,
    v3: parsedData.v3,
    fee: parsedData.fee ?? null,
    auditResults: parsedData.auditResults ?? null,
    intialPrice: parsedData.intialPrice ?? null,
    targetPrice: parsedData.targetPrice ?? null,
    tradeInProgress: parsedData.tradeInProgress ?? null,
    baseTokenDecimal: parsedData.baseTokenDecimal ?? null,
    newTokenDecimal: parsedData.newTokenDecimal ?? null,
    baseAssetReserve: parsedData.baseAssetReserve ?? null,
    liquidityListener: parsedData.liquidityListener ?? null,
    targetListener: parsedData.targetListener ?? null,
  };

  // Create a new DodoEgg object
  const dodoEgg = new DodoEgg(params);

  // Return the dodoEgg
  return dodoEgg;
};

/**
 * Convert the dodoEgg.getInfo() into JSON data so it can be sent
 * over a websocket
 * @param {*} data a DodoEgg.getInfo
 * @returns JSON data of a dodoEgg
 */
const serealizeDodo = (data) => {
  // Convert data to JSON

  const rawDodoData = {
    ...data,
  };

  return JSON.stringify(rawDodoData);
};

module.exports = { deserealizeDodo, serealizeDodo };
