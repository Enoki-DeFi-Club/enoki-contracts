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
import {confirmStakingUpgrade} from "../confirmStakingUpgrade";
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

export async function deployMushroomStaking(
    enoki: EnokiSystem,
    testmode: boolean
): Promise<{
    enoki: EnokiSystem;
}> {
    // console.log(colors.title("---Deploy upgraded metadata infrastructure---"));
    // await enoki.deployUpgradedMetadataInfra();
    // console.log("");

    // console.log(colors.title("---Deploy Centralized Rate Vote---"));
    // await enoki.deployCentralizedRateVote();
    // console.log("");

    // console.log(colors.title("---Deploying latest logic upgrades---"));
    // await enoki.deployLogicUpgrades();
    // console.log("");

    console.log(colors.title("---Upgrade Farms---"));
    await enoki.upgradeFarms();
    console.log("");

    console.log(colors.title("---Switch Rate Votes -> Centralized ---"));
    await enoki.swtichRateVotes();
    console.log("");

    // console.log(colors.title("---Upgrade Farms---"));
    // await enoki.upgradeFarms();
    // console.log("");

    // console.log(colors.title("---Initial Enoki Geyser with fresh params---"));
    // await enoki.initializeEnokiGeyser();
    // console.log("");

    // console.log(colors.title("---TEST ONLY: Lock Enoki in Geyser---"));
    // await enoki.sendEnokiToGeyser();

    // console.log(colors.title("---TEST ONLY: Tranfer Enoki Geyser to Multisig---"));
    // await enoki.transferEnokiGeyserAdmin();

    // We can't actually do this via script unless we pre-approve the hashes from 2/3 multisig signatories, so we'll have to do that first.
    if (testmode) {
        // console.log(colors.title("---TEST ONLY: Distribute Assets from Whales---"));
        // await enoki.distributeTestAssets([
        //     "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
        //     "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0",
        //     "0xe9673e2806305557Daa67E3207c123Af9F95F9d2",
        //     "0x482c741b0711624d1f462E56EE5D8f776d5970dC",
        // ]);

        // console.log(colors.title("---TEST ONLY: Mushroom Lifespan Mock---"));
        // await enoki.deployMushroomMock();

        // console.log(colors.title("---TEST ONLY: Upgrade Enoki Geyser---"));
        // await enoki.upgradeEnokiGeyser();
        // console.log("");

        // console.log(colors.title("---TEST ONLY: Upgrade Mushroom Nft---"));
        // await enoki.upgradeMushroomNft();
        // console.log("");

        // console.log(colors.title("---TEST ONLY: Upgrade MetadataResolver---"));
        // await enoki.upgradeMetadataResolver();
        // console.log("");

        // console.log(colors.title("---TEST ONLY: Upgrade MushroomAdapter---"));
        // await enoki.upgradeMushroomAdapter();
        // console.log("");
    }

    console.log(colors.title("---TEST ONLY: Confirm Staking Upgrade---"));
    // await confirmStakingUpgrade(enoki, testmode);

    console.log(colors.title("---Export Enoki System to pools.json---"));
    exportEnokiSystem(enoki, "pools-test.json");

    return {enoki};
}
