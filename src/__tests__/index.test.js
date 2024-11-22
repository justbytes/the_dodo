const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const dodoWebsocket = require("../app");
const { serializeDodo, deserializeDodo } = require("../utils/dodoCoder");

const ethConfigV2 = {
  id: uuidv4(),
  chainId: "1",
  newTokenAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
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

/**
 * Testing a DodoEgg instance on the ETH network
 */
describe("Send data to app.js", () => {
  //   const wss = dodoWebsocket();
  //   const app = new WebSocket("ws://127.0.0.1:8000");

  it("should create a new DodoEgg instance", () => {
    let data = {
      chainId: "1",
      newTokenAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
      baseTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      pairAddress: "0xA43fe16908251ee70EF74718545e4FE6C5cCEc9f",
      v3: false,
    };

    data = JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );

    console.log("data ", data);

    let dodoEgg = deserializeDodo(data);

    expect(dodoEgg.newTokenAddress).toEqual(ethConfigV2.newTokenAddress);
  });
});
