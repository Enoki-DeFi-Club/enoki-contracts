import { isConstructorDeclaration } from "typescript";
import { EnokiSystem } from "../systems/EnokiSystem";

const fs = require('fs');

export function exportEnokiSystem(enoki: EnokiSystem) {
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
    
        mushroomMetadataLogic: enoki.mushroomMetadataLogic.address,
        mushroomMetadataProxy: enoki.mushroomMetadataProxy.address,
    
        mushroomResolverLogic: enoki.mushroomResolverLogic.address,
        mushroomResolverProxy: enoki.mushroomResolverProxy.address,
    
        bannedContractLogic: enoki.bannedContractLogic.address,
        bannedContractProxy: enoki.bannedContractProxy.address,
    
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
        deployerAddress: enoki.deployerAddress
    }

    const missionPoolOutput: any[] = [];

    for (const pool of enoki.missionPools) {
        missionPoolOutput.push({
            assetName: pool.assetName,
            assetAddress: pool.assetAddress,
            sporePool: pool.sporePool.address,
            mushroomFactory: pool.mushroomFactory.address
        })
    }

    enokiOutput['missionPools'] = missionPoolOutput;
    
    let data = JSON.stringify(enokiOutput);
    console.dir(enokiOutput);
    fs.writeFileSync('local.json', data);
}