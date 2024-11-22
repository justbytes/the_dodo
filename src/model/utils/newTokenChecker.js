const fs = require("fs");
const path = require("path");

const KNOWN_TOKENS_JSON = path.join(
  __dirname,
  "../../../data/known_tokens.json"
);
const KNOWN_TOKEN_DATA = fs.readFileSync(KNOWN_TOKENS_JSON);
const KNOWN_TOKENS = JSON.parse(KNOWN_TOKEN_DATA);

const checkIfTokenIsNew = (targetAddress) => {
  for (let i = 0; i < KNOWN_TOKENS.length; i++) {
    let knownAddress = KNOWN_TOKENS[i].id;

    if (targetAddress.toLowerCase() === knownAddress.toLowerCase()) {
      return false;
    }
  }
  return true;
};

module.exports = checkIfTokenIsNew;
