const { expect, assert } = require("chai");
const { ethers , network } = require("hardhat");

const provider = waffle.provider;

// uniswapV3 factory and router addresses on Polygon mainnet
const uniV3_router_addr = '0xE592427A0AEce92De3Edee1F18E0157C05861564';   //  0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45 //0xE592427A0AEce92De3Edee1F18E0157C05861564
const uniV3_factory_addr = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

// sushiswap factory and router addresses  on Polygon mainnet
const sushi_router_addr = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506' ;
const sushi_factory_addr = '0xc35DADB65012eC5796536bD9864eD8773aBc74C4' ;

// token addresses on polygon mainnet 
const WMATIC_contract_addr = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
const USDC_contract_addr = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';



  // WMATIC WHALE_ADDRESS : https://polygonscan.com/address/0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827

const WMATIC_WHALE_WALLTET_ADDRESS = "0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245";

  const erc_abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}]



describe("EXECUTING UNIV3-SUSHI ARB FLASH SWAP ", () => {
  
  let signer;
  let signers;
  let accounts;
  let loanInitiator;
  let loanInitiatorAccountAddress;
  let wmatic_contract_instance;
  let usdc_contract_instance ;
  let wmatic_whale;
  let flash_contract;
  let sushi_swap_contract ;
  let uniV3_swap_contract ;
  let tx;
  let WMATIC_WHALE_WALLTET_ADDRESS_BALANCE ;
  let WMATIC_WHALE_WALLTET_ADDRESS_BALANCE_FRONTEND ;
  let WMATIC_LOAN_INITIATOR_WALLTET_ADDRESS_BALANCE_FRONTEND ;
  let amount ;
  let toFlashContractAmount ;


  before(async () => {


    signers = await ethers.getSigners(); 
    signer = signers[0];
    loanInitiatorAccountAddress = signers[1].address;
    loanInitiator = await ethers.getSigner(loanInitiatorAccountAddress); // this code line basically fetch the account pvt key which is 
                                                                         // what used to sign and send transaction


    //console.log('signer' , signer);
    //console.log('loanInitiator' , loanInitiator);

     console.log('loanInitiatorAccountAddress' , loanInitiatorAccountAddress);
    

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
 

   // Impersonating WMATIC WHALE external account address
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WMATIC_WHALE_WALLTET_ADDRESS],
    })

    wmatic_whale = await ethers.getSigner(WMATIC_WHALE_WALLTET_ADDRESS);
    //console.log('wmatic_whale' , wmatic_whale);

    // create WMATIC contract instance
    wmatic_contract_instance = new ethers.Contract(WMATIC_contract_addr, erc_abi, provider);
    //accounts = await ethers.getSigners();

   // create USDC contract instance
      usdc_contract_instance = new ethers.Contract(USDC_contract_addr, erc_abi, provider);
      accounts = await ethers.getSigners();

    // tag address for debugging purpose

    hre.tracer.nameTags[flash_contract.address] = "FLASH_CONTRACT_ADDRESS";
    hre.tracer.nameTags[sushi_swap_contract.address] = "SUSHISWAP_CONTRACT_ADDRESS";
    hre.tracer.nameTags[uniV3_swap_contract.address] = "UNISWAP_CONTRACT_ADDRESS";
    hre.tracer.nameTags[uniV3_router_addr] = "UNISWAPV3_ROUTER_CONTRACT_ADDRESS";
    hre.tracer.nameTags[loanInitiatorAccountAddress] = "LOAN_INITIATOR";
    hre.tracer.nameTags[WMATIC_WHALE_WALLTET_ADDRESS] = "EXTERNAL_WMATIC_WHALE_WALLET";
    hre.tracer.nameTags[signer] = "FLASH_LOAN_EXECUTER";
    hre.tracer.nameTags[WMATIC_contract_addr] = "WMATIC";
    hre.tracer.nameTags[USDC_contract_addr] = "USDC";

    // const trace = await hre.network.provider.send("debug_traceTransaction", [
    //   "0x123...",
    // ]);


 // First top up account-0 (signer) with 200 WMATIC 
 // or test with topping up with 200 MATIC to signer to make transaction


  amount = 200n * 10n ** 18n; 
  toFlashContractAmount = 100n * 10n ** 18n;

 // first check if the WHALE account from which we are hacking WMATIC does contains more than 200 WMATIC

 WMATIC_WHALE_WALLTET_ADDRESS_BALANCE = await wmatic_contract_instance.balanceOf(WMATIC_WHALE_WALLTET_ADDRESS);
 WMATIC_WHALE_WALLTET_ADDRESS_BALANCE_FRONTEND = Number(ethers.utils.formatUnits(WMATIC_WHALE_WALLTET_ADDRESS_BALANCE, 18));

 console.log("WMATIC balance of whale", WMATIC_WHALE_WALLTET_ADDRESS_BALANCE_FRONTEND);
 //expect(await wmatic_contract_instance.balanceOf(WMATIC_WHALE_WALLTET_ADDRESS)).to.gte(amount);

 // now transfering WMATIC from whale to one of the default hardhat account (accounts[1] ->loanInititor)


  const tx = await wmatic_contract_instance.connect(wmatic_whale).transfer(loanInitiatorAccountAddress, amount);
  WMATIC_LOAN_INITIATOR_WALLTET_ADDRESS_BALANCE_FRONTEND =  Number(ethers.utils.formatUnits((await wmatic_contract_instance.balanceOf(loanInitiatorAccountAddress))));
  const rc = await tx.wait();
  // console.log(rc)
  const event = rc.events.find(event => event.event === 'Transfer');
  console.log("Checking Events : ", event.args)
  const [src, dst, wad] = event.args;
    await new Promise(res => setTimeout(() => res(null), 30000));
  console.log(src, dst, wad.toString());

  console.log('Print and Verify loanInitiatorAccountAddress' , loanInitiatorAccountAddress);
  console.log("WMATIC balance of loanInitiatorAccountAddress:",WMATIC_LOAN_INITIATOR_WALLTET_ADDRESS_BALANCE_FRONTEND);

  //  expect(await wmatic_contract_instance.balanceOf(accounts[0].address)).to.gte(amount);

 //  transfer 100 WMATIC from external WHALE account to the flash contract so that it can pay for the fees to recover for the loss
 await wmatic_contract_instance.connect(wmatic_whale).transfer(flash_contract.address, toFlashContractAmount);
 console.log("Flash contract successfully topped up initially with WMATIC", Number(ethers.utils.formatUnits((await wmatic_contract_instance.balanceOf(flash_contract.address)),18)));
 
  });


  it.skip("unit test SUSHI Swap Contract" , async () => {
    
  // approve sushiswap Swap contract  to spend 10 WMATIC which will be needed to swap with USDC
  tx = await wmatic_contract_instance.connect(loanInitiator).approve(sushi_swap_contract.address, ethers.utils.parseEther('10'));
  await tx.wait();
  let allowanceCheck =await wmatic_contract_instance.connect(loanInitiator).allowance(loanInitiatorAccountAddress,sushi_swap_contract.address);
  console.log('allowance check',  Number(ethers.utils.formatUnits(allowanceCheck,18)));
  console.log('---------------SUSHISWAP Swap contract approval done successfully-------------------');
  
  console.log("Waiting for swap event...");

  tx = await sushi_swap_contract.connect(loanInitiator).placeTrade(WMATIC_contract_addr, USDC_contract_addr, ethers.utils.parseEther('10'));
  await tx.wait();

  sushi_swap_contract.on("Swap",(sender,amount0In,amount1In,amount0Out,amount1Out,to,event) => {
    
        console.log('Event Ouput',sender ,amount0In ,amount1In ,amount0Out,amount1Out ,to ,event);

  });


  // sushi_swap_contract.on("Swap",(from,to,value,event) => {
      
  //   let info = {
  //      from : from ,
  //      to : to ,
  //      value : ethers.utils.formatUnits(value ,18),
  //      event: event,
  //   };

  //   console.log(JSON.stringify(info,null,4));
  // });



  console.log('---------after Swapping WMATIC to USDC on SUSHISWAP swap contract by loanInitiatorAccountAddress ------------');
  console.log('after swapping updated loanInitiatorAccountAddress WMATIC balance' , Number(ethers.utils.formatUnits((await wmatic_contract_instance.balanceOf(loanInitiatorAccountAddress)),18)));
  console.log('after swapping updated loanInitiatorAccountAddress USDC balance', Number(ethers.utils.formatUnits((await usdc_contract_instance.balanceOf(loanInitiatorAccountAddress)),6)));

  console.log('--------SUSHI Swap done successfully-------------');
    
  });


  it("unit test UNI-V3 Swap Contract" , async () => {
   
  // approve uniV3 Swap contract  to spend 10 WMATIC which will be needed to swap with USDC
  tx = await wmatic_contract_instance.connect(loanInitiator).approve(uniV3_swap_contract.address, ethers.utils.parseEther('10'));
  await tx.wait();
  let allowanceCheck =await wmatic_contract_instance.connect(loanInitiator).allowance(loanInitiatorAccountAddress,uniV3_swap_contract.address);
  console.log('allowance check',  Number(ethers.utils.formatUnits(allowanceCheck,18)));
  console.log('---------------UNIV3 Swap contract approval done successfully-------------------');

   
  tx = await uniV3_swap_contract.connect(loanInitiator).swapTokenMax(WMATIC_contract_addr, USDC_contract_addr, ethers.utils.parseEther('10'));
  await tx.wait();
  // await new Promise(res => setTimeout(() => res(null), 30000));
  //console.log('tx' , tx);
  
  console.log('---------after Swapping WMATIC to USDC on UNIV3 swap contract by loanInitiatorAccountAddress ------------');
  console.log('after swapping updated loanInitiatorAccountAddress WMATIC balance' , Number(ethers.utils.formatUnits((await wmatic_contract_instance.balanceOf(loanInitiatorAccountAddress)),18)));
  console.log('after swapping updated loanInitiatorAccountAddress USDC balance', Number(ethers.utils.formatUnits((await usdc_contract_instance.balanceOf(loanInitiatorAccountAddress)),6)));

  console.log('--------uniV3 Swap done successfully-------------');

  });

 

  
  it.skip ("Execute the flash loan", async () => {
  
    console.log("-------Ensure Flash contract successfully topped up initially with WMATIC-------", Number(ethers.utils.formatUnits((await wmatic_contract_instance.balanceOf(flash_contract.address)),18)));
    console.log("WMATIC balance of loanInitiatorAccountAddress:",WMATIC_LOAN_INITIATOR_WALLTET_ADDRESS_BALANCE_FRONTEND);

     // FLASH SWAP 
  const flash_params = {
    token0: WMATIC_contract_addr,
    token1: USDC_contract_addr,
    fee1: 500, // flash from the 0.05% fee pool 
    amount0: ethers.utils.parseEther('100'), // flash borrow this much WMATIC  
    amount1: 0, // flash borrow 0 USDC
  }


 

          
 ////////////////////////////////////// Initiating Flash Loan ///////////////////////////////////////////////////////////////

  tx = await flash_contract.connect(loanInitiator).initFlash(flash_params);
  await tx.wait();

  //console.log('tx' , tx);

  });

  
});
