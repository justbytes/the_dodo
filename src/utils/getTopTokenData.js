require("dotenv").config({ path: "../../.env" });
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const KNOWN_TOKENS_JSON = path.join(__dirname, "../../data/known_tokens.json");

// Get read access to the uniswap.json file to get the subgraph urls
const UNISWAP_JSON = path.join(__dirname, "../../data/uniswap.json");
const rawUniswapData = fs.readFileSync(UNISWAP_JSON);
const UNISWAP = JSON.parse(rawUniswapData);

const query = `
{
  tokens(orderBy: volumeUSD, orderDirection: desc, first:50) {
    id
    name
  }
}
`;

/**
 * Get token data from the Uniswap v3 subgraph
 */
const requestTopTokens = async (name, baseUrl, subgraphId) => {
  console.log(`Requesting V3 token data for ${name} mainnet...`);
  // Uniswap v3 polygon subgraph
  const V3_URL = `${baseUrl}/${process.env.SUBGRAPH_API}/subgraphs/id/${subgraphId}`;
  let tokens;

  try {
    // Request data from subgraph
    const request = await axios.post(V3_URL, { query: query });

    tokens = request.data.data.tokens;

    return tokens;
  } catch (error) {
    console.error(
      "*********    Error retrieving top tokens on the " +
        name +
        " and UNISWAP protocols  ********* \n",
      error
    );
  }
};

const fetchKnownTokens = async () => {
  console.log("Getting list of tokens for applicable chains...");
  let topTokens = [];

  // Asign dexs to chains, in the future this could have more dexs with each chains deployment addresses
  let chains = UNISWAP;

  for (let i = 0; i < chains.length; i++) {
    let name = chains[i].name;
    let baseUrl = chains[i].v3.subgraph_base;
    let subgraphId = chains[i].v3.subgraph_id;

    // Request tokens from subgraph
    let tokens = await requestTopTokens(name, baseUrl, subgraphId);

    // Add tokens to topToken array
    topTokens = topTokens.concat(tokens);
  }

  // Write the the tokens to file for future use
  fs.writeFileSync(KNOWN_TOKENS_JSON, JSON.stringify(topTokens, null, 2));

  console.log("File was saved!");
};

fetchKnownTokens();
