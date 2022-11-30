//SPDX-License-Identifier: Unlicense
pragma solidity >=0.6.6;                                 

//import "hardhat/console.sol";
                                                                                           // Working
import "./libraries/UniswapV2Library.sol";
import  "./libraries/TransferHelper.sol";
 import "./interfaces/IUniswapV2Router01.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "./interfaces/IERC20.sol";



contract SushiSwapV2Swap {

  // Factory and Routing Addresses on Polygon Mainnet
  address public constant SUSHI_FACTORY = 0xc35DADB65012eC5796536bD9864eD8773aBc74C4;
  address public constant SUSHI_ROUTER =  0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506;

  // Token Addresses on Polygon Mainnet
    address public constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    // Trade Variables
    uint256 private deadline = block.timestamp + 1 days;
    // uint256 private minimumAmountRequired = 0 ;

  
   // PLACE A TRADE
    // Executed placing a trade
    function placeTrade(
        address _fromToken,
        address _toToken,
        uint256 _amountIn
    ) public returns (uint256) {
        address pair = IUniswapV2Factory(SUSHI_FACTORY).getPair(_fromToken, _toToken);
        require(pair != address(0), "Pool does not exist");

        // Calculate Amount Out
        address[] memory path = new address[](2);
        path[0] = _fromToken;
        path[1] = _toToken;

        uint256 amountRequired = IUniswapV2Router01(SUSHI_ROUTER).getAmountsOut(
            _amountIn,
            path
        )[1];

         console.log("amountRequired", amountRequired);

        // Transfer Token from Wallet to this contract

         IERC20(_fromToken).transferFrom(msg.sender, address(this), _amountIn);
         IERC20(_fromToken).approve(SUSHI_ROUTER, _amountIn);

        // Perform Arbitrage - Swap for another token
        uint256 amountReceived = IUniswapV2Router01(SUSHI_ROUTER)
            .swapExactTokensForTokens(
                _amountIn, // amountIn
                0, // amountOutMin
                path, // path
                msg.sender, // address to  // change this to 'msg.sender' if you want to receive ouput token in the wallet // address(this) if you want to receive output token in this contract
                deadline // deadline
            )[1];

         console.log("amountRecieved", amountReceived);

        //require(amountReceived > 0, "Aborted Tx: Trade returned zero");
         
          //IERC20(_fromToken).transferFrom(msg.sender, address(this), amountReceived);
        
        return amountReceived;
    }





}