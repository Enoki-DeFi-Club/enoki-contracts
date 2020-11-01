import {deployCore} from "./deploy/deployCore";
import {run, ethers} from "@nomiclabs/buidler";
import {EnokiSystem} from "./systems/EnokiSystem";
import {Configs, WHALES} from "./config/launchConfig";
import {deployed} from "./deploy/deployed";
import { deployPools } from "./deploy/deployPools";
import Web3 from "web3";

async function main() {
    const jsonRpcProvider = ethers.provider;

    const [first, deployer] = await ethers.getSigners();
    
    console.log('Deployer: ', await deployer.getAddress());

    const web3 = new Web3("http://localhost:8545");

    await web3.eth.sendTransaction({
        from: WHALES["ETH"],
        to: await deployer.getAddress(),
        value: "100000000000000000000000",
    });

    let enoki = EnokiSystem.fromDeployed(
        Configs.MAINNET,
        jsonRpcProvider,
        deployer,
        {testmode: true},
        deployed
    );

    const updated = await deployPools(enoki, false);
    enoki = updated.enoki;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
