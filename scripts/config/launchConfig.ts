import ethers, {BigNumber, constants, utils} from "ethers";
import _ from "lodash";
import {addr, BN, ETH} from "../utils/shorthand";

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
    maxAirdropPool: BigNumber;
}

export interface PoolConfig {
    assetName: string;
    assetAddress: string;
    initialSporesPerWeek: BigNumber;
    mushroomSpecies: BigNumber;
}

export interface MushroomType {
    speciesName: string;
    speciesId: BigNumber;
    strength: BigNumber;
    costPerMushroom: BigNumber;
    minLifespan: BigNumber;
    maxLifespan: BigNumber;
    cap: BigNumber;
    ipfsUri: string;
}

export interface PoolsConfig {
    pools: PoolConfig[];
}

export interface LockSchedule {
    amount: BigNumber;
    durationSec: BigNumber;
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
    poolGlobals: {
        stakingStartTime: BigNumber;
        votingStartTime: BigNumber;
        voteDuration: BigNumber;
        enokiEnabledTime: BigNumber;
    };
    pools: PoolConfig[];
    species: MushroomConfig;
}

export type MushroomConfig = MushroomType[];

const mushroomConfig: MushroomConfig = [
    {
        speciesName: "Scheming Amanita",
        speciesId: BN(0),
        strength: ETH("2"), // Strength = Enoki yield per week
        costPerMushroom: ETH("5"),
        minLifespan: daysToSeconds(2),
        maxLifespan: daysToSeconds(6),
        cap: BN(1800),
        ipfsUri: "QmcJB2WthsPWEDUZkU74XW2ebeCTohDL2iYWnjUp7SX6sh",
    },
    {
        speciesName: "Madam Morel",
        speciesId: BN(1),
        strength: ETH("3"),
        costPerMushroom: ETH("4"),
        minLifespan: daysToSeconds(8),
        maxLifespan: daysToSeconds(10),
        cap: BN(860),
        ipfsUri: "QmVXQb4FgF6vL6wDjuVwzgqtXAWHs8UHgSvr4jfxmbEg4D",
    },
    {
        speciesName: "Boisterous Bolete",
        speciesId: BN(2),
        strength: ETH("3.5"),
        costPerMushroom: ETH("8"),
        minLifespan: daysToSeconds(4),
        maxLifespan: daysToSeconds(8),
        cap: BN(660),
        ipfsUri: "QmRKUuddtWQUiPKgYTZ96zoKP85BdQYKvKjWv6Eu5eSx6t",
    },
    {
        speciesName: "Enoki",
        speciesId: BN(3),
        strength: ETH("10"),
        costPerMushroom: ETH("12"),
        minLifespan: daysToSeconds(8),
        maxLifespan: daysToSeconds(16),
        cap: BN(420),
        ipfsUri: "QmVhZKpg2TSCQv5JfbdWEa6jFxjsXCV2vtD9s4UTChDM4v",
    },
    {
        speciesName: "Awkward Ironwood",
        speciesId: BN(4),
        strength: ETH("6"),
        costPerMushroom: ETH("14"),
        minLifespan: daysToSeconds(12),
        maxLifespan: daysToSeconds(18),
        cap: BN(260),
        ipfsUri: "QmVhZKpg2TSCQv5JfbdWEa6jFxjsXCV2vtD9s4UTChDM4a",
    },
];

// Take mainnet assets from whales on local forked mainnet
export const WHALES = {};
WHALES["ETH"] = utils.getAddress("0x742d35cc6634c0532925a3b844bc454e4438f44e");
WHALES["UNI"] = utils.getAddress("0x9f41cecc435101045ea9f41d4ee8c5353f77e5d5");
WHALES["SPORE<>ETH_Uni_LP"] = utils.getAddress(
    "0x632a84dc35a1e43b8196b2d08630dc9e6a1f3692"
);

export const WHALE_AMOUNT = {};
WHALE_AMOUNT["ETH"] = ETH("10000");
WHALE_AMOUNT["UNI"] = ETH("1000000");
WHALE_AMOUNT["SPORE<>ETH_Uni_LP"] = ETH("200");

const MAINNET = {
    externalContracts: {
        uniswapV2Router: utils.getAddress("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"),
        uniswapV2Factory: utils.getAddress(
            "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
        ),
        uniswapPairs: {
            sporeEth: "0x3eb9833bbea994287a2227e3feba0d3dc5d99f05",
        },
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
        maxAirdropPool: ETH("300")
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
    poolGlobals: {
        // TODO: Reset to real values
        stakingStartTime: BN(1604253600), // 10/31/2020 @ 6:00pm (UTC)
        votingStartTime: BN(1604253600).add(daysToSeconds(7)), // 10/31/2020 @ 6:00pm (UTC)
        voteDuration: daysToSeconds(7),
        enokiEnabledTime: BN(1604347200) // 11/2/2020 @ 6:00pm (UTC)
    },
    pools: [
        {
            assetName: "ETH",
            assetAddress: constants.AddressZero,
            initialSporesPerWeek: ETH("280"),
            mushroomSpecies: BN(0), // Scheming Amanita
        },
        {
            assetName: "FARM",
            assetAddress: addr("0xa0246c9032bc3a600820415ae600c6388619a14d"),
            initialSporesPerWeek: ETH("360"),
            mushroomSpecies: BN(1), // Madam Morel
        },
        {
            assetName: "SPORE",
            assetAddress: addr("0xa4Bad5d040d4464EC5CE130987731F2f428c9307"),
            initialSporesPerWeek: ETH("860"),
            mushroomSpecies: BN(2), // Boisterous Bolete
        },
        {
            assetName: "ENOKI<>ETH_Uni_LP",
            assetAddress: addr("0x284fa4627AF7Ad1580e68481D0f9Fc7e5Cf5Cf77"),
            initialSporesPerWeek: ETH("1660"),
            mushroomSpecies: BN(3), // Enoki
        },
        {
            assetName: "SPORE<>ETH_Uni_LP",
            assetAddress: addr("0x3eb9833bbea994287a2227e3feba0d3dc5d99f05"),
            initialSporesPerWeek: ETH("2160"),
            mushroomSpecies: BN(4), // Awkward Ironwood
        },
    ],
    species: mushroomConfig,
} as LaunchConfig;

export const Configs = {
    MAINNET,
};
