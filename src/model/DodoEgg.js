const { Alchemy } = require("alchemy-sdk");
const getAlchemySettings = require("../utils/getAlchemySettings");

class DodoEgg {
  /**
   * Constructor for a DodoEgg
   * @param {uuid} id
   * @param {number} chainId
   * @param {string} newTokenAddress
   * @param {string} baseTokenAddress
   * @param {string} pairAddress
   * @param {boolean} v3
   * @param {number} fee
   * @param {object} auditResults
   * @param {number} intialPrice
   * @param {number} targetPrice
   * @param {boolean} tradeInProgress
   * @param {number} baseTokenDecimal
   * @param {number} newTokenDecimal
   * @param {number} baseAssetReserve
   * @param {function} liquidityListener
   * @param {function} targetListener
   */
  constructor(
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
  ) {
    this.id = id;
    this.chainId = chainId;
    this.newTokenAddress = newTokenAddress;
    this.baseTokenAddress = baseTokenAddress;
    this.pairAddress = pairAddress;
    this.v3 = v3;
    this.fee = fee;
    this.auditResults = auditResults;
    this.intialPrice = intialPrice;
    this.targetPrice = targetPrice;
    this.tradeInProgress = tradeInProgress;
    this.baseTokenDecimal = baseTokenDecimal;
    this.newTokenDecimal = newTokenDecimal;
    this.baseAssetReserve = baseAssetReserve;
    this.liquidityListener = liquidityListener;
    this.targetListener = targetListener;
    this.alchemy = new Alchemy(getAlchemySettings(chainId));
  }

  get id() {
    return this.id;
  }
  set id(id) {
    this.id = id;
  }

  get chainId() {
    return this.chainId;
  }

  set chainId(chainId) {
    this.chainId = chainId;
  }

  get newTokenAddress() {
    return this.newTokenAddress;
  }

  set newTokenAddress(newTokenAddress) {
    this.newTokenAddress = newTokenAddress;
  }

  get baseTokenAddress() {
    return this.baseTokenAddress;
  }

  set baseTokenAddress(baseTokenAddress) {
    this.baseTokenAddress = baseTokenAddress;
  }

  get pairAddress() {
    return this.pairAddress;
  }

  set pairAddress(pairAddress) {
    this.pairAddress = pairAddress;
  }

  get v3() {
    return this.v3;
  }

  get fee() {
    return this.fee;
  }

  get auditResults() {
    return this.auditResults;
  }

  set auditResults(auditResults) {
    this.auditResults = auditResults;
  }

  get intialPrice() {
    return this.intialPrice;
  }

  set intialPrice(intialPrice) {
    this.intialPrice = intialPrice;
  }

  get targetPrice() {
    return this.targetPrice;
  }

  set targetPrice(targetPrice) {
    this.targetPrice = targetPrice;
  }

  get tradeInProgress() {
    return this.tradeInProgress;
  }

  set tradeInProgress(tradeInProgress) {
    this.tradeInProgress = tradeInProgress;
  }

  get baseTokenDecimal() {
    return this.baseTokenDecimal;
  }

  set baseTokenDecimal(baseTokenDecimal) {
    this.baseTokenDecimal = baseTokenDecimal;
  }

  get newTokenDecimal() {
    return this.newTokenDecimal;
  }

  set newTokenDecimal(newTokenDecimal) {
    this.newTokenDecimal = newTokenDecimal;
  }

  get baseAssetReserve() {
    return this.baseAssetReserve;
  }

  set baseAssetReserve(baseAssetReserve) {
    this.baseAssetReserve = baseAssetReserve;
  }

  get liquidityListener() {
    return this.liquidityListener;
  }

  set liquidityListener(liquidityListener) {
    this.liquidityListener = liquidityListener;
  }

  get targetListener() {
    return this.targetListener;
  }

  set targetListener(targetListener) {
    this.targetListener = targetListener;
  }

  get alchemy() {
    return this.alchemy;
  }

  /**
   * @returns current dodo egg info
   */
  getDodoEgg() {
    return {
      id: this.id,
      chainId: this.chainId,
      newToken: this.newTokenAddress,
      baseToken: this.baseTokenAddress,
      pairAddress: this.pairAddress,
      v3: this.v3,
      fee: this.fee,
      auditResults: this.auditResults,
      intialPrice: this.intialPrice == null ? "0" : this.intialPrice.toString(),
      targetPrice: this.targetPrice == null ? "0" : this.targetPrice.toString(),
      tradeInProgress: this.tradeInProgress,
      baseTokenDecimal: this.baseTokenDecimal,
      newTokenDecimal: this.newTokenDecimal,
      baseAssetReserve: this.baseAssetReserve,
      liquidityListener: this.liquidityListener,
      targetListener: this.targetListener,
    };
  }
}

module.exports = DodoEgg;
