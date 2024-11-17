const { ethers, AlchemyProvider, Interface } = require("ethers");

const verifyCode = async (provider, newTokenAddress, pairAddress) => {
  const tokenCode = await provider.getCode(newTokenAddress);
  console.log(
    `New token contract ${newTokenAddress}:`,
    tokenCode === "0x" ? "Not deployed" : "Deployed"
  );

  // Check pair address
  const pairCode = await provider.getCode(pairAddress);
  console.log(
    `Pair contract ${pairAddress}:`,
    pairCode === "0x" ? "Not created" : "Created"
  );

  // Return true if both contracts are deployed
  return tokenCode !== "0x" && pairCode !== "0x";
};

module.exports = verifyCode;
