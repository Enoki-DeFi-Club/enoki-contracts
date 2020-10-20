// Should be able to upgrade Mission
// Should be able to upgrade EnokiGeyser
// Should be able to send proxyAdmin to DAO

import {ethers} from "@nomiclabs/buidler";
import {expect} from "chai";
import {BigNumber, constants, Contract, providers, Signer, utils} from "ethers";
import {daysToSeconds, LaunchConfig, WHALES} from "../scripts/config/launchConfig";
import {deployCore} from "../scripts/deploy/deployCore";
import {Operation} from "../scripts/deploy/Multisig";
import {EnokiSystem} from "../scripts/systems/EnokiSystem";
import {getCurrentTimestamp, increaseTime} from "../scripts/timeUtils";
import SporePresale from "../artifacts/SporePresale.json";
import SporeToken from "../artifacts/SporeToken.json";
import IERC20 from "../artifacts/IERC20.json";
import UniswapV2Router from "../dependency-artifacts/uniswap/UniswapV2Router02.json";
import {json} from "@nomiclabs/buidler/internal/core/params/argumentTypes";

const presaleIface = new utils.Interface(SporePresale.abi);
const sporeTokenIface = new utils.Interface(SporeToken.abi);
const uniswapRouterIface = new utils.Interface(UniswapV2Router.abi);

describe("Upgrades", function () {
    let enoki: EnokiSystem;
    let config: LaunchConfig;
    let jsonRpcProvider: providers.Provider;
    let first: Signer;
    let deployer: Signer;
    let third: Signer;

    before(async function () {
        this.timeout(0);
        jsonRpcProvider = ethers.provider;
        [first, deployer, third] = await ethers.getSigners();
        const deploy = await deployCore(jsonRpcProvider, deployer, {testmode: true});
        enoki = deploy.enoki;
        config = deploy.config;

        await enoki.web3.eth.sendTransaction({
            from: WHALES["ETH"],
            to: await deployer.getAddress(),
            value: "1000000000000000000",
        });
    });
    it("Should be able to upgrade Mission", async function () {
        await (
            await enoki.proxyAdmin.upgrade(
                enoki.missionsProxy.address,
                enoki.sporeToken.address
            )
        ).wait();

        expect(await enoki.proxyAdmin.getProxyImplementation()).to.be.equal(enoki.sporeToken.address)
    });

    it("Should be able to upgrade EnokiGeyser", async function () {
        await (
            await enoki.proxyAdmin.upgrade(
                enoki.missionsProxy.address,
                enoki.sporeToken.address
            )
        ).wait();

        expect(await enoki.proxyAdmin.getProxyImplementation()).to.be.equal(enoki.sporeToken.address)
    });

    it("Should be able to send proxyAdmin to DAO", async function () {
        await (
            await enoki.proxyAdmin.transferOwnership(
                enoki.enokiDaoAgent.address
            )
        ).wait();

        expect(await enoki.proxyAdmin.owner()).to.be.equal(enoki.enokiDaoAgent.address)
    });
});
