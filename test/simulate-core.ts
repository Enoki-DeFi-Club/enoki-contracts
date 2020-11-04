// Run thruogh the full setup & presale flow, advancing time to the end. Ensure things work as expected along the way.

// Start presale
// Users invest in presale
// Users should recieve token
// Transfers should be disabled
// Non-whitelisted should fail to invest in presale
// PaymentSplitter should recieve ETH
// PaymentSplitter should successfully send ETH to EthVesting
// PaymentSplitter should successfully send ETH to DevMultisig

// DevMultisig should be able to lock initial liquidity
// DevMultisig should be able to send initial liquidity to TokenVesting for DAO

// Let time pass.. Start of Farms

// Ensure Geyser escrow can lock tokens in Geyser

// Let time pass.. A few months

// Check that the correct amount of locked LP tokens can be claimed for DAO
// Ensure DAO LP balance increases

// Check that correct amount of ETH can be released to DevMultisig
// Release ETH to DevMultisig

// Let time pass.. End of dev fund
// Ensure entire dev fund can be released

// Let time pass.. End of two years
// Ensure entire LP tokens can be released

// Dev fund should successfully lock initial liquidity

import {ethers} from "@nomiclabs/buidler";
import {expect} from "chai";
import {BigNumber, constants, Contract, providers, Signer, utils} from "ethers";
import {daysToSeconds, LaunchConfig, WHALES} from "../scripts/config/launchConfig";
import {deployCore} from "../scripts/deploy/deployCore";
import {Operation} from "../scripts/deploy/Multisig";
import {EnokiSystem} from "../scripts/systems/EnokiSystem";
import {getCurrentTimestamp, increaseTime} from "../scripts/utils/timeUtils";

import {
    presaleIface,
    sporeTokenIface,
    erc20Iface,
    uniswapRouterIface,
    geyserEscrowIface,
    missionIface,
} from "../scripts/utils/interfaces";

describe("Simulate Core", function () {
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
            value: "100000000000000000000000",
        });
    });
    it("Presale should not be started after deploy", async function () {
        expect(await enoki.presale.presaleStart()).to.be.equal(false);
    });
    it("Should not allow presale buys before presale start", async function () {
        await expect(
            enoki.deployer.sendTransaction({
                to: enoki.presale.address,
                value: utils.parseEther("1"),
            })
        ).to.be.reverted;
    });

    it("Should start presale & register start correctly", async function () {
        await enoki.devMultisig.execTransaction({
            to: enoki.presale.address,
            data: presaleIface.encodeFunctionData("startPresale"),
        });
    });
    it("Should allow presale buys from whilelist accounts", async function () {
        const balance = await jsonRpcProvider.getBalance(
            enoki.devFundPaymentSplitter.address
        );
        expect(balance).to.be.equal(utils.parseEther("0"));

        const isWhitelisted = await enoki.presale.whitelist(
            await deployer.getAddress()
        );
        expect(isWhitelisted).to.be.equal(true);

        await deployer.sendTransaction({
            to: enoki.presale.address,
            value: utils.parseEther("1"),
        });
    });
    it("Should not allow presale buys from not-whilelist accounts", async function () {
        const isWhitelisted = await enoki.presale.whitelist(await third.getAddress());
        expect(isWhitelisted).to.be.equal(false);

        await expect(
            third.sendTransaction({
                to: enoki.presale.address,
                value: utils.parseEther("1"),
            })
        ).to.be.reverted;
    });
    it("Payment splitter should recieve ETH on presale buy", async function () {
        const balance = await jsonRpcProvider.getBalance(
            enoki.devFundPaymentSplitter.address
        );
        expect(balance.toString()).to.be.equal(utils.parseEther("1").toString());
    });

    it("Payment splitter should successfully transfer ETH to DevMultisig and DevVesting on release", async function () {
        console.log(
            "startBalance",
            (
                await jsonRpcProvider.getBalance(enoki.devFundPaymentSplitter.address)
            ).toString()
        );
        await (
            await enoki.devFundPaymentSplitter.release(
                enoki.devMultisig.ethersContract.address
            )
        ).wait();

        console.log(
            "midBalance",
            (
                await jsonRpcProvider.getBalance(enoki.devFundPaymentSplitter.address)
            ).toString()
        );
        await (
            await enoki.devFundPaymentSplitter.release(enoki.devFundEthVesting.address)
        ).wait();

        console.log(
            "endBalance",
            (
                await jsonRpcProvider.getBalance(enoki.devFundPaymentSplitter.address)
            ).toString()
        );

        const paymentSplitterBalance = await jsonRpcProvider.getBalance(
            enoki.devFundPaymentSplitter.address
        );
        const devMultisigBalance = await jsonRpcProvider.getBalance(
            enoki.devMultisig.ethersContract.address
        );
        const devFundEthVestingBalance = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );
        expect(paymentSplitterBalance, "paymentSplitterBalance").to.be.equal(
            utils.parseEther("0")
        );
        expect(devMultisigBalance, "devMultisigBalance").to.be.equal(
            utils.parseEther("0.5")
        );
        expect(devFundEthVestingBalance, "devFundEthVestingBalance").to.be.equal(
            utils.parseEther("0.5")
        );
    });

    it("Payment splitter should recieve ETH on presale buy again", async function () {
        const paymentAmount = utils.parseEther("2");

        const beforeBalances = {
            eth: await jsonRpcProvider.getBalance(await deployer.getAddress()),
            spore: await enoki.sporeToken.balanceOf(await deployer.getAddress()),
        };

        await deployer.sendTransaction({
            to: enoki.presale.address,
            value: paymentAmount,
        });

        const afterBalances = {
            eth: await jsonRpcProvider.getBalance(await deployer.getAddress()),
            spore: await enoki.sporeToken.balanceOf(await deployer.getAddress()),
        };

        const balance = await jsonRpcProvider.getBalance(
            enoki.devFundPaymentSplitter.address
        );

        // Should only have ETH from this TX
        expect(balance.toString(), "devFundPaymentSplitter.balance").to.be.equal(
            paymentAmount.toString()
        );

        console.log("after second payment splitter run", {
            beforeEth: beforeBalances.eth.toString(),
            beforeSpore: beforeBalances.spore.toString(),
            afterEth: afterBalances.eth.toString(),
            afterSpore: afterBalances.spore.toString(),
            paymentSplitter: balance.toString(),
        });

        expect(afterBalances.eth.toString()).to.be.equal(
            beforeBalances.eth.sub(paymentAmount).toString()
        );
        expect(afterBalances.spore.toString()).to.be.equal(
            beforeBalances.spore.add(utils.parseEther("50")).toString()
        );
        // Cannot transfer yet
        expect(
            await enoki.sporeToken.transfer(
                enoki.devFundEthVesting.address,
                utils.parseEther("1")
            )
        ).to.be.reverted;
    });

    it("User should not be able to send more than 3 ETH total", async function () {
        await expect(
            deployer.sendTransaction({
                to: enoki.presale.address,
                value: utils.parseEther("1"),
            })
        ).to.be.reverted;
    });

    it("Payment splitter should successfully transfer ETH to DevMultisig and DevVesting on release again", async function () {
        await (
            await enoki.devFundPaymentSplitter.release(
                enoki.devMultisig.ethersContract.address
            )
        ).wait();
        await (
            await enoki.devFundPaymentSplitter.release(enoki.devFundEthVesting.address)
        ).wait();

        const paymentSplitterBalance = await jsonRpcProvider.getBalance(
            enoki.devFundPaymentSplitter.address
        );
        const devMultisigBalance = await jsonRpcProvider.getBalance(
            enoki.devMultisig.ethersContract.address
        );
        const devFundEthVestingBalance = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );
        expect(paymentSplitterBalance, "paymentSplitterBalance").to.be.equal(
            utils.parseEther("0")
        );
        expect(devMultisigBalance, "devMultisigBalance").to.be.equal(
            utils.parseEther("1.5")
        );
        expect(devFundEthVestingBalance, "devFundEthVestingBalance").to.be.equal(
            utils.parseEther("1.5")
        );
    });

    it("should be able to add to whitelist", async function () {
        const isWhitelistedBefore = await enoki.presale.whitelist(
            "0x829bd824b016326a401d083b33d092293333a830"
        );

        expect(isWhitelistedBefore).to.be.equal(false);

        await enoki.devMultisig.execTransaction({
            to: enoki.presale.address,
            data: presaleIface.encodeFunctionData("addToWhitelist", [
                ["0x829bd824b016326a401d083b33d092293333a830"],
            ]),
        });

        const isWhitelistedAfter = await enoki.presale.whitelist(
            "0x829bd824b016326a401d083b33d092293333a830"
        );

        expect(isWhitelistedAfter).to.be.equal(true);
    });

    it("should be able to seed initial liquidity", async function () {
        expect(await enoki.sporeToken.initialLiquidityManager()).to.be.equal(
            enoki.devMultisig.ethersContract.address
        );

        // Give to DevMultisig for LP tokens
        await deployer.sendTransaction({
            to: enoki.devMultisig.ethersContract.address,
            value: utils.parseEther("400"),
        });

        console.log("Approve SPORE on router..");
        await enoki.devMultisig.execTransaction({
            to: enoki.sporeToken.address,
            data: sporeTokenIface.encodeFunctionData("approve", [
                enoki.uniswapRouter.address,
                constants.MaxUint256,
            ]),
        });

        const approval = enoki.sporeToken.allowance(
            enoki.devMultisig.ethersContract.address,
            enoki.uniswapRouter.address
        );

        console.log("Check approval..");
        console.log("approval for router", approval.toString());

        console.log("Check balances..");
        const beforeBalances = {
            eth: await jsonRpcProvider.getBalance(
                enoki.devMultisig.ethersContract.address
            ),
            spore: await enoki.sporeToken.balanceOf(
                enoki.devMultisig.ethersContract.address
            ),
        };

        console.log("To Create Uniswap Pair..");
        const tx = await enoki.uniswapFactory.createPair(
            enoki.sporeToken.address,
            config.externalContracts.weth
        );
        const receipt = await tx.wait();
        console.log("Created Uniswap Pair..");

        console.log("Confirm LP Token..");
        // Find LP Token
        const lpTokenAddress = await enoki.uniswapFactory.getPair(
            enoki.sporeToken.address,
            config.externalContracts.weth
        );

        console.log("lpTokenAddress", lpTokenAddress);

        await enoki.devMultisig.execTransaction({
            to: enoki.sporeToken.address,
            data: sporeTokenIface.encodeFunctionData(
                "addInitialLiquidityTransferRights",
                [enoki.uniswapRouter.address]
            ),
        });

        await enoki.devMultisig.execTransaction({
            to: enoki.sporeToken.address,
            data: sporeTokenIface.encodeFunctionData(
                "addInitialLiquidityTransferRights",
                [lpTokenAddress]
            ),
        });

        await enoki.devMultisig.execTransaction({
            to: enoki.sporeToken.address,
            data: sporeTokenIface.encodeFunctionData(
                "addInitialLiquidityTransferRights",
                [enoki.uniswapRouter.address]
            ),
        });

        console.log("Add Liquidity..");
        const result = await enoki.devMultisig.execTransaction({
            to: enoki.uniswapRouter.address,
            value: utils.parseEther("300"),
            data: uniswapRouterIface.encodeFunctionData("addLiquidityETH", [
                enoki.sporeToken.address,
                utils.parseEther("5000"),
                utils.parseEther("0"),
                utils.parseEther("0"),
                enoki.lpTokenVesting.address,
                BigNumber.from(getCurrentTimestamp() + 10000000),
            ]),
        });

        console.log("Check after balances..");
        const afterBalances = {
            eth: await jsonRpcProvider.getBalance(
                enoki.devMultisig.ethersContract.address
            ),
            spore: await enoki.sporeToken.balanceOf(
                enoki.devMultisig.ethersContract.address
            ),
        };

        console.log("post liquidity add", {
            beforeEth: beforeBalances.eth.toString(),
            beforeSpore: beforeBalances.spore.toString(),
            afterEth: afterBalances.eth.toString(),
            afterSpore: afterBalances.spore.toString(),
        });

        expect(lpTokenAddress, "lpTokenAddress").to.not.be.equal(constants.AddressZero);

        // Transfer LP token for DAO TokenVesting
        console.log("Transfer LP token to DAO TokenVesting..");
        const lpToken = new Contract(lpTokenAddress, IERC20.abi, deployer);

        const balance = await lpToken.balanceOf(
            enoki.devMultisig.ethersContract.address
        );

        await enoki.devMultisig.execTransaction({
            to: lpToken.address,
            data: erc20Iface.encodeFunctionData("transfer", [
                enoki.lpTokenVesting.address,
                balance,
            ]),
        });

        const lpVestingBalance = await lpToken.balanceOf(enoki.lpTokenVesting.address);

        console.log("LP tokens", {
            multisig: balance.toString(),
            vesting: lpVestingBalance.toString(),
        });
    });

    it("Add and revoke addresses from Mission", async function () {
        await deployer.sendTransaction({
            to: enoki.devMultisig.ethersContract.address,
            value: utils.parseEther("5"),
        });

        await deployer.sendTransaction({
            to: await third.getAddress(),
            value: utils.parseEther("5"),
        });

        await enoki.devMultisig.execTransaction({
            to: enoki.sporeToken.address,
            data: sporeTokenIface.encodeFunctionData("enableTransfers"),
        });

        await (
            await enoki.sporeToken.transfer(
                enoki.devMultisig.ethersContract.address,
                utils.parseEther("1")
            )
        ).wait();

        expect(
            await enoki.missionsProxy.approved(await third.getAddress())
        ).to.be.equal(false);

        expect(await enoki.missionsProxy.owner()).to.be.equal(
            enoki.devMultisig.ethersContract.address
        );

        const result = await enoki.devMultisig.execTransaction({
            to: enoki.missionsProxy.address,
            data: missionIface.encodeFunctionData("approvePool", [
                await third.getAddress(),
            ]),
        });

        expect(
            await enoki.missionsProxy.approved(await third.getAddress())
        ).to.be.equal(true);

        console.log("attempt send spores");
        await (
            await enoki.missionsProxy
                .connect(third)
                .sendSpores(await deployer.getAddress(), utils.parseEther("100"))
        ).wait();

        const result2 = await enoki.devMultisig.execTransaction({
            to: enoki.missionsProxy.address,
            data: missionIface.encodeFunctionData("revokePool", [
                await third.getAddress(),
            ]),
        });

        expect(
            await enoki.missionsProxy.approved(await third.getAddress())
        ).to.be.equal(false);

        await expect(
            enoki.missionsProxy
                .connect(third)
                .sendSpores(await deployer.getAddress(), utils.parseEther("100"))
        ).to.be.reverted;

        await expect(
            enoki.missionsProxy.sendSpores(
                await deployer.getAddress(),
                utils.parseEther("100")
            )
        ).to.be.reverted;
    });

    it("should advance to farm time", async function () {
        await increaseTime(jsonRpcProvider, daysToSeconds(6).toNumber());
    });

    it("Should be able to move tokens to EnokiGeyser", async function () {
        const before = await enoki.enokiToken.balanceOf(
            enoki.enokiGeyserEscrow.address
        );
        expect(before, "before").to.be.equal(utils.parseEther("12600"));

        expect(
            await enoki.enokiGeyserEscrow.geyser(),
            "enokiGeyserEscrow.geyser()"
        ).to.be.equal(enoki.enokiGeyserProxy.address);

        const result = await enoki.devMultisig.execTransaction({
            to: enoki.enokiGeyserEscrow.address,
            data: geyserEscrowIface.encodeFunctionData("lockTokens", [
                utils.parseEther("12600"),
                daysToSeconds(30),
            ]),
        });

        const afterEscrow = await enoki.enokiToken.balanceOf(
            enoki.enokiGeyserEscrow.address
        );

        expect(afterEscrow, "after, escrow").to.be.equal(utils.parseEther("0"));
        expect(
            await enoki.enokiToken.balanceOf(enoki.enokiGeyserProxy.address)
        ).to.be.equal(utils.parseEther("12600"));
        expect(await enoki.enokiGeyserProxy.totalLocked()).to.be.equal(
            utils.parseEther("12600")
        );
    });

    it("Should not be able to use backupRelease yet", async function () {
        await expect(enoki.devFundEthVesting.backupRelease()).to.be.reverted;
    });

    it("Check that the correct amount of locked LP tokens can be claimed for DAO", async function () {
        const lpTokenAddress = await enoki.uniswapFactory.getPair(
            enoki.sporeToken.address,
            config.externalContracts.weth
        );

        console.log("lpTokenAddress", lpTokenAddress);

        const lpToken = new Contract(lpTokenAddress, IERC20.abi, deployer);

        console.log("Check lpTokenVesting before..");
        const lpBalanceBefore = await lpToken.balanceOf(enoki.lpTokenVesting.address);

        console.log(
            "vesting LP token balance before release",
            lpBalanceBefore.toString()
        );

        await (await enoki.lpTokenVesting.release(lpToken.address)).wait();

        console.log("Check lpTokenVesting after..");
        const lpBalanceAfter = await lpToken.balanceOf(enoki.lpTokenVesting.address);
        const daoBalanceAfter = await lpToken.balanceOf(enoki.enokiDaoAgent.address);

        console.log("lpBalanceAfter", lpBalanceAfter.toString());
        console.log("daoBalanceAfter", lpBalanceBefore.toString());
    });

    it("Check that correct amount of ETH can be released to DevMultisig", async function () {
        const vestingBalanceBefore = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );
        const multisigBalanceBefore = await jsonRpcProvider.getBalance(
            enoki.devMultisig.ethersContract.address
        );

        const tx = await enoki.devFundEthVesting.release();
        await tx.wait();

        const vestingBalanceAfter = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );
        const multisigBalanceAfter = await jsonRpcProvider.getBalance(
            enoki.devMultisig.ethersContract.address
        );

        console.log("balances", {
            vestingBalanceBefore: vestingBalanceBefore.toString(),
            multisigBalanceBefore: multisigBalanceBefore.toString(),
            vestingBalanceAfter: vestingBalanceAfter.toString(),
            multisigBalanceAfter: multisigBalanceAfter.toString(),
        });
    });

    it("EthVesting manual test", async function () {
        const before = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );

        await deployer.sendTransaction({
            to: enoki.devFundEthVesting.address,
            value: utils.parseEther("100"),
        });

        const after = await jsonRpcProvider.getBalance(enoki.devFundEthVesting.address);

        expect(after).to.be.equal(before.add(utils.parseEther("100")));
    });

    it("Payment splitter manual test", async function () {
        await deployer.sendTransaction({
            to: enoki.devFundPaymentSplitter.address,
            value: utils.parseEther("1000"),
        });

        let tx = await enoki.devFundPaymentSplitter.release(
            enoki.devFundEthVesting.address
        );
        tx.wait();

        tx = await enoki.devFundPaymentSplitter.release(
            enoki.devMultisig.ethersContract.address
        );
        tx.wait();
    });

    it("should advance past end of dev fund", async function () {
        await increaseTime(jsonRpcProvider, daysToSeconds(180).toNumber());
    });

    it("should be able to release entire dev fund", async function () {
        const beforeBalance = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );

        let tx = await enoki.devFundEthVesting.release();
        tx.wait();

        const afterBalance = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );

        console.log("final dev fund release", {
            beforeBalance: beforeBalance.toString(),
            afterBalance: afterBalance.toString(),
        });

        expect(afterBalance).to.be.equal(BigNumber.from(0));
    });

    it("should advance past end of liquidity unlock", async function () {
        await increaseTime(jsonRpcProvider, daysToSeconds(600).toNumber());
    });

    it("should be able to use backupRelease", async function () {
        await deployer.sendTransaction({
            to: enoki.devFundEthVesting.address,
            value: utils.parseEther("100"),
        });

        const beforeBalance = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );

        let tx = await enoki.devFundEthVesting.backupRelease();
        tx.wait();

        const afterBalance = await jsonRpcProvider.getBalance(
            enoki.devFundEthVesting.address
        );

        console.log("backup release test", {
            beforeBalance: beforeBalance.toString(),
            afterBalance: afterBalance.toString(),
        });
    });
});
