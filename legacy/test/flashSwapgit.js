const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { impersonateFundErc20 } = require("../utils/utilities");



it("flashswaps for a loss lol", async function () {
  
  const signers = await ethers.getSigners(); 
  const signer = signers[0];
  
   // uniswapV3 factory and router addresses on Polygon mainnet
   const uniV3_router_addr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
   const uniV3_factory_addr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

   // sushiswap factory and router addresses  on Polygon mainnet
   const sushi_router_addr = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' ;
   const sushi_factory_addr = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' ;


  
  // token addresses 
  const WMATIC_addr = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  const USDC_addr = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

  // WMATIC WHALE_ADDRESS
  //https://polygonscan.com/address/0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827

  const WMATIC_WHALE = "0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827";
  
  // deploy uniswapV3 (univ3Swap.sol) swap contracts 
  const uniV3_swap_factory = await ethers.getContractFactory("UniswapV3Swap", signer);
  const uniV3_swap_contract = await uniV3_swap_factory.deploy(uniV3_router_addr);
  await uniV3_swap_contract.deployed();
  console.log('UNISWAPV3 SWAP CONTRACT DEPLOYED ADDRESS',uniV3_swap_contract.address,);

  // deploy susshiswap (sushiswap.sol) swap contracts 
  const sushi_swap_factory = await ethers.getContractFactory("SushiSwapV2Swap", signer);
  const sushi_swap_contract = await sushi_swap_factory.deploy(sushi_factory_addr);
  await sushi_swap_contract.deployed();
  console.log('SUSHISWAP SWAP CONTRACT DEPLOYED ADDRESS',sushi_swap_contract.address);


  // deploy flash contract -- reference swap contracts address 
  const flash_factory = await ethers.getContractFactory("PairFlash", signer);
  const flash_contract = await flash_factory.deploy(uniV3_swap_contract.address, sushi_swap_contract.address ,uniV3_factory_addr, WMATIC_addr);
  await flash_contract.deployed();
  console.log('FLASHSWAP ARB CONTRACT DEPLOYED ADDRESS',flash_contract.address);


  // get some WETH 
  // check it out here: https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2#code
  
  const erc_abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]
  const WMATIC_contract = new ethers.Contract(WMATIC_addr, erc_abi, signer)
  
  // Ensure that the WMATIC_WHALE has a balance
  const whale_balance = await provider.getBalance(WMATIC_WHALE);
  expect(whale_balance).not.equal("0");
  
  
  
  // impersonate WMATIC WHALE account using hardhat
  
  



  
  
  // convert ETH to WETH
  const overrides = {
    value: ethers.utils.parseEther('200'),
    gasLimit: ethers.utils.hexlify(50000), 
  }
  let tx = await WETH_contract.deposit(overrides)
  await tx.wait() 

  // get some DAI 
  // approve swaper to spend 2 WETH
  tx = await WETH_contract.approve(swap_contract.address, ethers.utils.parseEther('2'))
  await tx.wait()
  // swap 2 WETH -> _ DAI 
  tx = await swap_contract.swapTokenMax(WETH_addr, DAI_addr, ethers.utils.parseEther('2'));
  await tx.wait()
  
  const DAI_contract = new ethers.Contract(DAI_addr, erc_abi, signer)
  const balance_before = ethers.utils.formatEther((await DAI_contract.balanceOf(signer.address)))
  // transfer 100 DAI to contract so that it can pay for the fees (bc we flash for a loss lol)
  // extra $$ (after fees) will be payed back 
  tx = await DAI_contract.transfer(flash_contract.address, ethers.utils.parseEther('1000'))
  await tx.wait()
  
  // FLASH SWAP 
  const flash_params = {
    token0: DAI_addr,
    token1: WETH_addr,
    fee1: 500, // flash from the 0.05% fee pool 
    amount0: ethers.utils.parseEther('1000'), // flash borrow this much DAI
    amount1: 0, // flash borrow 0 WETH
  }
  tx = await flash_contract.initFlash(flash_params);
  await tx.wait();  

  // 1 ether = 1 * 10^18 wei 
  console.log('flash gas ether: ', tx.gasPrice.toNumber() / 1e18)

  const balance_after = ethers.utils.formatEther((await DAI_contract.balanceOf(signer.address)))
  console.log('Total Flash Change in Balance: %s DAI', Number(balance_before) - Number(balance_after));
});