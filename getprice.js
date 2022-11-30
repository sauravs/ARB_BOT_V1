const express = require("express")
const fs = require("fs")
const app = express()
require("dotenv").config()

const port = process.env.PORT || 4000

const axios = require("axios")

const ethers = require("ethers");

//const { erc20ABI, factoryABI, pairABI, routerABI } = require("../utils/AbiList");

const ERC20ABI = require('@openzeppelin/contracts/build/contracts/ERC20.json');          
const { abi: QuoterABI,} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");



const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN');

const QUOTER_ADDRESS_UNISWAPV3 = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const SUSHISWAP_ROUTERV2_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" ;  // on polygon

const outputArray = [];

//const date = new Date();



const ADDRESS_FROM_MATIC_POLY_MAIN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";    //wmatic
const ADDRESS_TO_USDC_POLY_MAIN    = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" ;   //usdc
const getPrices = async (amountInFrontend) => {
   
    let SNo = 0;

    provider.on('block', async (blockNumber) => {
 
  
  
      //////////////////////////////////////////////////////UNISWAP-V3///////////////////////////////////////////////////////////////
  
      const quoterContractUniV3Instance = new ethers.Contract( QUOTER_ADDRESS_UNISWAPV3,QuoterABI,provider);
      //console.log('DEBUG' , quoterContractUniV3Instance ) ; 
  
          // Convert the amount in  // Feeding 1 Unit of WETH
     
          const contractToken = new ethers.Contract(ADDRESS_FROM_MATIC_POLY_MAIN, ERC20ABI.abi, provider);
  
  
          const decimals = await contractToken.decimals();

          //console.log('decimals' ,decimals);
  
  
      const contractToken2 = new ethers.Contract(ADDRESS_TO_USDC_POLY_MAIN, ERC20ABI.abi, provider);
      //const decimals2 = await contractToken2.decimals();

      //console.log('decimals2' ,decimals2);

  
  
          const amountIn = ethers.utils.parseUnits(amountInFrontend, decimals);

         // console.log('amountIn' , (amountIn).toString());
  
     const amountOutFrontendUNIV3WETH_IN_DAI = await quoterContractUniV3Instance.callStatic.quoteExactInputSingle(                  
                   ADDRESS_FROM_MATIC_POLY_MAIN,
                   ADDRESS_TO_USDC_POLY_MAIN,
                   3000,
                   amountIn.toString(),
                   0
                  );
      
          // Output the amount
         let amount = ethers.utils.formatUnits(amountOutFrontendUNIV3WETH_IN_DAI.toString(), 6);
          
         console.log('UNI-V3 :10,000 - WMATIC-USDC - POLYGON-MAINNET', amount);

         let univ3amount = amount;

        //  return amount; 
    // ------------------------------------------------------SUSHISWAPV2 PRICE FETCH -------------------------------------------------------//
        
        // Connect to SUSHI Router
const contractRouterSUSHI = new ethers.Contract(SUSHISWAP_ROUTERV2_ADDRESS, IUniswapV2Router02.abi, provider);

const amountInsushi = ethers.utils.parseUnits(amountInFrontend, 18);
// Get amounts out // Fetching DAI Amount 
const amountsOutSUSHI = await contractRouterSUSHI.getAmountsOut(amountInsushi, [
    ADDRESS_FROM_MATIC_POLY_MAIN,
    ADDRESS_TO_USDC_POLY_MAIN,
]);


  //console.log('amountsOut' , amountsOutSUSHI.toString());

// Convert amount out - human readable
const amountOutFrontendSUSHI_WMATIC_IN_USDC = ethers.utils.formatUnits(amountsOutSUSHI[1].toString(),6);

// Log output
console.log('SUSHI : 10000-WMATIC-USDC-MATIC-MAINNET', amountOutFrontendSUSHI_WMATIC_IN_USDC);
 



const obj = {
    SNo: SNo +1,
    timestamp: new Date(Date.now()),
    pair: 'WMATIC-USDC',
    UNIV3_PRICE: univ3amount,
    SUSHIV2_PRICE: amountOutFrontendSUSHI_WMATIC_IN_USDC ,
  };
  
  outputArray.push(obj);
   //https://www.convertsimple.com/convert-javascript-array-to-csv/

   console.log("Wrote to file");
  });       

  };
  
  app.get("/", (req, res) => res.json(outputArray));
  
  app.listen(port, () => console.log("Listening On Port", port));

  const amountInFrontend = "10000";
  getPrices(amountInFrontend);