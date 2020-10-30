import {daysToSeconds, LaunchConfig} from "./config/launchConfig";
import {EnokiSystem} from "./systems/EnokiSystem";
import {BigNumber, utils} from "ethers";
import {expect} from "chai";
import { getCurrentTimestamp } from "./utils/timeUtils";

export async function confirmPools(enoki: EnokiSystem, config: LaunchConfig) {
    /*
        __EnokiGeyser__
        Verify basic params:
            startBonus
            bonusPeriodSec
            maxStakesPerAddress
            devRewardPercentage
            devRewardAddress
            admin
            bannedContractList
            mushroomMetadata

            totalLockedShares = 0
            totalStakingShares = 0
            totalStrengthStaked = 0

            isNftStakeable(mushroom) = true
            getDistributionToken() = ENOKI

            totalLocked = 0
            totalUnlocked = 0  
    */

    /*
        For each SporePool:
            sporeToken = Spore token address
            stakingToken = From config
            devRewardPercentage = 10%
            devRewardAddress = Founder multisig
            rewardRate = SPORE per second, based on config SPORE per week

            mushroomFactory = What it should be, based on object
            mission = Mission proxy contract
            bannedContractList = Banned contract proxy

            stakingEnabledTime = As config
            votingEnabledTime = As config
            nextVoteAllowedAt = 
            lastVoteNonce
            voteDuration
            enokiDaoAgent

            MAX_PERCENTAGE = 100
            decreaseRateMultiplier = 50
            increaseRateMultiplier = 150
        
        For the associated MushroomPool:
            sporeToken
            mushroomNft
            mushroomMetadata
                (These should all be the right addresses)

            costPerMushroom = as per config
            mySpecies = correct species as per config
            spawnCount = 0

            getRemainingMintableForMySpecies() should be the cap for that species
    */

    /*
        Mushroom NFT:
            For each launch species: 
                getSpecies() = for each species, make sure the data is right
                getRemainingMintableForSpecies() = cap
    */
}