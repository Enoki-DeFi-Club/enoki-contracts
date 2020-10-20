import ethers, {BigNumber, utils} from "ethers";
import _ from "lodash";

export const daysToSeconds = (days: number): BigNumber => {
    const bnDays = BigNumber.from(days);
    const bnSeconds = BigNumber.from(86400);
    return bnDays.mul(bnSeconds);
};

export interface GeyserParams {
    maxUnlockSchedules: BigNumber;
    startBonus: BigNumber;
    bonusPeriodSec: BigNumber;
    initialSharesPerToken: BigNumber;
    maxStakesPerAddress: BigNumber;
    devRewardPercentage: BigNumber;
}

export interface LockSchedule {
    amount: BigNumber;
    durationSec: number;
}

export interface LockScheduleMap {
    [index: string]: LockSchedule[];
}

export interface LaunchConfig {
    externalContracts: any;
    geyserParams: GeyserParams;
    lpTokenVesting: {
        cliff: BigNumber;
        duration: BigNumber;
    };
    paymentSplitter: {
        share: BigNumber;
    };
    devFundEthVesting: {
        cliff: BigNumber;
        duration: BigNumber;
    };
    sporeDistribution: {
        presaleAmount: BigNumber;
        initialLiquidity: BigNumber;
        mission0: BigNumber;
    };
    enokiDistribution: {
        geyserAmount: BigNumber;
    };
    startingLiquidity: {
        spore: BigNumber;
        eth: BigNumber;
    };
    devMultisig: {
        address: string;
        owners: string[];
    };
}

// Take mainnet assets from whales on local forked mainnet
export const WHALES = {};
WHALES["ETH"] = utils.getAddress("0x742d35cc6634c0532925a3b844bc454e4438f44e");

const MAINNET = {
    externalContracts: {
        uniswapV2Router: utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"),
        uniswapV2Factory: utils.getAddress(
            "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
        ),
        enokiDaoAgent: utils.getAddress("0x37e52356b6602028c7e6cb2803ea0e024a621fd4"),
        enokiToken: utils.getAddress("0x886058deded1325a27697122512f618db590ea32"),
        gnosisProxyFactory: utils.getAddress(
            "0x76e2cfc1f5fa8f6a5b3fc4c8f4788f0116861f9b"
        ),
        weth: utils.getAddress("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    },
    paymentSplitter: {
        share: BigNumber.from("10000"),
    },
    lpTokenVesting: {
        cliff: BigNumber.from(0), // Immediate Cliff
        duration: daysToSeconds(720), // 24 Months
    },
    devFundEthVesting: {
        cliff: BigNumber.from(0), // Immediate Cliff
        duration: daysToSeconds(180), // 6 Months
    },
    sporeDistribution: {
        presaleAmount: utils.parseEther("15000"),
        initialLiquidity: utils.parseEther("5000"),
        mission0: utils.parseEther("210000"),
    },
    enokiDistribution: {
        geyserAmount: utils.parseEther("12600"),
    },
    geyserParams: {
        maxUnlockSchedules: BigNumber.from(10),
        startBonus: BigNumber.from(100),
        bonusPeriodSec: BigNumber.from(1),
        initialSharesPerToken: BigNumber.from("1000000"),
        maxStakesPerAddress: BigNumber.from(1000),
        devRewardPercentage: BigNumber.from(6),
    },
    startingLiquidity: {
        spore: utils.parseEther("5000"),
        eth: utils.parseEther("300"),
    },
    devMultisig: {
        address: utils.getAddress("0x4f8fDC5D03B21aE85c5E451efE454D6e550fF761"),
        owners: [
            utils.getAddress("0xe9673e2806305557Daa67E3207c123Af9F95F9d2"),
            utils.getAddress("0x482c741b0711624d1f462E56EE5D8f776d5970dC"),
            utils.getAddress("0xA2b3872C3D1e0a1c75A3bF3eF0214e2168a36713"),
            utils.getAddress("0xC66D67132bB439E7ec4383Db19110581a44DDc4a"),
            utils.getAddress("0x9005cA508d14b4173f7063884A8fF6DB7AF5eeCD"),
        ],
    },
} as LaunchConfig;

export const Configs = {
    MAINNET,
};
