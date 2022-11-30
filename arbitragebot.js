// -----------------------------------------HANDLE INITIAL SETUP -------------------------------------------------------------------//

const { ethers } = require("ethers");
const Big = require('big.js');

require("dotenv").config();
require('./helpers/server');

const { ChainId, Token } = require("@uniswap/sdk");

//--------------------------------------------- IMPORTING REQUIRED ADDRESS ----------------------------------------------------------//

const {FROM_TOKEN_ADDR, TO_TOKEN_ADDR, UNIV3_QUOTER_ADDRESS ,SUSHIV2_ROUTER_ADDRESS } = require('./helpers/addressList.js');

//-----------------------------------------IMPORTING REQUIRED ABIS-----------------------------------------------------------------//

const IERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json');   


const IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json");
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json');
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json");

const { abi: QuoterABI,} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');



//--------------------------------------------- SETTING UP PROVIDERS ----------------------------------------------------------------//

const provider = new ethers.providers.WebSocketProvider('wss://polygon-mainnet.g.alchemy.com/v2/dfXTO4nzaYhrW6P_Zp049yxjuCzEztKc');

//--------------------------------------------- DEFINING MAIN FUNCTION ----------------------------------------------------------//

const main = async () => {  
  
//----------------------------------------------- SETUP EVENT-LISTENER FOR POLYGON MAINNET BLOCK --------------------------------------//
    provider.on('block', async (blockNumber) => {
       console.log('blocknumber' , blockNumber);

// ----------------------------------------------- UNI-V3 FETCHING PRICE FROM DEFINED POOL ---------------------------------------------//

   
const uniV3_quoter_instance = new ethers.Contract( UNIV3_QUOTER_ADDRESS,QuoterABI,provider);
 console.log('DEBUG' , uniV3_quoter_instance ) ; 

   const token0_contract_instance = new ethers.Contract(ADDRESS_FROM_MATIC_POLY_MAIN, ERC20ABI.abi, provider);


    const decimals = await contractToken.decimals();

    //console.log('decimals' ,decimals);


const contractToken2 = new ethers.Contract(ADDRESS_TO_USDC_POLY_MAIN, ERC20ABI.abi, provider);
//const decimals2 = await contractToken2.decimals();

//console.log('decimals2' ,decimals2);



   

// ----------------------------------------------- SUSHI-V2 FETCHING PRICE FROM DEFINED POOL ---------------------------------------------//




    }).on('error', error => {
        console.log(error);
      });







};


//--------------------------------------------- CALLING MAIN FUNCTION ----------------------------------------------------------//

  main();
















