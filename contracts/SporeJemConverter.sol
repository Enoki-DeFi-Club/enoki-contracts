// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/math/Math.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

import "./OnlyEOA.sol";
import "./interfaces/ISporeToken.sol";

/*
    Convert SPORE -> JEM at a fixed rate
    1e18 = 1 spore per jem
    2e18 = 2 spore per jem
    5e17 = .5 spore per jem
*/
contract SporeJemIncubator is
    OnlyEOA,
    OwnableUpgradeSafe,
    ReentrancyGuardUpgradeSafe,
    PausableUpgradeSafe
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    ISporeToken public sporeToken;
    IERC20 public jemToken;
    uint256 public sporePerJem;

    uint256 public constant MAX_PERCENTAGE = 100;

    /* ========== CONSTRUCTOR ========== */

    function initialize(
        address _sporeToken,
        address _jemToken,
        uint256 _sporePerJem
    ) public virtual initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
        __Ownable_init_unchained();

        sporeToken = ISporeToken(_sporeToken);
        jemToken = IERC20(_jemToken);

        emit SporePerJemChanged(_sporePerJem);
    }

    // Transfer SPORE from sender and return JEM at configured exchange rate
    function swap(uint256 sporeAmount) external whenNotPaused onlyEOA nonReentrant {
        uint256 jemAmount = sporeAmount.mul(1 ether).div(sporePerJem);
        sporeToken.transferFrom(msg.sender, address(this), sporeAmount);
        jemToken.transfer(msg.sender, jemAmount);
        emit Converted(msg.sender, sporeAmount, jemAmount);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(address tokenAddress, uint256 tokenAmount)
        external
        onlyOwner
        whenPaused
    {
        //TODO: Add safeTransfer
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setSporePerJem(uint256 _sporePerJem) external onlyOwner whenPaused {
        sporePerJem = _sporePerJem;
        emit SporePerJemChanged(_sporePerJem);
    }

    /* ========== EVENTS ========== */

    event Converted(
        address indexed user,
        uint256 sporeAmount,
        uint256 jemAmount
    );
    event Recovered(address token, uint256 amount);
    event SporePerJemChanged(uint256 newRate);
}
