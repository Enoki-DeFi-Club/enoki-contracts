import {deployCore} from "./deploy/deployCore";
import {run, ethers} from "@nomiclabs/buidler";
import { deployLpVesting } from "./deploy/deployLpVesting";

async function main() {
    const jsonRpcProvider = ethers.provider;

    const [first, deployer] = await ethers.getSigners();
    await deployLpVesting(jsonRpcProvider, deployer, {
        testmode: false,
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
