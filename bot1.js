
// -- HANDLE INITIAL SETUP -- //
const { ethers } = require("ethers");
const fs = require("fs");
const Big = require('big.js');

require('./helpers/server');
require("dotenv").config();
//const config = require('../config.json');

const provider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN');
// const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");

 //const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/XDB9x2UJeeMhtalAgave4qQjeZbj3A1v');


// const provider = new ethers.providers.JsonRpcProvider( "https://eth-mainnet.g.alchemy.com/v2/MBLxgWSRshR3tBrsHeSzx3EGEaJL1scm");

const { ChainId, Token } = require("@uniswap/sdk");
const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');                      // try with ./abi
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");
const { abi: QuoterABI,} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");


const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const { getPoolImmutables, getPoolState } = require('./helpers/helpers.js');

const UNIV3_PoolAddress = "0xa374094527e1673a86de625aa59517c5de346d32";            // WMATIC-USDC pool on polygon mainnet
const UNIV3_SwapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";     
const UNIV3_QUOTER_ADDRESS = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";



const SUSHISWAP_FACTORY_ADDRESS =  "0xc35DADB65012eC5796536bD9864eD8773aBc74C4" ;  // on polygon
const SUSHISWAP_ROUTERV2_ADDRESS = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506" ;  // on polygon

const token0_address = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270" ;   // WMATIC on Polycon
const token1_address = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" ;   // USDC on Polygon

const token0_contract = new ethers.Contract(token0_address,IERC20.abi,provider);
const token1_contract = new ethers.Contract (token1_address,IERC20.abi,provider);

// const token0Contract = new web3.eth.Contract(IERC20.abi, _token0Address);
// const token1Contract = new web3.eth.Contract(IERC20.abi, _token1Address);


const sushi_factory_contract = new ethers.Contract (SUSHISWAP_FACTORY_ADDRESS ,IUniswapV2Factory.abi,provider);
const sushi_routerV2_contract = new ethers.Contract (SUSHISWAP_ROUTERV2_ADDRESS,IUniswapV2Router02.abi,provider);

 

const main = async () => {  


    
////////////////////////////////////////////////////UNISWAPV3-RELATED/////////////////////////////////////////////////////////////////////////////////////

const poolContract = new ethers.Contract(UNIV3_PoolAddress,IUniswapV3PoolABI, provider);
console.log('univ3_poolContract',poolContract.address);

const swapRouterontract = new ethers.Contract(UNIV3_SwapRouterAddress,SwapRouterABI,provider);
// console.log('swapRouterContract',swapRouterContract); 
// const immutables = await getPoolImmutables(poolContract);
// console.log('getUNIV3immutables',immutables);


///////////////////////////////////////////////////////// LISTENING UNIV3-SWAP EVENTS ///////////////////////////////////////////////////



poolContract.on("Swap",(sender,recipient,amount0,amount1,sqrtPriceX96,liquidity,tick, event) => {

  let info = {

    sender: sender,
    recipient: recipient,
    amount0: amount0,
    amount1: amount1,
    sqrtPriceX96: sqrtPriceX96,
    liquidity: liquidity,
    tick: tick,
    data: event,
  };


console.log(JSON.stringify(info));

    // if (info) {

    //   const ws = fs.createWriteStream('./lorem1.txt');
    //   rs.on('data' , (dataChunk) => { 
    //        ws.write(dataChunk);
    //      });

    // }

  });        


           // -------------------------- Saving the incoming Swap Events to the file -------------------------------------//

           
          //  const rs = fs.createReadStream('./files/lorem.txt',{encoding :'utf8'});
          //  const ws = fs.createWriteStream('./lorem1.txt');

          //  rs.on('data' , (dataChunk) => { 
          //    ws.write(dataChunk);
          //  });

         // fs.appendFile


         // Get the file contents before the append operation
// console.log("\nFile Contents of file before append:",
// fs.readFileSync("example_file.txt", "utf8"));

// fs.appendFile("example_file.txt", "World", (err) => {
// if (err) {
//   console.log(err);
// }
// else {
//   // Get the file contents after the append operation
//   console.log("\nFile Contents of file after append:",
//     fs.readFileSync("example_file.txt", "utf8"));



///////////////////////////////////////////SUSHISWAPV2-RELATED/////////////////////////////////////////////////////////////////////////////////////
    
     
const token0_sdk = new Token(
  137, 
 '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  18,
 //  await token0_contract.symbol(),
 //  await token0_contract.name()
  );
// console.log('token0_sdk' , token0_sdk);


const token1_sdk = new Token(
137, 
'0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
6,
//  await token0_contract.symbol(),               // error is comming while fetching symbol and name : did not get why error is coming
//  await token0_contract.name()
);
//console.log('token1_sdk' , token1_sdk);



///////////////////////////////////////////////////// SUSHISWAPV2 PRICE /////////////////////////////////////////////////////////////////



// Connect to SUSHI Router
const contractRouterSUSHI = new ethers.Contract(SUSHISWAP_ROUTERV2_ADDRESS, IUniswapV2Router02.abi, provider);

const amountInFrontend = "1";
const amountInsushi = ethers.utils.parseUnits(amountInFrontend, 18);
// Get amounts out // Fetching DAI Amount 
const amountsOutSUSHI = await contractRouterSUSHI.getAmountsOut(amountInsushi, [
token0_address,
token1_address,
]);




//   console.log('amountsOut' , amountsOut.toString());

// Convert amount out - human readable
const amountOutFrontendSUSHI_WETH_IN_DAI = ethers.utils.formatUnits(amountsOutSUSHI[1].toString(),6);

// Log output
console.log('SUSHI : DAI-USDC-MATIC-MAINNET', amountOutFrontendSUSHI_WETH_IN_DAI);













const sushipoolAddress = await sushi_factory_contract.getPair(token0_sdk.address, token1_sdk.address);
//console.log('sushipoolAddress', sushipoolAddress);


const sushipoolAddressContract = new ethers.Contract(sushipoolAddress,IUniswapV2Pair.abi, provider);
//console.log('sushipoolAddressContract' , sushipoolAddressContract);



// sushipoolAddressContract.on("Swap",(sender,amount0In,amount1In,amount0Out,amount1Out,to,event)=>{

//     let info = {

//       sender: sender,
//       amount0In: amount0In,
//       amount1In: amount1In,
//       amount0Out: amount0Out,
//       amount1Out: amount1Out,
//       to: to,
//       data: event,
//     };


//   console.log(JSON.stringify(info));

//   });        


//////////////////////////////////////////////////////////////////FETCH PRICES///////////////////////////////////////////////////////////



// uniswap



const amountIn = ethers.utils.parseUnits("1", 18);

const quoterContractUniV3Instance = new ethers.Contract(UNIV3_QUOTER_ADDRESS,QuoterABI,provider);
//console.log('DEBUG' , quoterContractUniV3Instance ) ; 

const quoteAmountOut = await quoterContractUniV3Instance.callStatic.quoteExactInputSingle(
token0_sdk.address,
token1_sdk.address,
3000,
amountIn.toString(),
0
);


const calculatePrice_uni = ethers.utils.formatUnits(quoteAmountOut.toString(),6);
console.log('calculatePrice_uni',calculatePrice_uni);



          
console.log('---------welcome_starknet---------');       
// console.log('token0',token0_contract);
// console.log('token0',token1_contract);
//console.log('SUSHISWAP_PAIR_CONTRACT', sushiswap_pair_contract );
console.log('sushi_factory_contract' ,sushi_factory_contract.address);
console.log('sushi_router_contract' ,sushi_routerV2_contract.address);
// console.log('token1_contract_address', ((token0_contract.address).toString()));
// console.log('token2_contract_address',  token1_contract.address);
//console.log('getPairAddressC',pairAddress);
    

}
    
  


  main();

