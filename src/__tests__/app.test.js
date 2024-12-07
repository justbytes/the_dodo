const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const dodoWebsocket = require("../app");
const { deserializeDodo } = require("../utils/dodoCoder");
const Audit = require("../controller/audit/index");

jest.setTimeout(1800000); // 1800 seconds

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
describe("Creates a DodoEgg instance", () => {
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

    let dodoEgg = deserializeDodo(data);

    expect(dodoEgg.newTokenAddress).toEqual(ethConfigV2.newTokenAddress);
  });

  it("should pass the audit", async () => {
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

    let dodoEgg = deserializeDodo(data);

    const audit = await Audit(dodoEgg.chainId, dodoEgg.baseTokenAddress);
    console.log(audit);
    expect(audit.success).toEqual(true);
  });
});
