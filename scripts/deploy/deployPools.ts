import Web3 from "web3";
import {EnokiSystem} from "../systems/EnokiSystem";
import {Configs, daysToSeconds, LaunchConfig} from "../config/launchConfig";
import dotenv from "dotenv";
import {providers, Signer} from "ethers";
import {confirmCore} from "../confirmCore";
import {deployed} from "./deployed";
import {
    confirmImplementations,
    confirmMetadataPermissions,
    confirmMushroomNft,
    confirmPools,
    confirmUpgradability,
} from "../confirmPools";
import {exportEnokiSystem} from "../utils/writeFile";
export const colors = require("colors/safe");

colors.setTheme({
    title: ["rainbow", "bold"],
    testTitle: ["cyan", "bold"],
    input: "rainbow",
    verbose: "cyan",
    prompt: "grey",
    info: "green",
    data: "grey",
    help: "cyan",
    warn: "yellow",
    debug: "blue",
    error: "red",
});

dotenv.config();

export interface LaunchFlags {
    testmode: boolean;
}

/* Steps  
  - Deploy BannedContracts
  - Upgrade Missions0 to new contract
    (make sure to change approvedContractsList -> BannedContractsList)
  - Upgrade EnokiGeyser to new contract
    (approvedContractsList -> BannedContractsList)
  - Deploy Pools

  Does anything else require the ContractList update?

*/

export async function deployPools(
    enoki: EnokiSystem,
    testmode: boolean
): Promise<{
    enoki: EnokiSystem;
}> {
    console.log(colors.title("---Deploy Banned Contract List---"));
    await enoki.deployBannedContractList();
    console.log("");

    if (testmode) {
        console.log(colors.title("---TEST ONLY: Distribute Assets from Whales---"));
        await enoki.distributeTestAssets([
            "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
            "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
            "0xe9673e2806305557Daa67E3207c123Af9F95F9d2",
            "0x482c741b0711624d1f462E56EE5D8f776d5970dC",
        ]);

        // console.log(colors.title("---TEST ONLY: Upgrade Enoki Geyser---"));
        // await enoki.upgradeEnokiGeyser();
        // console.log("");

        // console.log(colors.title("---TEST ONLY: Lock Enoki in Geyser---"));
        // await enoki.sendEnokiToGeyser();
    }

    console.log(colors.title("---Deploy Mushroom NFT---"));
    await enoki.deployMushroomNft();
    console.log("");

    console.log(colors.title("---Deploy Mushroom Metadata Infra---"));
    await enoki.deploymetadataResolverInfra();
    console.log("");

    console.log(
        colors.title("---Deploy Initial Mission Pools & Mushroom Factories---")
    );
    await enoki.deployMission0Pools();
    console.log("");

    console.log(colors.title("---Set MetadataAdapter on EnokiGeyser---"));
    console.log(
        colors.title(
            "---Set Muchroom NFT minting & lifespan modification permissions---"
        )
    );
    await enoki.setupMushroomInfra();
    console.log("");

    console.log(colors.title("---Initialize Species---"));
    await enoki.setupSpecies();
    console.log("");

    console.log(colors.title("---Manage Permissions---"));
    await enoki.managePermissions();
    console.log("");

    if (testmode) {
        console.log(colors.title("---Add Pools to Mission---"));
        await enoki.setupMission0Pools();
    }

    console.log(colors.title("---Confirming Deploy Parameters---"));
    await confirmPools(enoki, testmode);

    console.log(colors.title("---Confirming Mushroom NFT---"));
    await confirmMushroomNft(enoki, testmode);

    console.log(colors.title("---Confirming Impl Addresses---"));
    await confirmImplementations(enoki, testmode);

    console.log(colors.title("---Confirming Upgradability---"));
    await confirmUpgradability(enoki, testmode);

    console.log(colors.title("---Confirming Metadata Resolution Permissions---"));
    await confirmMetadataPermissions(enoki, testmode);

    exportEnokiSystem(enoki, 'pools.json');

    return {enoki};
}
