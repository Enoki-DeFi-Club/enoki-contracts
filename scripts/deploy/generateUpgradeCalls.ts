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
import {geyserEscrowIface, proxyAdminIface} from "../utils/interfaces";
import {ETH} from "../utils/shorthand";
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

export async function generateUpgradeCalls(
    enoki: EnokiSystem,
    testmode: boolean
): Promise<{
    enoki: EnokiSystem;
}> {
    console.log(`Upgrade EnokiGeyser
        ${proxyAdminIface.encodeFunctionData("upgrade", [
            enoki.enokiGeyserProxy.address,
            enoki.enokiGeyserLogic.address,
        ])}
        `);
    console.log(
        `Upgrading ${enoki.enokiGeyserProxy.address} to ${enoki.enokiGeyserLogic.address}`
    );

    console.log(`Upgrade MushroomNFT
        ${proxyAdminIface.encodeFunctionData("upgrade", [
            enoki.mushroomNftProxy.address,
            enoki.mushroomNftLogic.address,
        ])}
        `);

    console.log(
        `Upgrading ${enoki.mushroomNftProxy.address} to ${enoki.mushroomNftLogic.address}`
    );

    console.log(`Upgrade MetadataResolver
        ${proxyAdminIface.encodeFunctionData("upgrade", [
            enoki.metadataResolverProxy.address,
            enoki.metadataResolverLogic.address,
        ])}
        `);

    console.log(
        `Upgrading ${enoki.metadataResolverProxy.address} to ${enoki.metadataResolverLogic.address}`
    );

    console.log(`Upgrade MushroomAdapter
        ${proxyAdminIface.encodeFunctionData("upgrade", [
            enoki.mushroomAdapterProxy.address,
            enoki.mushroomAdapterLogic.address,
        ])}`);

    console.log(
        `Upgrading ${enoki.mushroomAdapterProxy.address} to ${enoki.mushroomAdapterLogic.address}`
    );

    console.log(`Lock Enoki Tokens
        ${geyserEscrowIface.encodeFunctionData("lockTokens", [
            ETH("6300"),
            daysToSeconds(60),
        ])}`);

        console.log(
            `Locking ${ETH("6300")} tokens for ${daysToSeconds(60)}`
        );
    

    return {enoki};
}
