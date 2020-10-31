import {deployCore} from "./deploy/deployCore";
import {run, ethers} from "@nomiclabs/buidler";
import {EnokiSystem} from "./systems/EnokiSystem";
import {Configs} from "./config/launchConfig";
import {deployed} from "./deploy/deployed";
import { deployPools } from "./deploy/deployPools";

async function main() {
    const jsonRpcProvider = ethers.provider;

    const [first, deployer] = await ethers.getSigners();
    
    console.log('Deployer: ', await deployer.getAddress());

    let enoki = EnokiSystem.fromDeployed(
        Configs.MAINNET,
        jsonRpcProvider,
        deployer,
        {testmode: true},
        deployed
    );

    const updated = await deployPools(enoki);
    enoki = updated.enoki;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
