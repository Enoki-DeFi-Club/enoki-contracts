import {daysToSeconds, LaunchConfig} from "./config/launchConfig";
import {EnokiSystem} from "./systems/EnokiSystem";
import {BigNumber, utils} from "ethers";
import {expect} from "chai";
import { getCurrentTimestamp } from "./utils/timeUtils";

export async function confirmCore(enoki: EnokiSystem, config: LaunchConfig) {
    /*
        Spore Token
    */

    // SporeToken: initialLiquidityManager should be DevMultisig
    expect(
        await enoki.sporeToken.initialLiquidityManager(),
        "enoki.sporeToken.initialLiquidityManager()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);
    // SporeToken: DAO should be owner
    expect(await enoki.sporeToken.owner(), "enoki.sporeToken.owner()").to.be.equal(
        enoki.enokiDaoAgent.address
    );
    // SporeToken: DAO should be minter
    expect(await enoki.sporeToken.minters(enoki.enokiDaoAgent.address)).to.be.equal(
        true
    );
    // SporeToken: DevMultisig should not be minter
    expect(
        await enoki.sporeToken.minters(enoki.devMultisig.ethersContract.address)
    ).to.be.equal(false);

    /*
        Presale & Token Distribution
    */

    // Presale should be owned by DevMultisig
    expect(await enoki.presale.owner(), "enoki.presale.owner()").to.be.equal(
        enoki.devMultisig.ethersContract.address
    );

    // Presale recipient should be payment splitter
    expect(await enoki.presale.getDevAddress(), "enoki.presale.getDevAddress()").to.be.equal(
        enoki.devFundPaymentSplitter.address
    );

    // Presale token should be spore token
    expect(await enoki.presale.spore(), "enoki.presale.spore()").to.be.equal(
        enoki.sporeToken.address
    );

    // Presale should have 0 SPORE, will mint it
    expect(await enoki.sporeToken.balanceOf(enoki.presale.address)).to.be.equal(
        utils.parseEther("0")
    );

    // Dev Multisig should have 5000 SPORE
    expect(
        await enoki.sporeToken.balanceOf(enoki.devMultisig.ethersContract.address),
        "balanceOf(enoki.devMultisig.ethersContract.address)"
    ).to.be.equal(utils.parseEther("5000"));

    // Mission0 Escrow should have 210000 SPORE
    expect(
        await enoki.sporeToken.balanceOf(enoki.missionsProxy.address),
        "balanceOf(enoki.missionsProxy.address)"
    ).to.be.equal(utils.parseEther("210000"));

    // Total spore should be 230000 SPORE
    expect(await enoki.sporeToken.totalSupply()).to.be.equal(
        utils.parseEther("215000")
    );

    // GeyserEscrow should have 12600 ENOKI
    expect(await enoki.enokiToken.balanceOf(enoki.enokiGeyserEscrow.address), "enoki.enokiToken.balanceOf(enoki.enokiGeyserEscrow.address)").to.be.equal(
        utils.parseEther("12600")
    );

    // There should be 12600 ENOKI total
    expect(await enoki.enokiToken.totalSupply(), "enoki.enokiToken.totalSupply()").to.be.equal(utils.parseEther("12600"));

    /*
        Payment Splitter
    */

    // Expect first payee to be DevMultisig
    expect(await enoki.devFundPaymentSplitter.payee(0)).to.be.equal(
        enoki.devMultisig.ethersContract.address
    );

    // Expect second payee to be DevEthVesting
    expect(await enoki.devFundPaymentSplitter.payee(1)).to.be.equal(
        enoki.devFundEthVesting.address
    );

    // Expect both to have correct shares
    expect(await enoki.devFundPaymentSplitter.shares(enoki.devMultisig.ethersContract.address)).to.be.equal(
        config.paymentSplitter.share
    );

    expect(await enoki.devFundPaymentSplitter.shares(enoki.devFundEthVesting.address)).to.be.equal(
        config.paymentSplitter.share
    );

    /*
        Dev Eth Vesting
    */

    expect(
        await enoki.devFundEthVesting.beneficiary(),
        "enoki.devFundEthVesting.beneficiary()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    expect(
        await enoki.devFundEthVesting.backupBeneficiary(),
        "enoki.devFundEthVesting.backupBeneficiary()"
    ).to.be.equal(await enoki.deployer.getAddress());

    expect(await enoki.devFundEthVesting.duration(), "enoki.devFundEthVesting.duration()").to.be.equal(daysToSeconds(180));

    expect(await enoki.devFundEthVesting.backupReleaseGracePeriod(), "enoki.devFundEthVesting.backupReleaseGracePeriod()").to.be.equal(
        daysToSeconds(3)
    );

    /*
        Enoki Geyser & Escrow
    */

    // Ensure Geyser admin is DevMultisig
    expect(
        await enoki.enokiGeyserProxy.admin(),
        "enoki.enokiGeyserProxy.admin()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);
    // Ensure GeyserEscrow owner is DevMultisig
    expect(
        await enoki.enokiGeyserEscrow.owner(),
        "enoki.enokiGeyserEscrow.owner()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    // Ensure Geyser owner is GeyserEscrow
    expect(
        await enoki.enokiGeyserProxy.owner(),
        "enoki.enokiGeyserProxy.owner()"
    ).to.be.equal(enoki.enokiGeyserEscrow.address);

    // Ensure Geyser admin is DevMultisig
    expect(
        await enoki.enokiGeyserProxy.admin(),
        "enoki.enokiGeyserProxy.admin()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);
    // Geyser implmenetion should be Geyser logic
    expect(
        await enoki.proxyAdmin.getProxyImplementation(enoki.missionsProxy.address),
        "enoki.proxyAdmin.getProxyImplementation(enoki.missionsProxy.address)"
    ).to.be.equal(enoki.missionsLogic.address);
    // Ensure GeyserEscrow beneficiary is Geyser proxy
    expect(await enoki.enokiGeyserEscrow.geyser()).to.be.equal(
        enoki.enokiGeyserProxy.address
    );
    // Geyser should be managed by ProxyAdmin
    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.enokiGeyserProxy.address),
        "enoki.proxyAdmin.getProxyAdmin(enoki.enokiGeyserProxy.address)"
    ).to.be.equal(enoki.proxyAdmin.address);

    /*
        Mission 0
    */

    // Mission should be managed by ProxyAdmin
    expect(
        await enoki.proxyAdmin.getProxyAdmin(enoki.missionsProxy.address),
        "enoki.proxyAdmin.getProxyAdmin(enoki.missionsProxy.address)"
    ).to.be.equal(enoki.proxyAdmin.address);

    // Mission token should be SporeToken
    expect(
        await enoki.missionsProxy.sporeToken(),
        "enoki.missionsProxy.sporeToken()"
    ).to.be.equal(enoki.sporeToken.address);

    // Mission implementation should be Mission logic
    expect(
        await enoki.proxyAdmin.getProxyImplementation(enoki.enokiGeyserProxy.address),
        "enoki.proxyAdmin.getProxyImplementation(enoki.enokiGeyserProxy.address)"
    ).to.be.equal(enoki.enokiGeyserLogic.address);

    // Mission should be owned by DevMultisig
    expect(
        await enoki.missionsProxy.owner(),
        "enoki.missionsProxy.owner()"
    ).to.be.equal(enoki.devMultisig.ethersContract.address);

    /*
        LP Token Vesting
    */

    // Recipient of LP TokenVesting should be DAO agent
    expect(await enoki.lpTokenVesting.beneficiary(), "enoki.lpTokenVesting.beneficiary()").to.be.equal(enoki.enokiDaoAgent.address);

    // Duration of LP TokenVesting should correct
    expect(await enoki.lpTokenVesting.duration()).to.be.equal(
        daysToSeconds(720)
    );

    expect(await enoki.lpTokenVesting.revocable()).to.be.equal(false);

    // Recipient of Dev EthVesting should be DevMultisig
    expect(await enoki.devFundEthVesting.beneficiary(), "enoki.devFundEthVesting.beneficiary()").to.be.equal(
        enoki.devMultisig.ethersContract.address
    );

    /*
        Proxy Admin
    */

    // ProxyAdmin should be owned by DevMultisig
    expect(await enoki.proxyAdmin.owner(), "enoki.proxyAdmin.owner()").to.be.equal(
        enoki.devMultisig.ethersContract.address
    );
}
