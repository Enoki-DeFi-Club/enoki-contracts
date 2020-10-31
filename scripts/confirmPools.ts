import {daysToSeconds, LaunchConfig} from "./config/launchConfig";
import {EnokiSystem} from "./systems/EnokiSystem";
import {BigNumber, utils} from "ethers";
import {expect} from "chai";
import {getCurrentTimestamp} from "./utils/timeUtils";
import {BN} from "./utils/shorthand";

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

    expect(
        await enoki.enokiGeyserProxy.startBonus(),
        "enoki.enokiGeyserProxy.startBonus()"
    ).to.be.equal(BN(100));

    expect(
        await enoki.enokiGeyserProxy.bonusPeriodSec(),
        "enoki.enokiGeyserProxy.bonusPeriodSec()"
    ).to.be.equal(BN(1));

    expect(
        await enoki.enokiGeyserProxy.maxStakesPerAddress(),
        "enoki.enokiGeyserProxy.maxStakesPerAddress()"
    ).to.be.equal(enoki.config.geyserParams.maxStakesPerAddress);

    expect(
        await enoki.enokiGeyserProxy.devRewardPercentage(),
        "enoki.enokiGeyserProxy.devRewardPercentage()"
    ).to.be.equal(BN(6));

    expect(
        await enoki.enokiGeyserProxy.devRewardAddress(),
        "enoki.enokiGeyserProxy.devRewardAddress()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    expect(
        await enoki.enokiGeyserProxy.admin(),
        "enoki.enokiGeyserProxy.admin()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    expect(
        await enoki.enokiGeyserProxy.bannedContractList(),
        "enoki.enokiGeyserProxy.bannedContractList()"
    ).to.be.equal(enoki.bannedContractProxy.address);

    expect(
        await enoki.enokiGeyserProxy.mushroomMetadata(),
        "enoki.enokiGeyserProxy.mushroomMetadata()"
    ).to.be.equal(enoki.mushroomMetadataProxy.address);

    expect(
        await enoki.enokiGeyserProxy.totalLockedShares(),
        "enoki.enokiGeyserProxy.totalLockedShares()"
    ).to.be.equal(BN(0));

    expect(
        await enoki.enokiGeyserProxy.totalStakingShares(),
        "enoki.enokiGeyserProxy.totalStakingShares()"
    ).to.be.equal(BN(0));

    expect(
        await enoki.enokiGeyserProxy.totalStrengthStaked(),
        "enoki.enokiGeyserProxy.totalStrengthStaked()"
    ).to.be.equal(BN(0));

    expect(
        await enoki.enokiGeyserProxy.isNftStakeable(enoki.mushroomNftProxy.address),
        "enoki.enokiGeyserProxy.isNftStakeable(mushroomNFT)"
    ).to.be.equal(true);

    expect(
        await enoki.enokiGeyserProxy.isNftStakeable(enoki.mushroomNftLogic.address),
        "enoki.enokiGeyserProxy.isNftStakeable(mushroomNFT)"
    ).to.be.equal(false);

    expect(
        await enoki.enokiGeyserProxy.getDistributionToken(),
        "enoki.enokiGeyserProxy.getDistributionToken()"
    ).to.be.equal(enoki.enokiToken.address);

    expect(
        await enoki.enokiGeyserProxy.totalLocked(),
        "enoki.enokiGeyserProxy.totalLocked()"
    ).to.be.equal(BN(0));

    expect(
        await enoki.enokiGeyserProxy.totalUnlocked(),
        "enoki.enokiGeyserProxy.totalUnlocked()"
    ).to.be.equal(BN(0));

    console.log(`Enoky Geyser Confirmation Complete`);

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

    for (const poolEntry of enoki.missionPools) {
        const sporePool = poolEntry.sporePool;
        const mushroomFactory = poolEntry.mushroomFactory;

        const poolConfig = enoki.config.pools.find(
            (pool) => pool.assetAddress === poolEntry.assetAddress
        );

        if (!poolConfig) {
            throw new Error(
                `Pool config for ${poolEntry.assetName} ${poolEntry.assetAddress} not found`
            );
        }

        const speciesData = enoki.getSpeciesDataById(poolConfig.mushroomSpecies);

        expect(await sporePool.sporeToken(), "sporePool.sporeToken()").to.be.equal(
            enoki.sporeToken.address
        );

        expect(await sporePool.stakingToken(), "sporePool.stakingToken()").to.be.equal(
            poolEntry.assetAddress
        );

        expect(
            await sporePool.devRewardPercentage(),
            "sporePool.devRewardPercentage()"
        ).to.be.equal(BN(10));

        expect(
            await sporePool.devRewardAddress(),
            "sporePool.devRewardAddress()"
        ).to.be.equal(enoki.devMultisig.ethersContract.address);

        expect(
            await sporePool.sporesPerSecond(),
            "sporePool.sporesPerSecond()"
        ).to.be.equal(poolConfig.initialSporesPerWeek.div(daysToSeconds(7)));

        expect(
            await sporePool.mushroomFactory(),
            "sporePool.mushroomFactory()"
        ).to.be.equal(poolEntry.mushroomFactory.address);

        expect(await sporePool.mission(), "sporePool.mission()").to.be.equal(
            enoki.missionsProxy.address
        );

        expect(
            await sporePool.bannedContractList(),
            "sporePool.bannedContractList()"
        ).to.be.equal(enoki.bannedContractList.address);

        expect(
            await sporePool.stakingEnabledTime(),
            "sporePool.stakingEnabledTime()"
        ).to.be.equal(enoki.config.poolGlobals.stakingStartTime);

        expect(
            await sporePool.votingEnabledTime(),
            "sporePool.votingEnabledTime()"
        ).to.be.equal(enoki.config.poolGlobals.votingStartTime);

        expect(
            await sporePool.nextVoteAllowedAt(),
            "sporePool.nextVoteAllowedAt()"
        ).to.be.equal(enoki.config.poolGlobals.votingStartTime);

        expect(
            await sporePool.lastVoteNonce(),
            "sporePool.lastVoteNonce()"
        ).to.be.equal(BN(0));

        expect(await sporePool.voteDuration(), "sporePool.voteDuration()").to.be.equal(
            enoki.config.poolGlobals.voteDuration
        );

        expect(
            await sporePool.enokiDaoAgent(),
            "sporePool.enokiDaoAgent()"
        ).to.be.equal(enoki.enokiDaoAgent.address);

        expect(
            await sporePool.MAX_PERCENTAGE(),
            "sporePool.MAX_PERCENTAGE()"
        ).to.be.equal(BN(100));

        expect(
            await sporePool.decreaseRateMultiplier(),
            "sporePool.decreaseRateMultiplier()"
        ).to.be.equal(BN(50));

        expect(
            await sporePool.increaseRateMultiplier(),
            "sporePool.increaseRateMultiplier()"
        ).to.be.equal(BN(150));

        console.log(`Spore Pool Confirmation for ${poolConfig.assetName} Complete`);


        /*

                    sporeToken
            mushroomNft
            mushroomMetadata
                (These should all be the right addresses)

            costPerMushroom = as per config
            mySpecies = correct species as per config
            spawnCount = 0

            getRemainingMintableForMySpecies() should be the cap for that species

        */

        expect(
            await mushroomFactory.sporeToken(),
            "mushroomFactory.sporeToken()"
        ).to.be.equal(enoki.sporeToken.address);

        expect(
            await mushroomFactory.mushroomNft(),
            "mushroomFactory.mushroomNft()"
        ).to.be.equal(enoki.mushroomNftProxy.address);

        expect(
            await mushroomFactory.mushroomMetadata(),
            "mushroomFactory.mushroomMetadata()"
        ).to.be.equal(enoki.mushroomMetadataProxy.address);

        expect(
            await mushroomFactory.costPerMushroom(),
            "mushroomFactory.costPerMushroom()"
        ).to.be.equal(speciesData.costPerMushroom);

        expect(
            await mushroomFactory.mySpecies(),
            "mushroomFactory.mySpecies()"
        ).to.be.equal(poolConfig.mushroomSpecies);

        expect(
            await mushroomFactory.spawnCount(),
            "mushroomFactory.spawnCount()"
        ).to.be.equal(BN(0));

        expect(
            await mushroomFactory.getRemainingMintableForMySpecies(),
            "mushroomFactory.getRemainingMintableForMySpecies()"
        ).to.be.equal(speciesData.cap);

        console.log(`Mushroom Factory Confirmation for ${poolConfig.assetName} Complete`);

    }

    console.log(`Pool Confirmation Complete`);

    /*
        Mushroom NFT:
            For each launch species: 
                getSpecies() = for each species, make sure the data is right
                getRemainingMintableForSpecies() = cap
    */

    const speciesData = await enoki.mushroomNftProxy.getSpecies(BN(0));
    const remainingMintable = await enoki.mushroomNftProxy.getRemainingMintableForSpecies(BN(0));

    console.log("Alright here's the species", speciesData, remainingMintable.toString());

    /*
        MushroomMetadata:
        hasMetadataResolver(mushroomResolver) = true
        hasMetadataResolver(random address) = false
        owner = dev multisig
    */

    expect(
        await enoki.mushroomMetadataProxy.getMetadataResolver(
            enoki.mushroomNftProxy.address
        ),
        "mushroomMetadataProxy.getMetadataResolver(mushroomResolver)"
    ).to.be.equal(enoki.mushroomResolverProxy.address);

    expect(
        await enoki.mushroomMetadataProxy.hasMetadataResolver(
            enoki.mushroomNftProxy.address
        ),
        "mushroomMetadataProxy.getMetadataResolver(mushroomResolver)"
    ).to.be.equal(true);

    expect(
        await enoki.mushroomMetadataProxy.hasMetadataResolver(
            enoki.mushroomResolverLogic.address
        ),
        "mushroomMetadataProxy.getMetadataResolver(random address)"
    ).to.be.equal(false);

    expect(
        await enoki.mushroomMetadataProxy.owner(),
        "mushroomMetadataProxy.owner()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    /*
        MushroomResolver:
        hasMetadataResolver(mushroomResolver) = true
        hasMetadataResolver(random address) = false
        owner = dev multisig
    */

    expect(
        await enoki.mushroomResolverProxy.owner(),
        "mushroomResolverProxy.owner()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    console.log(`Mushroom Metadata Infra Complete`);
}
