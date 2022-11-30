const { ethers } = require("hardhat");


async function main() {

   // deploy uniswapV3 (univ3Swap.sol) swap contracts 
   const uniV3_swap_factory = await ethers.getContractFactory("UniswapV3Swap", signer);
   uniV3_swap_contract = await uniV3_swap_factory.deploy(uniV3_router_addr);
   await uniV3_swap_contract.deployed();
   console.log('UNISWAPV3 SWAP CONTRACT DEPLOYED ADDRESS',uniV3_swap_contract.address);
 
   // deploy susshiswap (sushiswap.sol) swap contracts 
   const sushi_swap_factory = await ethers.getContractFactory("SushiSwapV2Swap", signer);
    sushi_swap_contract = await sushi_swap_factory.deploy();
   await sushi_swap_contract.deployed();
   console.log('SUSHISWAP SWAP CONTRACT DEPLOYED ADDRESS',sushi_swap_contract.address);
 
 
   // deploy flash contract -- reference swap contracts address 
   const flash_factory = await ethers.getContractFactory("PairFlash", signer);
   flash_contract = await flash_factory.deploy(uniV3_swap_contract.address, sushi_swap_contract.address ,uniV3_factory_addr, WMATIC_contract_addr);
   await flash_contract.deployed();
   console.log('FLASHSWAP ARB CONTRACT DEPLOYED ADDRESS',flash_contract.address);
 

};



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  


