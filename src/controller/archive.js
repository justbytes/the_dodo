const fs = require("fs");
const path = require("path");

const ACTIVE_DODO_EGGS_JSON = path.join(
  __dirname,
  "../../data/active_dodo_eggs.json"
);

const saveDodoEggs = (dodoEggData) => {
  const rawData = fs.readFileSync(ACTIVE_DODO_EGGS_JSON, "utf8");
  const data = JSON.parse(rawData);
  console.log(data);

  let dodoEggs = [...data.active_dodo_eggs];
  // Add the new egg data to the array
  dodoEggs.push(dodoEggData);

  // Convert the updated array back to a JSON string
  const updatedData = JSON.stringify({ active_dodo_eggs: dodoEggs }, null, 2);

  // Write the updated data back to the file
  fs.writeFileSync(ACTIVE_DODO_EGGS_JSON, updatedData);
};

const loadDodoEggs = () => {};

module.exports = { saveDodoEggs, loadDodoEggs };
