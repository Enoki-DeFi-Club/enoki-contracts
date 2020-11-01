import {daysToSeconds, LaunchConfig} from "./config/launchConfig";
import {
    DEFAULT_ADMIN_ROLE,
    EnokiSystem,
    LIFESPAN_MODIFIER_ROLE,
    LIFESPAN_MODIFY_REQUEST_ROLE,
    MINTER_ROLE,
} from "./systems/EnokiSystem";
import {BigNumber, utils} from "ethers";
import {expect} from "chai";
import {getCurrentTimestamp} from "./utils/timeUtils";
import {BN, ETH} from "./utils/shorthand";

export async function confirmPools(enoki: EnokiSystem, testmode: boolean) {
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
            metadataResolver

            totalLockedShares = 0
            totalStakingShares = 0
            totalStrengthStaked = 0

            isNftStakeable(mushroom) = true
            getDistributionToken() = ENOKI

            totalLocked = 0
            totalUnlocked = 0  
    */
    if (testmode) {
        // expect(
        //     await enoki.enokiGeyserProxy.startBonus(),
        //     "enoki.enokiGeyserProxy.startBonus()"
        // ).to.be.equal(BN(100));
        // expect(
        //     await enoki.enokiGeyserProxy.bonusPeriodSec(),
        //     "enoki.enokiGeyserProxy.bonusPeriodSec()"
        // ).to.be.equal(BN(1));
        // expect(
        //     await enoki.enokiGeyserProxy.maxStakesPerAddress(),
        //     "enoki.enokiGeyserProxy.maxStakesPerAddress()"
        // ).to.be.equal(enoki.config.geyserParams.maxStakesPerAddress);
        // expect(
        //     await enoki.enokiGeyserProxy.devRewardPercentage(),
        //     "enoki.enokiGeyserProxy.devRewardPercentage()"
        // ).to.be.equal(BN(6));
        // expect(
        //     await enoki.enokiGeyserProxy.devRewardAddress(),
        //     "enoki.enokiGeyserProxy.devRewardAddress()"
        // ).to.be.equal(enoki.devMultisig.ethersContract.address);
        // expect(
        //     await enoki.enokiGeyserProxy.admin(),
        //     "enoki.enokiGeyserProxy.admin()"
        // ).to.be.equal(enoki.devMultisig.ethersContract.address);
        // expect(
        //     await enoki.enokiGeyserProxy.bannedContractList(),
        //     "enoki.enokiGeyserProxy.bannedContractList()"
        // ).to.be.equal(enoki.bannedContractProxy.address);
        // expect(
        //     await enoki.enokiGeyserProxy.metadataResolver(),
        //     "enoki.enokiGeyserProxy.metadataResolver()"
        // ).to.be.equal(enoki.metadataResolverProxy.address);
        // if (testmode) {
        //     expect(
        //         await enoki.enokiGeyserProxy.totalLockedShares(),
        //         "enoki.enokiGeyserProxy.totalLockedShares()"
        //     ).to.be.equal(ETH("1000000000")); // Amount * 10**6
        // } else {
        //     expect(
        //         await enoki.enokiGeyserProxy.totalLockedShares(),
        //         "enoki.enokiGeyserProxy.totalLockedShares()"
        //     ).to.be.equal(BN(0));
        // }
        // expect(
        //     await enoki.enokiGeyserProxy.totalStakingShares(),
        //     "enoki.enokiGeyserProxy.totalStakingShares()"
        // ).to.be.equal(BN(0));
        // expect(
        //     await enoki.enokiGeyserProxy.totalStrengthStaked(),
        //     "enoki.enokiGeyserProxy.totalStrengthStaked()"
        // ).to.be.equal(BN(0));
        // expect(
        //     await enoki.enokiGeyserProxy.isNftStakeable(enoki.mushroomNftProxy.address),
        //     "enoki.enokiGeyserProxy.isNftStakeable(mushroomNFT)"
        // ).to.be.equal(true);
        // expect(
        //     await enoki.enokiGeyserProxy.isNftStakeable(enoki.mushroomNftLogic.address),
        //     "enoki.enokiGeyserProxy.isNftStakeable(mushroomNFT)"
        // ).to.be.equal(false);
        // expect(
        //     await enoki.enokiGeyserProxy.getDistributionToken(),
        //     "enoki.enokiGeyserProxy.getDistributionToken()"
        // ).to.be.equal(enoki.enokiToken.address);
        // if (testmode) {
        //     expect(
        //         await enoki.enokiGeyserProxy.totalLocked(),
        //         "enoki.enokiGeyserProxy.totalLocked()"
        //     ).to.be.equal(ETH("1000"));
        // } else {
        //     expect(
        //         await enoki.enokiGeyserProxy.totalLocked(),
        //         "enoki.enokiGeyserProxy.totalLocked()"
        //     ).to.be.equal(BN(0));
        // }
        // expect(
        //     await enoki.enokiGeyserProxy.totalUnlocked(),
        //     "enoki.enokiGeyserProxy.totalUnlocked()"
        // ).to.be.equal(BN(0));
        // console.log(`Enoky Geyser Confirmation Complete`);
    }
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
        metadataResolver
            (These should all be the right addresses)

        costPerMushroom = as per config
        mySpecies = correct species as per config
        spawnCount = 0

        getRemainingMintableForMySpecies() should be the cap for that species
    */

    for (const poolEntry of enoki.missionPools) {
        const sporePool = poolEntry.sporePool;
        const mushroomFactory = poolEntry.mushroomFactory;
        const rateVote = poolEntry.rateVote;

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

        expect(await sporePool.owner(), "sporePool.owner()").to.be.equal(
            enoki.devMultisig.ethersContract.address
        );

        expect(await mushroomFactory.owner(), "mushroomFactory.owner()").to.be.equal(
            sporePool.address
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
        ).to.be.equal(enoki.bannedContractProxy.address);

        expect(
            await sporePool.stakingEnabledTime(),
            "sporePool.stakingEnabledTime()"
        ).to.be.equal(enoki.config.poolGlobals.stakingStartTime);

        expect(
            await sporePool.enokiDaoAgent(),
            "sporePool.enokiDaoAgent()"
        ).to.be.equal(enoki.enokiDaoAgent.address);

        expect(
            await sporePool.MAX_PERCENTAGE(),
            "sporePool.MAX_PERCENTAGE()"
        ).to.be.equal(BN(100));

        expect(await sporePool.rateVote(), "sporePool.rateVote()").to.be.equal(
            rateVote.address
        );

        expect(
            await enoki.proxyAdmin.getProxyAdmin(sporePool.address),
            "enoki.proxyAdmin.getProxyAdmin"
        ).to.be.equal(enoki.proxyAdmin.address);

        if (poolConfig.assetName === "ETH") {
            expect(
                await enoki.proxyAdmin.getProxyImplementation(sporePool.address),
                "sporePoolEth impl"
            ).to.be.equal(enoki.sporePoolEthLogic.address);
        } else {
            expect(
                await enoki.proxyAdmin.getProxyImplementation(sporePool.address),
                "sporePool impl"
            ).to.be.equal(enoki.sporePoolLogic.address);
        }

        console.log(`Spore Pool Confirmation for ${poolConfig.assetName} Complete`);

        /*

            sporeToken
            mushroomNft
            metadataResolver
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

        expect(
            await enoki.proxyAdmin.getProxyAdmin(mushroomFactory.address),
            "enoki.proxyAdmin.getProxyAdmin"
        ).to.be.equal(enoki.proxyAdmin.address);

        expect(
            await enoki.proxyAdmin.getProxyImplementation(mushroomFactory.address),
            "mushroomFactory impl"
        ).to.be.equal(enoki.mushroomFactoryLogic.address);

        console.log(
            `Mushroom Factory Confirmation for ${poolConfig.assetName} Complete`
        );

        /* Vote Rate 
            voteEpoch
            voteDuration
            enokiToken
            pool
            bannedContractList
            decreaseRateMultiplier
            increaseRateMultiplier
        */

        expect(
            await rateVote.decreaseRateMultiplier(),
            "rateVote.decreaseRateMultiplier()"
        ).to.be.equal(BN(50));

        expect(
            await rateVote.increaseRateMultiplier(),
            "rateVote.increaseRateMultiplier()"
        ).to.be.equal(BN(150));

        const voteEpoch = await rateVote.getVoteEpoch();
        console.log("voteEpoch", voteEpoch);

        expect(voteEpoch.startTime, "voteEpoch.startTime").to.be.equal(
            enoki.config.poolGlobals.votingStartTime
        );

        // expect(
        //     await rateVote.voteDuration(),
        //     "rateVote.voteEpoch()"
        // ).to.be.equal();

        expect(await rateVote.enokiToken(), "rateVote.enokiToken()").to.be.equal(
            enoki.enokiToken.address
        );

        expect(
            await rateVote.votingEnabledTime(),
            "rateVote.votingEnabledTime()"
        ).to.be.equal(enoki.config.poolGlobals.votingStartTime);

        expect(await rateVote.voteDuration(), "rateVote.voteDuration()").to.be.equal(
            enoki.config.poolGlobals.voteDuration
        );

        expect(
            await enoki.proxyAdmin.getProxyImplementation(rateVote.address),
            "rateVote impl"
        ).to.be.equal(enoki.rateVoteLogic.address);

        expect(
            await enoki.proxyAdmin.getProxyAdmin(rateVote.address),
            "enoki.proxyAdmin.getProxyAdmin"
        ).to.be.equal(enoki.proxyAdmin.address);
    }

    console.log(`Pool Confirmation Complete`);

    // TODO: Confirm lifespan & minting permissions and count

    /*
        MetadataResolver:
        hasMetadataAdapter(mushroomAdapter) = true
        hasMetadataAdapter(random address) = false
        owner = dev multisig
    */

    expect(
        await enoki.metadataResolverProxy.getMetadataAdapter(
            enoki.mushroomNftProxy.address
        ),
        "metadataResolverProxy.getMetadataAdapter(mushroomAdapter)"
    ).to.be.equal(enoki.mushroomAdapterProxy.address);

    expect(
        await enoki.metadataResolverProxy.hasMetadataAdapter(
            enoki.mushroomNftProxy.address
        ),
        "metadataResolverProxy.getMetadataAdapter(mushroomAdapter)"
    ).to.be.equal(true);

    expect(
        await enoki.metadataResolverProxy.hasMetadataAdapter(
            enoki.mushroomAdapterLogic.address
        ),
        "metadataResolverProxy.getMetadataAdapter(random address)"
    ).to.be.equal(false);

    // TODO: Check roles and role count
    // expect(
    //     await enoki.metadataResolverProxy.owner(),
    //     "metadataResolverProxy.owner()"
    // ).to.be.equal(enoki.devMultisig.ethersContract.address);

    /*
        MushroomAdapter:
        hasMetadataAdapter(mushroomAdapter) = true
        hasMetadataAdapter(random address) = false
        owner = dev multisig
    */

    // TODO: Check roles and role count
    expect(
        await enoki.mushroomAdapterProxy.hasRole(
            LIFESPAN_MODIFY_REQUEST_ROLE,
            enoki.metadataResolverProxy.address
        ),
        "mushroomAdapterProxy.hasRole(LIFESPAN_MODIFY_REQUEST_ROLE)"
    ).to.be.equal(true);

    expect(
        await enoki.mushroomAdapterProxy.getRoleMemberCount(
            LIFESPAN_MODIFY_REQUEST_ROLE
        ),
        "metadataResolverProxy LIFESPAN_MODIFY_REQUEST_ROLE"
    ).to.be.equal(BN(1));

    expect(
        await enoki.metadataResolverProxy.hasRole(
            LIFESPAN_MODIFY_REQUEST_ROLE,
            enoki.enokiGeyserProxy.address
        ),
        "metadataResolverProxy LIFESPAN_MODIFY_REQUEST_ROLE"
    ).to.be.equal(true);

    expect(
        await enoki.metadataResolverProxy.getRoleMemberCount(
            LIFESPAN_MODIFY_REQUEST_ROLE
        ),
        "metadataResolverProxy LIFESPAN_MODIFY_REQUEST_ROLE"
    ).to.be.equal(BN(1));

    expect(
        await enoki.metadataResolverProxy.hasRole(
            DEFAULT_ADMIN_ROLE,
            enoki.devMultisig.ethersContract.address
        ),
        "metadataResolverProxy DEFAULT_ADMIN_ROLE"
    ).to.be.equal(true);

    expect(
        await enoki.metadataResolverProxy.getRoleMemberCount(
            DEFAULT_ADMIN_ROLE
        ),
        "metadataResolverProxy LIFESPAN_MODIFY_REQUEST_ROLE"
    ).to.be.equal(BN(1));

    console.log(`Mushroom Metadata Infra Complete`);
}

export async function confirmMushroomNft(enoki: EnokiSystem, testmode: boolean) {
    /*
        Mushroom NFT:
            For each launch species: 
                getSpecies() = for each species, make sure the data is right
                getRemainingMintableForSpecies() = cap
    */

    // TODO: Confirm the species data
    for (const species of enoki.config.species) {
        const speciesData = await enoki.mushroomNftProxy.getSpecies(species.speciesId);
        const remainingMintable = await enoki.mushroomNftProxy.getRemainingMintableForSpecies(
            species.speciesId
        );

        console.log(speciesData);
    }

    // Confirm minting permissions
    // Confirm lifespan modification permissions
    const expectedMinters: string[] = [];
    const expectedLifespanMods = [enoki.mushroomAdapterProxy.address];

    // All mission pools should be able to do both
    for (const pool of enoki.missionPools) {
        expectedMinters.push(pool.mushroomFactory.address);
        expectedLifespanMods.push(pool.mushroomFactory.address);
    }

    expect(
        await enoki.mushroomNftProxy.getRoleMemberCount(MINTER_ROLE),
        "mushroomNftProxy.getRoleMemberCount(MINTER_ROLE)"
    ).to.be.equal(BN(expectedMinters.length));

    expect(
        await enoki.mushroomNftProxy.getRoleMemberCount(LIFESPAN_MODIFIER_ROLE),
        "mushroomNftProxy.getRoleMemberCount(LIFESPAN_MODIFIER_ROLE)"
    ).to.be.equal(BN(expectedLifespanMods.length));

    for (const minter of expectedMinters) {
        expect(
            await enoki.mushroomNftProxy.hasRole(MINTER_ROLE, minter),
            "mushroomNftProxy.hasRole(MINTER_ROLE)"
        ).to.be.equal(true);
    }

    for (const mod of expectedLifespanMods) {
        expect(
            await enoki.mushroomNftProxy.hasRole(LIFESPAN_MODIFIER_ROLE, mod),
            "mushroomNftProxy.hasRole(LIFESPAN_MODIFIER_ROLE)"
        ).to.be.equal(true);
    }
}

export async function confirmImplementations(enoki: EnokiSystem, testmode: boolean) {
    expect(
        await enoki.proxyAdmin.getProxyImplementation(enoki.missionsProxy.address),
        "missionsProxy"
    ).to.be.equal(enoki.missionsLogic.address);

    expect(
        await enoki.proxyAdmin.getProxyImplementation(enoki.mushroomNftProxy.address),
        "mushroomNftProxy"
    ).to.be.equal(enoki.mushroomNftLogic.address);

    expect(
        await enoki.proxyAdmin.getProxyImplementation(
            enoki.metadataResolverProxy.address
        ),
        "metadataResolverProxy"
    ).to.be.equal(enoki.metadataResolverLogic.address);

    expect(
        await enoki.proxyAdmin.getProxyImplementation(
            enoki.mushroomAdapterProxy.address
        ),
        "metadataResolverProxy"
    ).to.be.equal(enoki.mushroomAdapterLogic.address);

    expect(
        await enoki.proxyAdmin.getProxyImplementation(
            enoki.bannedContractProxy.address
        ),
        "metadataResolverProxy"
    ).to.be.equal(enoki.bannedContractLogic.address);

    console.log(`Proxy Implementations Confirmed`);
}

export async function confirmUpgradability(enoki: EnokiSystem, testmode: boolean) {
    // Ensure every proxy is owned by the ProxyAdmin (Pool contracts are checked in the confirmPools)
    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.missionsProxy.address),
        "missionsProxy"
    ).to.be.equal(enoki.proxyAdmin.address);

    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.mushroomNftProxy.address),
        "mushroomNftProxy"
    ).to.be.equal(enoki.proxyAdmin.address);

    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.metadataResolverProxy.address),
        "metadataResolverProxy"
    ).to.be.equal(enoki.proxyAdmin.address);

    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.mushroomAdapterProxy.address),
        "mushroomAdapterProxy"
    ).to.be.equal(enoki.proxyAdmin.address);

    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.bannedContractProxy.address),
        "bannedContractProxy"
    ).to.be.equal(enoki.proxyAdmin.address);

    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.enokiGeyserProxy.address),
        "enokiGeyserProxy"
    ).to.be.equal(enoki.proxyAdmin.address);

    console.log(`Proxy Admins Confirmed`);

    // Ensure ProxyAdmin is owned by dev
    expect(await enoki.proxyAdmin.owner(), "enoki.proxyAdmin.owner()").to.be.equal(
        enoki.devMultisig.ethersContract.address
    );

    console.log(`Proxy Admin Owner Confirmed`);
}

export async function confirmMetadataPermissions(
    enoki: EnokiSystem,
    testmode: boolean
) {
    // The Adapter should be admin by the dev
    // The Adapter should grant lifespan mod to Resolver ONLY
    // The Resolver should grant lifespan modification rights to ONLY EnokiGeyser
}
