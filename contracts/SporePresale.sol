pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./SporeToken.sol";

contract SporePresale is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping (address => bool) public whitelist;
    mapping (address => uint) public ethSupply;
    uint public whitelistCount;
    address payable devAddress;
    uint public sporePrice = 5;
    uint public buyLimit = 3 * 1e18;
    bool public presaleStart = false;
    bool public onlyWhitelist = true;
    uint public presaleLastSupply = 30000 * 1e18;

    SporeToken private spore = SporeToken(0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544);

    event BuySporeSuccess(address account, uint ethAmount, uint sporeAmount);

    constructor(address payable account) public {
        devAddress = account;

        initWhitelist();
    }

    function addToWhitelist(address account) public onlyOwner {
        require(whitelist[account] == false, "This account is already in whitelist.");
        whitelist[account] = true;
        whitelistCount = whitelistCount + 1;
    }

    function removeFromWhitelist(address account) public onlyOwner {
        require(whitelist[account], "This account is not in whitelist.");
        whitelist[account] = false;
        whitelistCount = whitelistCount - 1;
    }

    function setDevAddress(address payable account) public onlyOwner {
        devAddress = account;
    }

    function startPresale() public onlyOwner {
        presaleStart = true;
    }

    function stopPresale() public onlyOwner {
        presaleStart = false;
    }

    function setSporePrice(uint newPrice) public onlyOwner {
        sporePrice = newPrice;
    }

    function setBuyLimit(uint newLimit) public onlyOwner {
        buyLimit = newLimit;
    }

    function changeToNotOnlyWhitelist() public onlyOwner {
        onlyWhitelist = false;
    }

    modifier needHaveLastSupply() {
        require(presaleLastSupply >= 0, "Oh you are so late.");
        _;
    }

    modifier presaleHasStarted() {
        require(presaleStart, "Presale has not been started.");
        _;
    }

    receive() payable external presaleHasStarted needHaveLastSupply {
        if (onlyWhitelist) {
            require(whitelist[msg.sender], "This time is only for people who are in whitelist.");
        }
        uint ethTotalAmount = ethSupply[msg.sender].add(msg.value);
        require(ethTotalAmount <= buyLimit, "Everyone should buy less than 3 eth.");
        uint sporeAmount = msg.value.mul(sporePrice);
        require(sporeAmount <= presaleLastSupply, "insufficient presale supply");
        presaleLastSupply = presaleLastSupply.sub(sporeAmount);
        spore.mint(msg.sender, sporeAmount);
        ethSupply[msg.sender] = ethTotalAmount;
        devAddress.transfer(msg.value);
        emit BuySporeSuccess(msg.sender, msg.value, sporeAmount);
    }

     function initWhitelist() internal {
        whitelist[0x3c5de42f02DebBaA235f7a28E4B992362FfeE0B6] = true;
       
    }
}