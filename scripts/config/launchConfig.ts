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
    },
    {
        speciesName: "Madam Morel",
        speciesId: BN(1),
        strength: ETH("3"),
        costPerMushroom: ETH("4"),
        minLifespan: daysToSeconds(8),
        maxLifespan: daysToSeconds(10),
        cap: BN(860),
    },
    {
        speciesName: "Boisterous Bolete",
        speciesId: BN(2),
        strength: ETH("3.5"),
        costPerMushroom: ETH("12"),
        minLifespan: daysToSeconds(14),
        maxLifespan: daysToSeconds(28),
        cap: BN(660),
    },
    {
        speciesName: "Enoki",
        speciesId: BN(3),
        strength: ETH("8"),
        costPerMushroom: ETH("16"),
        minLifespan: daysToSeconds(28),
        maxLifespan: daysToSeconds(56),
        cap: BN(260),
    },
    {
        speciesName: "Awkward Ironwood",
        speciesId: BN(4),
        strength: ETH("12"),
        costPerMushroom: ETH("20"),
        minLifespan: daysToSeconds(28),
        maxLifespan: daysToSeconds(42),
        cap: BN(130),
    },
];

// Take mainnet assets from whales on local forked mainnet
export const WHALES = {};
WHALES["ETH"] = utils.getAddress("0x742d35cc6634c0532925a3b844bc454e4438f44e");

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
        // stakingStartTime: BN(1604167200), // 10/31/2020 @ 6:00pm (UTC)
        // votingStartTime: BN(1604167200).add(daysToSeconds(7)), // 10/31/2020 @ 6:00pm (UTC)
        stakingStartTime: BN(1604104277),
        votingStartTime: BN(1604104277).add(daysToSeconds(7)),
        voteDuration: daysToSeconds(7),
    },
    pools: [
        {
            assetName: "ETH",
            assetAddress: constants.AddressZero,
            initialSporesPerWeek: ETH("560"),
            mushroomSpecies: BN(0), // Scheming Amanita
        },
        {
            assetName: "UNI",
            assetAddress: addr("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"),
            initialSporesPerWeek: ETH("860"),
            mushroomSpecies: BN(1), // Madam Morel
        },
        {
            assetName: "DAI<>SPORE_Value_LP",
            assetAddress: addr("0x89a20e860359382007cff3efaa22f697941293ca"),
            initialSporesPerWeek: ETH("180"),
            mushroomSpecies: BN(2), // Boisterous Bolete
        },
        {
            assetName: "ENOKI<>ETH_Uni_LP",
            assetAddress: addr("0x284fa4627af7ad1580e68481d0f9fc7e5cf5cf77"),
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
