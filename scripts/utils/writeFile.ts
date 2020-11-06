import {isConstructorDeclaration} from "typescript";
import {EnokiSystem} from "../systems/EnokiSystem";
import {expect} from "chai";

const fs = require("fs");

export function exportEnokiSystem(enoki: EnokiSystem, file: string) {
    ensureAddreses(enoki);

    const enokiOutput = {
        sporeToken: enoki.sporeToken.address,

        // Spore Distribution
        presale: enoki.presale.address,

        missionsProxy: enoki.missionsProxy.address,
        missionsLogic: enoki.missionsLogic.address,

        lpTokenVesting: enoki.lpTokenVesting.address,

        sporePoolLogic: enoki.sporePoolLogic.address,
        sporePoolEthLogic: enoki.sporePoolEthLogic.address,

        mushroomFactoryLogic: enoki.mushroomFactoryLogic.address,

        mushroomNftLogic: enoki.mushroomNftLogic.address,
        mushroomNftProxy: enoki.mushroomNftProxy.address,

        metadataResolverLogic: enoki.metadataResolverLogic.address,
        metadataResolverProxy: enoki.metadataResolverProxy.address,

        mushroomAdapterLogic: enoki.mushroomAdapterLogic.address,
        mushroomAdapterProxy: enoki.mushroomAdapterProxy.address,

        bannedContractLogic: enoki.bannedContractLogic.address,
        bannedContractProxy: enoki.bannedContractProxy.address,

        centralizedRateVoteLogic: enoki.centralizedRateVoteLogic.address,
        centralizedRateVoteProxy: enoki.centralizedRateVoteProxy.address,

        // Enoki Distribution
        enokiGeyserEscrow: enoki.enokiGeyserEscrow.address,
        enokiGeyserProxy: enoki.enokiGeyserProxy.address,
        enokiGeyserLogic: enoki.enokiGeyserLogic.address,

        // Governance
        enokiToken: enoki.enokiToken.address,
        enokiDaoAgent: enoki.enokiDaoAgent.address,

        // Dev Fund
        devFundPaymentSplitter: enoki.devFundPaymentSplitter.address,
        devFundEthVesting: enoki.devFundEthVesting.address,
        devMultisig: enoki.devMultisig.ethersContract.address,

        // Proxy Admin
        proxyAdmin: enoki.proxyAdmin.address,
        deployerAddress: enoki.deployerAddress,
    };

    const missionPoolOutput: any[] = [];

    for (const pool of enoki.missionPools) {
        console.log(!!pool.sporePool, !!pool.mushroomFactory, !!pool.rateVote);

        missionPoolOutput.push({
            assetName: pool.assetName,
            assetAddress: pool.assetAddress,
            sporePool: pool.sporePool.address,
            mushroomFactory: pool.mushroomFactory.address,
            rateVote: pool.rateVote.address,
        });
    }

    enokiOutput["missionPools"] = missionPoolOutput;

    let data = JSON.stringify(enokiOutput);
    console.dir(enokiOutput);
    fs.writeFileSync(file, data);
}

export function ensureAddreses(enoki: EnokiSystem) {
    expect(!!enoki.sporeToken, "sporeToken").to.be.equal(true);
    expect(!!enoki.presale, "presale").to.be.equal(true);
    expect(!!enoki.missionsProxy, "missionsProxy").to.be.equal(true);
    expect(!!enoki.missionsLogic, "missionsLogic").to.be.equal(true);
    expect(!!enoki.lpTokenVesting, "lpTokenVesting").to.be.equal(true);
    expect(!!enoki.sporePoolLogic, "sporePoolLogic").to.be.equal(true);
    expect(!!enoki.sporePoolEthLogic, "sporePoolEthLogic").to.be.equal(true);
    expect(!!enoki.mushroomFactoryLogic, "mushroomFactoryLogic").to.be.equal(
        true
    );
    expect(!!enoki.mushroomNftLogic, "mushroomNftLogic").to.be.equal(true);
    expect(!!enoki.mushroomNftProxy, "mushroomNftProxy").to.be.equal(true);
    expect(!!enoki.metadataResolverLogic, "metadataResolverLogic").to.be.equal(
        true
    );
    expect(!!enoki.metadataResolverProxy, "metadataResolverProxy").to.be.equal(
        true
    );
    expect(!!enoki.mushroomAdapterLogic, "mushroomAdapterLogic").to.be.equal(
        true
    );
    expect(!!enoki.mushroomAdapterProxy, "mushroomAdapterProxy").to.be.equal(
        true
    );
    expect(!!enoki.bannedContractLogic, "bannedContractLogic").to.be.equal(
        true
    );
    expect(!!enoki.bannedContractProxy, "bannedContractProxy").to.be.equal(
        true
    );
    expect(!!enoki.enokiGeyserEscrow, "enokiGeyserEscrow").to.be.equal(true);
    expect(!!enoki.enokiGeyserProxy, "enokiGeyserProxy").to.be.equal(true);
    expect(!!enoki.enokiGeyserLogic, "enokiGeyserLogic").to.be.equal(true);
    expect(!!enoki.enokiToken, "enokiToken").to.be.equal(true);
    expect(!!enoki.enokiDaoAgent, "enokiDaoAgent").to.be.equal(true);
    expect(
        !!enoki.devFundPaymentSplitter,
        "devFundPaymentSplitter"
    ).to.be.equal(true);
    expect(!!enoki.devFundEthVesting, "devFundEthVesting").to.be.equal(true);
    expect(!!enoki.devMultisig.ethersContract, "devMultisig").to.be.equal(true);
    expect(!!enoki.proxyAdmin, "proxyAdmin").to.be.equal(true);
}
