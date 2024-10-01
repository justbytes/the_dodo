const { v4: uuidv4 } = require("uuid");
const DodoEgg = require("../class/DodoEgg");

/**
 * JSON data that should be parsed and converted into a DodoEgg object
 * @param {*} data JSON DATA
 * @returns  a DodoEgg
 */
const deserealizeDodo = (data) => {
  // Convert and parse data
  const dataToString = data.toString();
  const parsedData = JSON.parse(dataToString);

  // Create a new DodoEgg object
  const dodoEgg = new DodoEgg(
    parsedData.id ?? uuidv4(),
    parsedData.chainId,
    parsedData.newToken,
    parsedData.baseToken,
    parsedData.pairAddress,
    parsedData.v3,
    parsedData.auditResults ?? null,
    parsedData.intialPrice ?? null,
    parsedData.targetPrice ?? null,
    parsedData.tradeInProgress ?? null,
    parsedData.baseTokenDecimal ?? null,
    parsedData.newTokenDecimal ?? null,
    parsedData.baseAssetReserve ?? null,
    parsedData.liquidityListener ?? null,
    parsedData.targetListener ?? null
  );

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
