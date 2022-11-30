const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { impersonateFundErc20 } = require("../utils/utilities");

const provider = waffle.provider;

describe("flashswaps for a loss lol", async function () {
  
  const signers = await ethers.getSigners(); 
  const signer = signers[0];
  
   // uniswapV3 factory and router addresses on Polygon mainnet
   const uniV3_router_addr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
   const uniV3_factory_addr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

   // sushiswap factory and router addresses  on Polygon mainnet
   const sushi_router_addr = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' ;
   const sushi_factory_addr = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' ;


  
  // token addresses on polygon mainnet 
  const WMATIC_contract_addr = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';

  const TOKEN_BORROWING = WMATIC_contract_addr ;


  // WMATIC WHALE_ADDRESS
  //https://polygonscan.com/address/0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827

  const WMATIC_WHALE_WALLTET_ADDRESS = "0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827";


  const DECIMALS = 18 ;
  
  // deploy uniswapV3 (univ3Swap.sol) swap contracts 
  const uniV3_swap_factory = await ethers.getContractFactory("UniswapV3Swap", signer);
  const uniV3_swap_contract = await uniV3_swap_factory.deploy(uniV3_router_addr);
  await uniV3_swap_contract.deployed();
  console.log('UNISWAPV3 SWAP CONTRACT DEPLOYED ADDRESS',uniV3_swap_contract.address,);

  // deploy susshiswap (sushiswap.sol) swap contracts 
  const sushi_swap_factory = await ethers.getContractFactory("SushiSwapV2Swap", signer);
  const sushi_swap_contract = await sushi_swap_factory.deploy();
  await sushi_swap_contract.deployed();
  console.log('SUSHISWAP SWAP CONTRACT DEPLOYED ADDRESS',sushi_swap_contract.address);


  // deploy flash contract -- reference swap contracts address 
  const flash_factory = await ethers.getContractFactory("PairFlash", signer);
  const flash_contract = await flash_factory.deploy(uniV3_swap_contract.address, sushi_swap_contract.address ,uniV3_factory_addr, WMATIC_contract_addr);
  await flash_contract.deployed();
  console.log('FLASHSWAP ARB CONTRACT DEPLOYED ADDRESS',flash_contract.address);


  // // get some WETH 
  // // check it out here: https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2#code
  
   const erc_abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]
   const WMATIC_contract = new ethers.Contract(WMATIC_contract_addr, erc_abi, signer);

  
   // Ensure that the WMATIC_WHALE actucally does hold lot of WMATIC in its wallet
   const wmatic_whale_balance = await WMATIC_contract.balanceOf(WMATIC_WHALE_WALLTET_ADDRESS);
   expect(wmatic_whale_balance).not.equal("0");

     // Configure our Borrowing
     const borrowAmountFrontEnd = "1";
     BORROW_AMOUNT = ethers.utils.parseUnits(borrowAmountFrontEnd, DECIMALS);
 
     // Configure Funding - FOR TESTING ONLY
     initialFundingHuman = "100";                                             // 100 WMATIC
     FUND_AMOUNT = ethers.utils.parseUnits(initialFundingHuman, DECIMALS);
 
     // Fund our Contract - FOR TESTING ONLY
    //  await impersonateFundErc20(
    //   TOKEN_BORROWING,
    //   WMATIC_WHALE_WALLTET_ADDRESS,
    //   signer,
    //   initialFundingHuman,
    //   DECIMALS
    //  );


     it("ensures that the signer is funded", async () => {
      // const wmatic_whale_balance = await WMATIC_contract.balanceOf(signer);
      // expect(wmatic_whale_balance).not.equal("0");
      console.log('signer address' , signer);
     });
  
  
});