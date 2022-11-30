// https://docs.uniswap.org/protocol/reference/deployments
// https://docs.uniswap.org/sdk/guides/creating-a-trade

const { ethers } = require("ethers");

const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-mainnet.alchemyapi.io/v2/cQ2Bb9ZudvJZUA0TjgzVYUOHfgrkYpa8"
);

async function getPrice(addressFrom, addressTo, amountInHuman) {
  const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

  const quoterContract = new ethers.Contract(
    quoterAddress,
    QuoterABI,
    provider
  );

  const amountIn = ethers.utils.parseUnits(amountInHuman, 6);

  const quoteAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    addressFrom,
    addressTo,
    3000,
    amountIn.toString(),
    0
  );

  // Output the amount
  const amount = ethers.utils.formatUnits(quoteAmountOut.toString(), 18);
  return amount;
}

const main = async () => {
  const addressFrom = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
  const addressTo = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
  const amountInHuman = "2900";

  const amountOut = await getPrice(addressFrom, addressTo, amountInHuman);

  console.log(amountOut);

  let date = new Date().toLocaleDateString();
  let time = new Date().toLocaleTimeString();

  ws.addRow([SNo++, date, time, amountOut]);
  await wb.xlsx.writeFile(file);
};

const ExcelJS = require('exceljs');
const fs = require('fs');
const file = 'excel.xlsx';
const wb = new ExcelJS.Workbook();
let ws;
let SNo;

start()

async function start() {
  await prepareFile();
  main(); setInterval(main, 20000);
}

async function prepareFile() {
  if (fs.readFileSync(file).toString() == '') await createFreshSheet(ws);
  else {
    await wb.xlsx.readFile(file)
    ws = wb.getWorksheet('Sheet 1');
    ws.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      if (row.values.length == 0) { return; }
      SNo = rowNumber - 1;
    })
  }
}

async function createFreshSheet(ws) {
  ws = wb.addWorksheet("Sheet 1");
  ws.addRow(['SNo', 'Date', "Timestamp", 'UniV3 ETH-DAI Price'])
  SNo = 0;
  await wb.xlsx.writeFile(file);
}