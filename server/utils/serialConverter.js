const { v4: uuidv4 } = require("uuid");
const DodoEgg = require("../class/DodoEgg");

/**
 * JSON data that should be parsed and converted into a DodoEgg object
 * @param {object} data JSON DATA
 * @returns {object} a DodoEgg
 */
const deserializeDodo = (data) => {
  // Convert and parse data
  const dataToString = data.toString();
  const parsedData = JSON.parse(dataToString);

  // Create a new DodoEgg paramsobject

  const id = parsedData.id ?? uuidv4();
  const chainId = parsedData.chainId;
  const newTokenAddress = parsedData.newToken;
  const baseTokenAddress = parsedData.baseToken;
  const pairAddress = parsedData.pairAddress;
  const v3 = parsedData.v3;
  const fee = parsedData.fee ?? null;
  const auditResults = parsedData.auditResults ?? null;
  const intialPrice = parsedData.intialPrice ?? null;
  const targetPrice = parsedData.targetPrice ?? null;
  const tradeInProgress = parsedData.tradeInProgress ?? null;
  const baseTokenDecimal = parsedData.baseTokenDecimal ?? null;
  const newTokenDecimal = parsedData.newTokenDecimal ?? null;
  const baseAssetReserve = parsedData.baseAssetReserve ?? null;
  const liquidityListener = parsedData.liquidityListener ?? null;
  const targetListener = parsedData.targetListener ?? null;

  // Create a new DodoEgg object
  const dodoEgg = new DodoEgg(
    id,
    chainId,
    newTokenAddress,
    baseTokenAddress,
    pairAddress,
    v3,
    fee,
    auditResults,
    intialPrice,
    targetPrice,
    tradeInProgress,
    baseTokenDecimal,
    newTokenDecimal,
    baseAssetReserve,
    liquidityListener,
    targetListener
  );

  // Return the dodoEgg
  return dodoEgg;
};

/**
 * Convert the dodoEgg.getInfo() into JSON data so it can be sent
 * over a websocket
 * @param {*} data a DodoEgg.getInfo
 * @returns JSON data of a dodoEgg
 */
const serializeDodo = (data) => {
  // Convert data to JSON

  const rawDodoData = {
    ...data,
  };

  return JSON.stringify(rawDodoData);
};

module.exports = { deserializeDodo, serializeDodo };
