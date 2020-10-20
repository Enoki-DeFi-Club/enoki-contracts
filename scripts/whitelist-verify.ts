import {deployCore} from "./deploy/deployCore";
import {run, ethers} from "@nomiclabs/buidler";
import {EnokiSystem} from "./systems/EnokiSystem";
import {Configs} from "./config/launchConfig";
import {deployed} from "./deploy/deployed";
import {confirmWhitelist} from "./confirmWhitelist";
import whitelist from "./config/whitelist";

async function main() {
    const jsonRpcProvider = ethers.provider;

    const [first, deployer] = await ethers.getSigners();
    const enoki = EnokiSystem.fromDeployed(
        Configs.MAINNET,
        jsonRpcProvider,
        deployer,
        {testmode: true},
        deployed
    );
    await confirmWhitelist(enoki, Configs.MAINNET, whitelist);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
