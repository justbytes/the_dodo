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

// UNISWAP V3 ETH FALSE POSITIVE
const V3_ETH_FALSE_POSITIVE = {
  id: "a1fe48a8-f4c2-4c5b-b342-6612983b5fa8",
  chainId: "1",
  newToken: "0x0000000000c5dc95539589fbD24BE07c6C14eCa4",
  baseToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  pairAddress: "0x044d1610e600D041229407Fb6e514D259276e3b3",
  v3: true,
  fee: "3000",
  auditResults: {
    success: true,
    goPlusAudit: {
      success: true,
      securityData: {
        lp_total_supply: "1288178675.826922858138724146",
        transfer_pausable: "0",
        trading_cooldown: "0",
        hidden_owner: "0",
        selfdestruct: "0",
        owner_percent: "0.000000",
        is_whitelisted: "0",
        holder_count: "4317",
        is_honeypot: "0",
        honeypot_with_same_creator: "0",
        is_open_source: "1",
        sell_tax: "0",
        token_name: "Milady Cult Coin",
        creator_address: "0x1ec7e0b7cd1a79a4afb873aeffe50ddca6446563",
        creator_percent: "0.000000",
        is_proxy: "0",
        creator_balance: "0",
        is_in_dex: "1",
        owner_balance: "0",
        total_supply: "100000000000",
        can_take_back_ownership: "0",
        is_blacklisted: "0",
        owner_address: "0xd5cd18d3cb65fdab15076618401ff79097f9d780",
        slippage_modifiable: "0",
        buy_tax: "0",
        external_call: "0",
        cannot_sell_all: "0",
        lp_holder_count: "10",
        personal_slippage_modifiable: "0",
        is_anti_whale: "0",
        is_mintable: "0",
        owner_change_balance: "0",
        cannot_buy: "0",
        anti_whale_modifiable: "0",
        token_symbol: "CULT",
      },
      maliciousData: {
        cybercrime: "0",
        money_laundering: "0",
        number_of_malicious_contracts_created: "0",
        gas_abuse: "0",
        financial_crime: "0",
        darkweb_transactions: "0",
        reinit: "0",
        phishing_activities: "0",
        contract_address: "1",
        fake_kyc: "0",
        blacklist_doubt: "0",
        data_source: "",
        fake_standard_interface: "0",
        stealing_attack: "0",
        blackmail_activities: "0",
        sanctioned: "0",
        malicious_mining_activities: "0",
        mixer: "0",
        fake_token: "0",
        honeypot_related_address: "0",
      },
    },
    mythrilAudit: {
      error: null,
      issues: [
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "_function_0x72c489c0",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "balanceOf(address)",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "_function_0x54d1f13d",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "_function_0x5044483c",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "decimals() or available_assert_time(uint16,uint64)",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "_function_0x25692962",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "_function_0x25692962",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "totalSupply()",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "approve(address,uint256)",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "transferEther(address,uint256)",
        },
        {
          title: "Integer Arithmetic Bugs",
          description:
            "The arithmetic operator can overflow.\nIt is possible to cause an integer overflow or underflow in the arithmetic operation. ",
          severity: "High",
          function: "_function_0x01b4f57c",
        },
      ],
      success: true,
    },
    timestamp: "2024-12-09T01:56:12.110Z",
  },
  intialPrice: "0",
  targetPrice: "0",
  tradeInProgress: null,
  baseTokenDecimal: null,
  newTokenDecimal: null,
  baseAssetReserve: null,
  liquidityListener: null,
  targetListener: null,
};

module.exports = { ETH_PAIR, BASE_PAIR, V3_ETH_FALSE_POSITIVE };
