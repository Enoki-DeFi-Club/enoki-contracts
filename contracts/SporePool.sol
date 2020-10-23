pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

/* 
    Releases spores at the given rate until exhausted
    is doubled or halved every 3,240 blocks (7 days at 20s a block) based on staked $ENOKI
*/
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts-ethereum-package/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-ethereum-package/utils/Pausable.sol";
import "@openzeppelin/contracts-ethereum-package/access/Ownable.sol";

import "./Defensible.sol";
import "./interfaces/IMushroomFactory.sol";
import "./interfaces/IMission.sol";
import "./SporeToken.sol";
import "./BannedContractList.sol";

contract SporePool is OwnableUpgradeSafe, ReentrancyGuardUpgradeSafe, PausableUpgradeSafe, Defensible {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    SporeToken public sporeToken;
    IERC20 public stakingToken;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 7 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    uint256 public constant MAX_PERCENTAGE = 100;
    uint256 public devRewardPercentage;
    address public devRewardAddress;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    IMushroomFactory public mushroomFactory;
    IMission public mission;
    BannedContractList public bannedContractList;

    uint256 public stakingEnabledTime;

    uint256 public votingEnabledTime;
    uint256 public nextVoteAllowedAt;
    uint256 public lastVoteNonce;
    uint256 public voteDuration;

    address public enokiDaoAgent;

    /* ========== CONSTRUCTOR ========== */

    function initialize(
        address _owner,
        address _sporeToken,
        address _stakingToken,
        address _mushroomFactory,
        address _mission,
        address _approvedContractList,
        address _devRewardAddress,
        address daoAgent_,
        uint256[5] memory uintParams
    ) public initializer {
        __Context_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();
        __Ownable_init_unchained();

        sporeToken = SporeToken(_sporeToken);
        stakingToken = IERC20(_stakingToken);
        mushroomFactory = IMushroomFactory(_mushroomFactory);
        mission = IMission(_mission);
        bannedContractList = BannedContractList(_approvedContractList);

        /*
        [0] uint256 _devRewardPercentage,
        [1] uint256 stakingEnabledTime_,
        [2] uint256 votingEnabledTime_,
        [3] uint256 voteDuration_,
        [4] uint256 initialRewardRate_,
        */

        rewardRate = uintParams[4];

        devRewardPercentage = uintParams[0];
        devRewardAddress = _devRewardAddress;

        stakingEnabledTime = uintParams[1];
        votingEnabledTime = uintParams[2];
        nextVoteAllowedAt = uintParams[2];
        voteDuration = uintParams[3];
        lastVoteNonce = 0;

        enokiDaoAgent = daoAgent_;
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored.add(lastTimeRewardApplicable().sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(_totalSupply));
    }

    function earned(address account) public view returns (uint256) {
        return _balances[account].mul(rewardPerToken().sub(userRewardPerTokenPaid[account])).div(1e18).add(rewards[account]);
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount) external nonReentrant defend(bannedContractList) whenNotPaused updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function harvest(uint256 mushroomsToGrow) public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];

        if (reward > 0) {
            uint256 remainingReward = reward;
            rewards[msg.sender] = 0;

            // Burn some rewards for mushrooms if desired
            if (mushroomsToGrow > 0) {
                uint256 totalCost = mushroomFactory.costPerMushroom().mul(mushroomsToGrow);
                require(reward >= totalCost, "Not enough rewards to grow the number of mushrooms specified");

                uint256 toDev = totalCost.mul(devRewardPercentage).div(MAX_PERCENTAGE);
                sporeToken.burn(totalCost.sub(toDev));

                if (toDev > 0) {
                    mission.sendSpores(devRewardAddress, toDev);
                }

                remainingReward = reward.sub(totalCost);
                mushroomFactory.growMushrooms(msg.sender, mushroomsToGrow);
            }

            if (remainingReward > 0) {
                // TODO: Add safe ERC20 features to spore token
                // sporeToken.safeTransfer(msg.sender, remainingReward);

                mission.sendSpores(msg.sender, remainingReward);
                emit RewardPaid(msg.sender, remainingReward);
            }
        }
    }

    function exit() external {
        withdraw(_balances[msg.sender]);
        harvest(0);
    }

    /*
        Votes with a given nonce invalidate other votes with the same nonce
        This ensures only one rate vote can pass for a given time period
    */

    function halveRate(uint256 voteNonce) public onlyDAO {
        require(now >= votingEnabledTime, "SporePool: Voting not enabled yet");
        require(now >= nextVoteAllowedAt, "SporePool: Previous rate change vote too soon");
        require(voteNonce == lastVoteNonce.add(1), "SporePool: Incorrect vote nonce");

        rewardRate = rewardRate.div(2);

        nextVoteAllowedAt = now.add(voteDuration);
        lastVoteNonce = voteNonce.add(1);
    }

    function doubleRate(uint256 voteNonce) public onlyDAO {
        require(now >= votingEnabledTime, "SporePool: Voting not enabled yet");
        require(now >= nextVoteAllowedAt, "SporePool: Previous rate change vote too soon");
        require(voteNonce == lastVoteNonce.add(1), "SporePool: Incorrect vote nonce");

        rewardRate = rewardRate.mul(2);

        nextVoteAllowedAt = now.add(voteDuration);
        lastVoteNonce = voteNonce.add(1);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        // Cannot recover the staking token or the rewards token
        require(tokenAddress != address(stakingToken) && tokenAddress != address(sporeToken), "Cannot withdraw the staking or rewards tokens");

        //TODO: Add safeTransfer
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(block.timestamp > periodFinish, "Previous rewards period must be complete before changing the duration for the new period");
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    modifier onlyDAO {
        require(msg.sender == enokiDaoAgent, "SporePool: Only Enoki DAO agent can call");
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
}
