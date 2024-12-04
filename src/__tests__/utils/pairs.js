/**
 * @description This file contains data for testing different pairs on different chains
 */
const ETH_PAIR = {
  id: "1234",
  chainId: "1",
  newTokenAddress: "0xc47ef9b19c3e29317a50f5fbe594eba361dada4a",
  baseTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  pairAddress: "0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f",
  v3: false,
  fee: null,
  auditResults: null,
  intialPrice: null,
  targetPrice: null,
  tradeInProgress: null,
  baseTokenDecimal: null,
  newTokenDecimal: null,
  baseAssetReserve: null,
  liquidityListener: null,
  targetListener: null,
};
const BASE_PAIR = {
  id: "1234",
  chainId: "8453",
  newTokenAddress: "0x0000000000000000000000000000000000000000",
  baseTokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  pairAddress: "0x0000000000000000000000000000000000000000",
  v3: false,
  fee: null,
  auditResults: null,
  intialPrice: null,
  targetPrice: null,
  tradeInProgress: null,
  baseTokenDecimal: null,
  newTokenDecimal: null,
  baseAssetReserve: null,
  liquidityListener: null,
  targetListener: null,
};

module.exports = { ETH_PAIR, BASE_PAIR };
