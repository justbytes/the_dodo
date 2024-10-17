module.exports = increaseByPercentage = (value, percentage) => {
  // Convert percentage to basis points (1% = 100 basis points)
  const basisPoints = BigInt(percentage * 100);

  // Perform the calculation
  const increase = (value * basisPoints) / BigInt(10000);
  const newValue = value + increase;

  return newValue;
};
