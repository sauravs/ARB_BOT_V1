
const ethers = require("ethers");
const fs = require('fs');
const file = 'priceDataDEX_UNIV3_SUSHI.xlsx'

const {
  FACTORY_ADDRESS_UNISWAPV2,
  ROUTER_ADDRESS_UNISWAPV2,
  FACTORY_ADDRESS_SUSHISWAP,
  ROUTER_ADDRESS_SUSHISWAP,
  QUOTER_ADDRESS_UNISWAPV3, 
  ADDRESS_FROM_WETH_ETH_MAIN,
  ADDRESS_FROM_WETH_POLY_MAIN ,
  ADDRESS_TO_USDC_POLY_MAIN ,
  ADDRESS_TO_DAI_POLY_MAIN ,
  ADDRESS_FROM_DAI_POLY_MAIN,
  ADDRESS_FROM_MATIC_POLY_MAIN

} = require("../utils/AddressList");

const { erc20ABI, factoryABI, pairABI, routerABI } = require("../utils/AbiList");

const {
    abi: QuoterABI,
  } = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

// Standard Provider // use websocket for faster read

const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN');

// Ethereum Mainnet : wss://eth-mainnet.alchemyapi.io/v2/MBLxgWSRshR3tBrsHeSzx3EGEaJL1scm
// Polygon Mainnet : wss://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN
// Ankit Polygon Mainet : wss://polygon-mainnet.g.alchemy.com/v2/aD_yMtrs8PmN9OzbDomTyMNMB8o9vofv



// Connect to UNIV2 Factory
// const contractFactoryUNIV2 = new ethers.Contract(
//   FACTORY_ADDRESS_UNISWAPV2,
//   factoryABI,
//   provider
// );

// // Connect to UNIV2 Router
// const contractRouterUNIV2 = new ethers.Contract(ROUTER_ADDRESS_UNISWAPV2, routerABI, provider);



// Connect to SUSHI Factory
const contractFactorySUSHI = new ethers.Contract(
  FACTORY_ADDRESS_SUSHISWAP,
  factoryABI,
  provider
);

// Connect to SUSHI Router
const contractRouterSUSHI = new ethers.Contract(ROUTER_ADDRESS_SUSHISWAP, routerABI, provider);


// Storing Data in Excel Related

let SNo;
try {
  var data = fs.readFileSync(file).toString();    // if using 'let' -> error coming  
} catch (err) {
  fs.writeFileSync(file, 'SNo,Block No,Date,Timestamp,UniV3ETH-DAI , SushiETH-DAI');
  data = fs.readFileSync(file).toString();
  SNo = 0;
}
if (data == '') {
  data += 'SNo,Block No,Date,Timestamp,UniV3 ETH-DAI Price,SUSHISWAP';
  SNo = 0;
} else {

  console.log(data);
  var temp = data.replace(/\r/gm, '').split('\n');
  SNo = temp[temp.length-1].split(',')[0];
  SNo = parseInt(SNo);
}
if (SNo != SNo) SNo = 0;


// Call the Blockchain
const getPrices = async (amountInFrontend) => {


  provider.on('block', async (blockNumber) => {
    var DAI_found = false;
    var sushi_found = false;
    fs.writeFileSync(file, data)
    console.log('New Block: ' + blockNumber);
    var time = new Date().toLocaleTimeString()
    var date = new Date().toLocaleDateString()
    data += `\n${SNo},${blockNumber},${date},${time},`;
    SNo++;



    //////////////////////////////////////////////////////UNISWAP-V3///////////////////////////////////////////////////////////////

    const quoterContractUniV3Instance = new ethers.Contract(
        QUOTER_ADDRESS_UNISWAPV3,
        QuoterABI,
        provider
      );
      //console.log('DEBUG' , quoterContractUniV3Instance ) ; 

        // Convert the amount in  // Feeding 1 Unit of WETH
    const contractToken = new ethers.Contract(ADDRESS_FROM_MATIC_POLY_MAIN, erc20ABI, provider);



    const decimals = await contractToken.decimals();


    const contractToken2 = new ethers.Contract(ADDRESS_TO_USDC_POLY_MAIN, erc20ABI, provider);
    const decimals2 = await contractToken2.decimals();


      const amountIn = ethers.utils.parseUnits(amountInFrontend, decimals);

      const amountOutFrontendUNIV3WETH_IN_DAI = await quoterContractUniV3Instance.callStatic.quoteExactInputSingle(
        
        ADDRESS_FROM_MATIC_POLY_MAIN,
        ADDRESS_TO_USDC_POLY_MAIN,
    
       
   
        3000,
        amountIn.toString(),
        0
      );
    
      // Output the amount
      let amount = ethers.utils.formatUnits(amountOutFrontendUNIV3WETH_IN_DAI.toString(), (6/2));
      amount = amount /2 ; 

      //return amount; 

        // Log output
    if (!DAI_found) { DAI_found = true; data += `${Math.floor(parseFloat(amount) * 10000) / 10000},`; }
    console.log('UNI-V3 : DAI-USDC - POLYGON-MAINNET', amount);

           


    //////////////////////////////////////////////////////UNISWAP-V2///////////////////////////////////////////////////////////////

    // // Convert the amount in  // Feeding 1 Unit of WETH
    // const contractToken = new ethers.Contract(ADDRESS_FROM_WETH, erc20ABI, provider);
    // const decimals = await contractToken.decimals();
    // const amountIn = ethers.utils.parseUnits(amountInFrontend, decimals).toString();
    // //   console.log('amountIn' , amountIn);

    // // Get amounts out // Fetching DAI Amount 
    // const amountsOutUNIV2 = await contractRouterUNIV2.getAmountsOut(amountIn, [
    //   ADDRESS_FROM_WETH,
    //   ADDRESS_TO_DAI,
    // ]);

    //   console.log('amountsOut' , amountsOut.toString());

    // // Convert amount out - decimals
    // const contractToken2 = new ethers.Contract(ADDRESS_TO_DAI, erc20ABI, provider);
    // const decimals2 = await contractToken2.decimals();

    // Convert amount out - human readable
    // const amountOutFrontendUNIV2WETH_IN_DAI = ethers.utils.formatUnits(
    //   amountsOutUNIV2[1].toString(),
    //   decimals2
    // );

    // // Log output
    // if (!DAI_found) { DAI_found = true; data += `${Math.floor(parseFloat(amountOutFrontendUNIV2WETH_IN_DAI) * 10000) / 10000},`; }
    // console.log('UNI-V2 : WETH_IN_DAI', amountOutFrontendUNIV2WETH_IN_DAI);



    /////////////////////////////////////////////////SUSHISWAP///////////////////////////////////////////////////////////////////////


    // Get amounts out // Fetching DAI Amount 
    const amountsOutSUSHI = await contractRouterSUSHI.getAmountsOut(amountIn, [
      ADDRESS_FROM_MATIC_POLY_MAIN,
      ADDRESS_TO_USDC_POLY_MAIN,
    ]);

    //   console.log('amountsOut' , amountsOut.toString());

    // Convert amount out - human readable
    const amountOutFrontendSUSHI_WETH_IN_DAI = ethers.utils.formatUnits(
      amountsOutSUSHI[1].toString(),
      decimals2
    );

    // Log output
    console.log('SUSHI : DAI-USDC-MATIC-MAINNET', amountOutFrontendSUSHI_WETH_IN_DAI);
    if (!sushi_found) {
      sushi_found = true;
      data += `${Math.floor(parseFloat(amountOutFrontendSUSHI_WETH_IN_DAI) * 10000) / 10000}`;
    }

  })
    .on('error', error => {
      console.log(error);
    });

};

const amountInFrontend = "1";
getPrices(amountInFrontend);