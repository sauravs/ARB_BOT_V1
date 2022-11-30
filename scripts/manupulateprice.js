
//const { ethers } = require('ethers');
const { ethers , network } = require("hardhat");
//require('./helpers/server');
const { abi: IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const { abi: SwapRouterABI} = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json');
const { getPoolImmutables, getPoolState } = require('../helpers/helpers.js');
const ERC20ABI = require( '../helpers/erc20ABI.json');
require('dotenv').config();


// const INFURA_URL_TESTNET = process.env.INFURA_URL_TESTNET ;
// const WALLET_ADDRESS = process.env.WALLET_ADDRESS ;
// const WALLET_SECRET = process.env.WALLET_SECRET ;


const WALLET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" ;
const WALLET_SECRET =  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";


const chainId = 137;
//const provider = new ethers.providers.getDefaultProvider("http://127.0.0.1:8545/");
 const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545/");
 //const provider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.g.alchemy.com/v2/zF-EZv66IP0tcXh9wNv4s6VmxSmW9RMN');


const UNIV3_PoolAddress = "0xa374094527e1673a86de625aa59517c5de346d32";            // WMATIC-USDC pool on polygon mainnet
const UNIV3_swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";


// WMATIC WHALE_ADDRESS : https://polygonscan.com/address/0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245

const WMATIC_WHALE_WALLTET_ADDRESS = "0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245";


const name0 = 'Wrapped MATIC'
const symbol0 = 'WMATIC'
const decimals0 = 18
const token0_address = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"     // WMATIC on Polycon

const name1 = 'USDC Token'
const symbol1 = 'USDC'
const decimals1 = 6
const token1_address = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"      // USDC on Polygon



async function main() {


  signers = await ethers.getSigners(); 
  signer = signers[0];
  loanInitiatorAccountAddress = signers[0].address;
  loanInitiator = await ethers.getSigner(loanInitiatorAccountAddress);
  
  

  //const impersonatedSigner = await ethers.getImpersonatedSigner(WMATIC_WHALE_WALLTET_ADDRESS);
  //await impersonatedSigner.sendTransaction();



 // Impersonating WMATIC WHALE external account address
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [WMATIC_WHALE_WALLTET_ADDRESS],
  });

   
  wmatic_whale = await ethers.getSigner(WMATIC_WHALE_WALLTET_ADDRESS);
  console.log('wmatic_whale' , wmatic_whale);


  // First top up account-0 (signer) with 200 WMATIC 
 // or test with topping up with 200 MATIC to signer to make transaction

 const amount = 200n * 10n ** 18n; 


 // creating erc20-wmatic contract instance

 const wmatic_contract_instance =  new ethers.Contract(token0_address,ERC20ABI,provider);
 //console.log('wmatic_contract_instance',wmatic_contract_instance);

const name = await wmatic_contract_instance.name();
//console.log('name', name);

const block = await provider.getBlockNumber();
console.log('block', block) ;

 // first check if the WHALE account from which we are hacking WMATIC does contains more than 200 WMATIC

const WMATIC_WHALE_WALLTET_ADDRESS_BALANCE = await wmatic_contract_instance.balanceOf(WMATIC_WHALE_WALLTET_ADDRESS);
const WMATIC_WHALE_WALLTET_ADDRESS_BALANCE_FRONTEND = Number(ethers.utils.formatUnits(WMATIC_WHALE_WALLTET_ADDRESS_BALANCE, 18));

console.log("WMATIC balance of whale", WMATIC_WHALE_WALLTET_ADDRESS_BALANCE_FRONTEND);


// // now transfering WMATIC from whale to one of the default hardhat account (accounts[1] ->loanInititor)


await wmatic_contract_instance.connect(wmatic_whale).transfer(loanInitiatorAccountAddress, amount);
WMATIC_LOAN_INITIATOR_WALLTET_ADDRESS_BALANCE_FRONTEND =  Number(ethers.utils.formatUnits((await wmatic_contract_instance.balanceOf(loanInitiatorAccountAddress))));


console.log('Print and Verify loanInitiatorAccountAddress' , loanInitiatorAccountAddress);
console.log("WMATIC balance of loanInitiatorAccountAddress:",WMATIC_LOAN_INITIATOR_WALLTET_ADDRESS_BALANCE_FRONTEND);



  // const poolContract = new ethers.Contract( UNIV3_PoolAddress, IUniswapV3PoolABI, provider);

  // const immutables = await getPoolImmutables(poolContract);
  // const state = await getPoolState(poolContract);

  // const wallet = new ethers.Wallet(WALLET_SECRET);
  // const connectedWallet = wallet.connect(provider);

  // const swapRouterContract = new ethers.Contract(UNIV3_swapRouterAddress,SwapRouterABI,provider);

  // const inputAmount = 0.001
  
  // const amountIn = ethers.utils.parseUnits(inputAmount.toString(), decimals0);

  // const approvalAmount = (amountIn * 100000).toString();

  // const tokenContract0 = new ethers.Contract(token0_address, ERC20ABI, provider);

  // const approvalResponse = await tokenContract0.connect(connectedWallet).approve(UNIV3_swapRouterAddress,approvalAmount);

  // const params = {
  //   tokenIn: immutables.token0,
  //   tokenOut: immutables.token1,
  //   fee: immutables.fee,
  //   recipient: WALLET_ADDRESS,
  //   deadline: Math.floor(Date.now() / 1000) + (60 * 10),
  //   amountIn: amountIn,
  //   amountOutMinimum: 0,
  //   sqrtPriceLimitX96: 0,
  // }

  // const transaction = swapRouterContract.connect(connectedWallet).exactInputSingle(
  //   params,
  //   {
  //     gasLimit: ethers.utils.hexlify(1000000)
  //   }
  // ).then(transaction => {
  //   console.log(transaction)
  // })
};

main()













