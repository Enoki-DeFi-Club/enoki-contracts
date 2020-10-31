pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";

import "./SporePool.sol";

/*
    ETH Variant of SporePool
*/
contract SporePoolEth is SporePool {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== CONSTRUCTOR ========== */

    function initialize(
        address _sporeToken,
        address _stakingToken,
        address _mushroomFactory,
        address _mission,
        address _bannedContractList,
        address _devRewardAddress,
        address daoAgent_,
        uint256[5] memory uintParams
    ) public override initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
        __Ownable_init_unchained();

        sporeToken = ISporeToken(_sporeToken);
        mushroomFactory = IMushroomFactory(_mushroomFactory);
        mission = IMission(_mission);
        bannedContractList = BannedContractList(_bannedContractList);

        decreaseRateMultiplier = 50;
        increaseRateMultiplier = 150;

        /*
            [0] uint256 _devRewardPercentage,
            [1] uint256 stakingEnabledTime_,
            [2] uint256 votingEnabledTime_,
            [3] uint256 voteDuration_,
            [4] uint256 initialRewardRate_,
        */

        sporesPerSecond = uintParams[4];

        devRewardPercentage = uintParams[0];
        devRewardAddress = _devRewardAddress;

        stakingEnabledTime = uintParams[1];
        votingEnabledTime = uintParams[2];
        nextVoteAllowedAt = uintParams[2];
        voteDuration = uintParams[3];
        lastVoteNonce = 0;

        enokiDaoAgent = daoAgent_;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */
    function stake(uint256 amount) external override nonReentrant defend(bannedContractList) whenNotPaused updateReward(msg.sender) {
        revert("Use stakeEth function for ETH variant");
    }

    function stakeEth(uint256 amount) external payable nonReentrant defend(bannedContractList) whenNotPaused updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        require(msg.value == amount, "Incorrect ETH transfer amount");
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public override nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        msg.sender.transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }
}
