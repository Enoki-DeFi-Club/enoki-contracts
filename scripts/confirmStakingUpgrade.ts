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

export async function confirmStakingUpgrade(enoki: EnokiSystem, testmode: boolean) {
    // Confirm new implementations for EnokiGeyser, MetadataResolver, MushroomAdapter
    console.log(`Confirming new implementation`)
    expect(
        await enoki.proxyAdmin.getProxyImplementation(
            enoki.mushroomAdapterProxy.address
        )
    ).to.be.equal(enoki.mushroomAdapterLogic.address);
    expect(
        await enoki.proxyAdmin.getProxyImplementation(
            enoki.metadataResolverProxy.address
        )
    ).to.be.equal(enoki.metadataResolverLogic.address);
    expect(
        await enoki.proxyAdmin.getProxyImplementation(enoki.enokiGeyserProxy.address)
    ).to.be.equal(enoki.enokiGeyserLogic.address);

    expect(
        await enoki.proxyAdmin.getProxyImplementation(enoki.mushroomNftProxy.address)
    ).to.be.equal(enoki.mushroomNftLogic.address);

    // Confirm parameters for all affected contracts
    console.log(`Confirming new geyser params`)
    expect(
        await enoki.enokiGeyserProxy.enokiToken(),
        "enokiGeyserProxy.enokiToken"
    ).to.be.equal(enoki.enokiToken.address);

    expect(
        await enoki.enokiGeyserProxy.stakingEnabledTime(),
        "enokiGeyserProxy.stakingEnabledTime"
    ).to.be.equal(enoki.config.poolGlobals.enokiEnabledTime);

    expect(
        await enoki.enokiGeyserProxy.initializeComplete(),
        "enokiGeyserProxy.initializeComplete"
    ).to.be.equal(true);

    expect(
        await enoki.enokiGeyserProxy.maxAirdropPool(),
        "enokiGeyserProxy.maxAirdropPool"
    ).to.be.equal(enoki.config.geyserParams.maxAirdropPool);

    expect(
        await enoki.enokiGeyserProxy.SECONDS_PER_WEEK(),
        "enokiGeyserProxy.SECONDS_PER_WEEK"
    ).to.be.equal(daysToSeconds(7));

    console.log(`Confirming new geyser permissions`)

    // Ensure Geyser owner is GeyserEscrow
    expect(
        await enoki.enokiGeyserProxy.owner(),
        "enoki.enokiGeyserProxy.owner()"
    ).to.be.equal(enoki.enokiGeyserEscrow.address);

    console.log(`Confirming 2`)
    // Ensure Geyser admin is DevMultisig
    expect(
        await enoki.enokiGeyserProxy.hasRole(DEFAULT_ADMIN_ROLE, enoki.devMultisig.ethersContract.address),
        "enoki.enokiGeyserProxy.hasRole"
    ).to.be.equal(true);

    expect(
        await enoki.enokiGeyserProxy.getRoleMemberCount(DEFAULT_ADMIN_ROLE),
        "enoki.enokiGeyserProxy.getRoleMemberCount"
    ).to.be.equal(BN(1));

    console.log(`Confirming old geyser params`)
    expect(
        await enoki.enokiGeyserProxy.startBonus(),
        "enoki.enokiGeyserProxy.startBonus()"
    ).to.be.equal(BN(0));
    expect(
        await enoki.enokiGeyserProxy.bonusPeriodSec(),
        "enoki.enokiGeyserProxy.bonusPeriodSec()"
    ).to.be.equal(BN(0));
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
        await enoki.enokiGeyserProxy.bannedContractList(),
        "enoki.enokiGeyserProxy.bannedContractList()"
    ).to.be.equal(enoki.bannedContractProxy.address);
    expect(
        await enoki.enokiGeyserProxy.metadataResolver(),
        "enoki.enokiGeyserProxy.metadataResolver()"
    ).to.be.equal(enoki.metadataResolverProxy.address);

    console.log(`Confirming stakeability params`)
    expect(
        await enoki.metadataResolverProxy.isStakeable(enoki.mushroomNftProxy.address, BN(0)),
        "enoki.enokiGeyserProxy.isNftStakeable(mushroomNFT)"
    ).to.be.equal(true);
    expect(
        await enoki.metadataResolverProxy.isStakeable(enoki.mushroomNftLogic.address, BN(0)),
        "enoki.enokiGeyserProxy.isNftStakeable(mushroomNFT)"
    ).to.be.equal(false);
    expect(
        await enoki.enokiGeyserProxy.getDistributionToken(),
        "enoki.enokiGeyserProxy.getDistributionToken()"
    ).to.be.equal(enoki.enokiToken.address);

    console.log(`Enoky Geyser Confirmation Complete`);
}
