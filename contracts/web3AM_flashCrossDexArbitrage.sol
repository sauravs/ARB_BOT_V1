// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity =0.7.6;
pragma abicoder v2;

import "hardhat/console.sol";
import { UniswapV3Swap } from "./web3AM_univ3Swap.sol";
import { SushiSwapV2Swap } from "./web3AM_sushiswap.sol";

import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol";
import "@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol";

import "@uniswap/v3-periphery/contracts/base/PeripheryPayments.sol";
import "@uniswap/v3-periphery/contracts/base/PeripheryImmutableState.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";
import "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



/* ----------------------------------------------------Defining Structs----------------------------------------------------------- */

/*
@param token0 : first token out from pool 
@param token1 : second token out from pool
@param fee1   : fee value of the pool
@param amount0 : amount needed for token0
@param amount1 : amount needed for token1
*/

struct FlashParams {
    address token0;
    address token1;
    uint24 fee1;
    uint256 amount0;
    uint256 amount1;
}

/*
@param amount0 : amount needed for token0
@param amount1 : amount needed for token1
@param payer  :  the pool from which we are borrowing loan
@param poolkey : unique pool identifier
*/


struct FlashCallbackData {
    uint256 amount0;
    uint256 amount1;
    address payer;
    PoolAddress.PoolKey poolKey;
}

/* ----------------------------------------------------Contract Definition Start----------------------------------------------------------- */


contract WEB3AM_FlashCrossDexArbitrage is IUniswapV3FlashCallback, PeripheryImmutableState, PeripheryPayments , Ownable {
    
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for int256;


 /* ----------------------------------------------------State Variable Definition----------------------------------------------------------- */


    address private constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;          // USDC contract address on polygon mainnet
    address private constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;        // WMATIC contract address on polygon mainnet
    address private constant WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;          // WETH contract address on polygon mainnet
    
    address public profitCollector = 0x283D5EF5145fe40B4E12d9eBff01C45B78c51848;         // wallet address where profit will be sent

     /*
        external wallet address who have following rights
        - will be deployer of this contract
        - have rights to top-up this contract for fee
        - have rights to update profit collecter address
     */


    address public admin;                                           


  /* ------------------------------------------------------------Modifiers---------------------------------------------------------------------------- */


    modifier onlyAdmin () {
    require(msg.sender == admin ,"Not Admin");
     _;

    }

  
    /* ------------------------------------------------------------External Function - updateAdmin---------------------------------------------------------------------------- */

    /*
    @param _walletaddrs : address of external wallet you want to make admin
   */

    function updateAdmin (address _walletaddrs) external onlyAdmin {
        require(_walletaddrs != address(0) , "invalid Address");
        admin = _walletaddrs ;

    }


 /* ------------------------------------------------------------External Function - updateProfitCollector---------------------------------------------------------------------------- */

    /*
    @param _walletaddrs : address of external wallet you want to make profit collector
   */

    function updateProfitCollector (address _walletaddrs) external onlyAdmin {
        require(_walletaddrs != address(0) , "invalid Address");
        profitCollector = _walletaddrs ;

    }

    /* ------------------------------------------------------------Initiating swap contracts---------------------------------------------------------------------------- */

    
    UniswapV3Swap public immutable univ3swaper; 
    SushiSwapV2Swap public immutable sushiswaper; 
     /* ----------------------------------------------------Defining Constructor----------------------------------------------------------- */


    constructor(
        UniswapV3Swap _swapAddress,
        SushiSwapV2Swap _sushiswapAddress,
        address _factory,
        address _WETH9
    ) PeripheryImmutableState(_factory, _WETH9) {
        univ3swaper = _swapAddress;
        sushiswaper = _sushiswapAddress ;
        admin = msg.sender;
    }
    
    
 /* ----------------------------------------------------Private Function : transfer_wrapper_sushi ----------------------------------------------------------- */
      
      
    /*
    This is sushiswap utility function created for the purpose of swapping tokens on sushiswap
    @param token1 : address of first token to swap with
    @param token2 : address of second token to swap to
    @param amount_swap : amount of token to swap with
   */  

     function transfer_wrapper_sushi(address token1, address token2, uint amount_swap) private returns (uint amount_out){
        TransferHelper.safeApprove(token1, address(sushiswaper), amount_swap); // approve swaper to spend token 
        amount_out = sushiswaper.placeTrade(token1, token2, amount_swap); // swap between tokens with uniswap 
    }
 
 /* ----------------------------------------------------Private Function :transfer_wrapper_uniV3 ----------------------------------------------------------- */


     /*
    This is uniswap utility function created for the purpose of swapping tokens on uniswap
    @param token1 : address of first token to swap with
    @param token2 : address of second token to swap to
    @param amount_swap : amount of token to swap with
   */  

    function transfer_wrapper_uniV3(address token1, address token2, uint amount_swap) private returns (uint amount_out){
        TransferHelper.safeApprove(token1, address(univ3swaper), amount_swap); // approve swaper to spend token 
        amount_out = univ3swaper.swapTokenMax(token1, token2, amount_swap); // swap between tokens with uniswap 
    }


  
 
    /// @param fee0 The fee from calling flash for token0
    /// @param fee1 The fee from calling flash for token1
    /// @param data The data needed in the callback passed as FlashCallbackData from `initFlash`
    /// @notice implements the callback called from flash
    /// @dev fails if the flash is not profitable, meaning the amountOut from the flash is less than the amount borrowed

/* ----------------------------------------------------External Function - uniswapV3FlashCallback----------------------------------------------------------- */

    /*
    This is uniswapV3 Flash Call Back Function
    @param fee0 : fee structure of the pool we are borrowing from
    @param fee1 : fee structure of the second pool for swap ,we are not using this in this case
    @param data : other flash information we want to send 
   */  

    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external override {
        FlashCallbackData memory decoded = abi.decode(data, (FlashCallbackData));
        CallbackValidation.verifyCallback(factory, decoded.poolKey);

        address token0 = decoded.poolKey.token0; // WMATIC 
        address token1 = decoded.poolKey.token1; // USDC 

        console.log("--- flash swap start ---");
        log_balances();

        uint amount_swap = decoded.amount0; // flash swap amount WMATIC

        
        console.log("--- amount of WMATIC to be swapped with USDC on UNISWAPV3 ---");
        console.log('Amount of %s WMATIC' , amount_swap);

    
        // WMATIC -> USDC   //pool-> WMATIC/USDC  (0.3%)
        
       uint swap_out = transfer_wrapper_uniV3(WMATIC,USDC, amount_swap);     
        console.log("--- after WMATIC ->USDC swap on UNISWAPV3 (BUYING USDC on UNISWAPV3) ---");
        log_balances();
            
        // USDC -> WMATIC (sushi)
        
        swap_out = transfer_wrapper_sushi(USDC, WMATIC,swap_out);
        console.log("--- after USDC -> WMATIC swap on SUSHISWAP (SELLING USDC on SUSHISWAP)---");
        log_balances();

        // compute amount to pay back to pool 
        // (amount loaned) + fee
        uint256 amount0Owed = LowGasSafeMath.add(decoded.amount0, fee0);
        uint256 amount1Owed = LowGasSafeMath.add(decoded.amount1, fee1);

        // pay back pool the loan 
        // note: msg.sender == pool to pay back 
        if (amount0Owed > 0) pay(token0, address(this), msg.sender, amount0Owed);
        if (amount1Owed > 0) pay(token1, address(this), msg.sender, amount1Owed);
    }

  

    /* ----------------------------------------------------External Function -initFlash ----------------------------------------------------------- */


    /*
    This is the function to execute the Flash Loan
    @param params :The parameters necessary for flash and the callback, passed in as FlashParams
    @notice Calls the pools flash function with data needed in `uniswapV3FlashCallback`
    */

    function initFlash(FlashParams memory params) external {
        PoolAddress.PoolKey memory poolKey =
        PoolAddress.PoolKey({token0: params.token0, token1: params.token1, fee: params.fee1});
        IUniswapV3Pool pool = IUniswapV3Pool(PoolAddress.computeAddress(factory, poolKey));

        console.log("--- init balances ---");
        log_balances();

        // recipient of borrowed amounts (should be (this) contract)
        // amount of token0 requested to borrow
        // amount of token1 requested to borrow
        // callback data encoded 
        pool.flash(
            address(this),
            params.amount0,
            params.amount1,
            abi.encode(
                FlashCallbackData({
                    amount0: params.amount0,
                    amount1: params.amount1,
                    payer: msg.sender,
                    poolKey: poolKey
                })
            )
        );

        console.log("------------------balance of contract after executing the flash ---------------------------------");
        log_balances();
        console.log("FLASH_LOAN_EXECUTION_TIME" ,block.timestamp);
        console.log("---------------------------------------------------------------------------------------------------");

  
        // send the rest of the balance back to the profitCollector         
        IERC20(WMATIC).transfer(profitCollector, (IERC20(WMATIC).balanceOf(address(this))));
        IERC20(USDC).transfer(profitCollector, IERC20(USDC).balanceOf(address(this)));

        console.log("--- empty contract ---");
        log_balances();

        console.log("flash success!");
    }

    

   /* ---------------------------------------------------- External Function-------------------------------------------------------------------------------*/
    
      /* Function to transfer WMATIC from external account to this contract for the puropose of paying pool and transaction fee
       @params amount : Number of tokens you want to transfer to this contract address

       @note get approval from msg.sender first to this contract externally
      */
     
     function transferTokenForFee(uint amount) external onlyAdmin  {
       IERC20(WMATIC).transferFrom(msg.sender,address(this), amount);
    }
    
    
     /* ----------------------------------------------------External Function----------------------------------------------------------- */

      /* Function to transfer WMATIC from this contract address  to Owner's account
       @params amount : Number of tokens you want to transfer to owner's account
      */
     
      function withdrawTokenOfFee(uint amount)external onlyOwner {
       IERC20(WMATIC).transfer(msg.sender, amount);
 
    }
    
   
      /* ----------------------------------------------------External Function-------------------------------------------------------- */
     
       /* Function to check ERC20 balance hold by this contract
        @params address : address of the ERC-20 token against which you want to check balance of
      */
     
       function getBalanceOfToken(address _address) public view returns (uint256) {
        return IERC20(_address).balanceOf(address(this));
    }


    /* ----------------------------------------------------Payabale Function-------------------------------------------------------- */
         
   /*
    @note:sendMaticViaCall() is created incase if this contract need native blockchain currency to execute transactions
   */  
        
    function sendMaticViaCall(address payable _to) public payable {
        // Call returns a boolean value indicating success or failure.
        // This is the current recommended method to use.
        (bool sent, bytes memory data) = _to.call{value: msg.value}("");
        require(sent, "Failed to send MATIC");
    }



    // Fallback function is called when msg.data is not empty
    fallback() external payable {}



     /* ----------------------------------------------------Public Function-------------------------------------------------------- */
    function getNativeCurrencyBalance() public view returns (uint) {
        return address(this).balance;
    }


    /* ----------------------------------------------------Utility Function--------------------------------------------------------------------- */

    function log_balances() view private {
        uint balance_wmatic = IERC20(WMATIC).balanceOf(address(this));
        uint balance_usdc = IERC20(USDC).balanceOf(address(this));
        // WMATIC is in scale 1 * 10^18 wei = 1 ether
        // USDC is in scale 1 * 10^6
        // since solidity doesn't print floats we must hack >:)
        console.log("WMATIC: %s.%s", balance_wmatic / 1e18, balance_wmatic - (balance_wmatic / 1e18) * 1e18); 
        console.log("USDC: %s.%s", balance_usdc / 1e6, balance_usdc - (balance_usdc / 1e6) * 1e6);
    }
}