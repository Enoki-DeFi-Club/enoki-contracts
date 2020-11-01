/*

Farm with single user

- User with tokens should be able to stake
- User without tokens should not be able to stake
- User should be able to harvest immediately after stake
- User should be able to unstake directly after stake

... Wait some time

- User should be able to harvest
- User should be able to spawn the maximum mushrooms they can
- User should be able to spawn one mushroom 
- User should recieve mushroom
- Mushroom should have correct properties
- User should be able to stake mushroom in ENOKI Geyser
- User should be able to unstake mushroom
- Lifespan should be reduced

- User should be able to restake alive mushroom in ENOKI Geyser

.. Wait until mushroom dies

- should burn dead mushroom * give ENOKI

- User should be able to stake multiple NFTs
    - A mushroom
    - A different NFT that CAN'T be burned

.. Wait until NFT is dead 

    - Try to unstake both at the same time.
    - Make sure you can unstake
    - Make sure it isn't burned!
    - Make sure mushie is burned
*/

import {ethers} from "@nomiclabs/buidler";
import {expect} from "chai";
import {BigNumber, constants, Contract, providers, Signer, utils} from "ethers";
import {
    Configs,
    daysToSeconds,
    LaunchConfig,
    WHALES,
} from "../scripts/config/launchConfig";
import {Operation} from "../scripts/deploy/Multisig";
import {EnokiSystem} from "../scripts/systems/EnokiSystem";
import {getCurrentTimestamp, increaseTime} from "../scripts/utils/timeUtils";
import {deployed} from "../scripts/deploy/deployed";

import {
    presaleIface,
    sporeTokenIface,
    erc20Iface,
    uniswapRouterIface,
    geyserEscrowIface,
    missionIface,
} from "../scripts/utils/interfaces";
import {BN, ETH} from "../scripts/utils/shorthand";
import { deployPools } from "../scripts/deploy/deployPools";

describe("Simulate Farming", function () {
    let enoki: EnokiSystem;
    let config: LaunchConfig;
    let jsonRpcProvider: providers.Provider;
    let first: Signer;
    let deployer: Signer;
    let third: Signer;
    let staker: Signer;
    let nonStaker: Signer;
    let poolAsset: string;

    before(async function () {
        this.timeout(0);
        jsonRpcProvider = ethers.provider;
        [first, deployer, third, staker, nonStaker] = await ethers.getSigners();

        enoki = EnokiSystem.fromDeployed(
            Configs.MAINNET,
            jsonRpcProvider,
            deployer,
            {testmode: true},
            deployed
        );

        config = enoki.config;

        const updated = await deployPools(enoki, true);
        enoki = updated.enoki;

        poolAsset = config.pools[0].assetAddress;

        await enoki.web3.eth.sendTransaction({
            from: WHALES["ETH"],
            to: await deployer.getAddress(),
            value: "1000000000000000000",
        });
    });

    describe("Before pool launch time", async function () {
        before(async function () {
            this.timeout(0);
            
        });

        it("User with valid tokens should be able to stake", async function () {
            const pool = enoki.getPoolByAsset(poolAsset);
            await (await pool.sporePool.stake(ETH("1"), {value: ETH("1")})).wait();
            await increaseTime(jsonRpcProvider, daysToSeconds(10).toNumber());
            await (await pool.sporePool.harvest(BN(1))).wait();
        });

        // it("User without valid tokens should not be able to stake", async function () {
        //     const pool = enoki.getPoolByAsset(poolAsset);
        //     await expect(pool.sporePool.connect(nonStaker).stake(ETH("1"))).to.be
        //         .reverted;
        // });

        // it("User should be able to harvest immediately after stake", async function () {
        //     const pool = enoki.getPoolByAsset(poolAsset);
        //     await (await pool.sporePool.connect(staker).harvest()).wait();
        // });

        // it("User should be able to unstake directly after stake", async function () {
        //     const pool = enoki.getPoolByAsset(poolAsset);
        //     await (await pool.sporePool.connect(staker).unstake(ETH("1"))).wait();
        // });

        // // Restake for move forward
        // after(async function () {
        //     const pool = enoki.getPoolByAsset(poolAsset);
        //     await (await pool.sporePool.connect(staker).stake(ETH("1"))).wait();
        // });
    });

    describe("After some time passes...", async function () {
        before(async function () {
            this.timeout(0);
            // Increase Time
        });

        it("User should be able to harvest", async function () {
            const pool = enoki.getPoolByAsset(poolAsset);
            await (await pool.sporePool.connect(staker).stake(ETH("1"))).wait();
        });

        it("User should be able to spawn one mushroom & recieve the rest of the SPORES they should have gotten", async function () {
            const pool = enoki.getPoolByAsset(poolAsset);

            await expect(
                pool.sporePool.connect(staker).harvest(BN("1"))
                // @ts-ignore
            ).to.changeTokenBalance(enoki.sporeToken, await staker.getAddress(), 1);

            // What mushroom was created?
            const minted = pool.mushroomFactory.queryFilter(
                pool.mushroomFactory.filters.ProxyCreation(),
                "latest"
            );

            // Howm
        });

        it("Appropriate number of spores should be burnt", async function () {});

        it("Dev fund should get appropriate number of SPORES", async function () {});

        it("Mushroom should have correct properties (correct species & lifespan)", async function () {});

        it("User should be able to stake mushroom in ENOKI Geyser", async function () {});

        it("User should be able to unstake mushroom from ENOKI Geyser", async function () {});

        it("Lifespan of mushroom should be reduced ENOKI Geyser", async function () {});

        it("User should be able to restake living mushroom in ENOKI Geyser", async function () {});
    });

    describe("After the mushroom lifespan is up...", async function () {
        before(async function () {
            this.timeout(0);
            // Increase Time
        });

        it("User should be able to harvest spores and spawn the max mushrooms they can according to cost", async function () {});

        it("User should recieve mushrooms", async function () {});

        it("Appropriate number of spores should be burnt", async function () {});

        it("User should recieve the rest of the SPORES they should have gotten", async function () {});

        it("Dev fund should get appropriate number of SPORES", async function () {});

        it("Mushroom should have correct properties (correct species & lifespan)", async function () {});

        it("User should be able to stake mushroom in ENOKI Geyser", async function () {});

        it("User should be able to unstake mushroom from ENOKI Geyser", async function () {});

        it("Users ENOKI balance should increase", async function () {});

        it("Dev fund should get appropriate amount of ENOKI", async function () {});

        it("Lifespan of mushroom should be reduced ENOKI Geyser", async function () {});

        it("User should be able to restake living mushroom in ENOKI Geyser", async function () {});
    });
});
