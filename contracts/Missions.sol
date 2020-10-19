pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/*
    A pool of spores that can be takens by Spore pools according to their spore rate
*/
contract Missions is Ownable, AccessControl {
    bytes32 public constant APPROVED_POOL_ROLE = keccak256("APPROVED_POOL_ROLE");

    IERC20 public sporeToken;

    event SporesHarvested(address pool, uint256 amount);

    constructor(IERC20 sporeToken_) public {
        sporeToken = sporeToken_;
        _setupRole(DEFAULT_ADMIN_ROLE, address(this));
    }

    modifier onlyApprovedPool() {
        require(hasRole(APPROVED_POOL_ROLE, msg.sender), "Mission: Only approved pools");
        _;
    }
    function takeSpores(uint256 amount) public onlyApprovedPool {
        sporeToken.transfer(msg.sender, amount);
    }

    function approvePool(address pool) public onlyOwner {
        grantRole(APPROVED_POOL_ROLE, pool);
    }

    function revokePool(address pool) public onlyOwner {
        revokeRole(APPROVED_POOL_ROLE, pool);
    }
}