import {daysToSeconds, LaunchConfig, WHALES} from "../config/launchConfig";
import {deployContract} from "ethereum-waffle";
import ethers, {
    Signer,
    Contract,
    providers,
    utils,
    constants,
    BigNumber,
    Overrides,
} from "ethers";

import SporeToken from "../../artifacts/SporeToken.json";
import SporePresale from "../../artifacts/SporePresale.json";

import GeyserEscrow from "../../artifacts/GeyserEscrow.json";

import EthVesting from "../../artifacts/EthVesting.json";
import ApprovedContractList from "../../artifacts/ApprovedContractList.json";

import TokenVesting from "../../artifacts/TokenVesting.json";
import PaymentSplitter from "../../artifacts/PaymentSplitter.json";

import Agent from "../../dependency-artifacts/aragon/Agent.json";
import MiniMeToken from "../../dependency-artifacts/aragon/MiniMeToken.json";

import EnokiGeyser from "../../artifacts/EnokiGeyser.json";
import Mission from "../../artifacts/Mission.json";
import MushroomMetadata from "../../artifacts/MushroomMetadata.json";

import ProxyAdmin from "../../dependency-artifacts/open-zeppelin-upgrades/ProxyAdmin.json";
import AdminUpgradeabilityProxy from "../../dependency-artifacts/open-zeppelin-upgrades/AdminUpgradeabilityProxy.json";

import UniswapV2Pair from "../../dependency-artifacts/uniswap/UniswapV2Pair.json";
import UniswapV2Router from "../../dependency-artifacts/uniswap/UniswapV2Router02.json";
import UniswapV2Factory from "../../dependency-artifacts/uniswap/UniswapV2Factory.json";

import whitelist from "../config/whitelist";

import {colors, LaunchFlags} from "../deploy/deployCore";
import {Multisig} from "../deploy/Multisig";
const Web3 = require("web3");
import dotenv from "dotenv";
import {getCurrentTimestamp} from "../timeUtils";
import {EnokiAddresses} from "../deploy/deployed";
dotenv.config();

export interface UniswapPool {
    assetName: string;
    contract: Contract;
}

export class EnokiSystem {
    sporeToken!: Contract;

    // Spore Distribution
    presale!: Contract;

    missionsEscrow!: Contract;
    missionsProxy!: Contract;
    missionsLogic!: Contract;

    lpTokenVesting!: Contract;

    approvedContractList!: Contract;

    // Enoki Distribution
    enokiGeyserEscrow!: Contract;
    enokiGeyserProxy!: Contract;
    enokiGeyserLogic!: Contract;

    // Governance
    enokiToken!: Contract;
    enokiDaoAgent!: Contract;

    // Dev Fund
    devFundPaymentSplitter!: Contract;
    devFundEthVesting!: Contract;
    devMultisig!: Multisig;

    // Uniswap
    uniswapFactory!: Contract;
    uniswapRouter!: Contract;
    uniswapPools!: UniswapPool[];

    // Proxy Admin
    proxyAdmin!: Contract;

    config!: LaunchConfig;
    deployer!: Signer;
    provider!: providers.Provider;

    flags!: LaunchFlags;

    fastGasPrice!: BigNumber;

    overrides!: any;

    deployerAddress!: string;
    web3: any;

    constructor(
        config: LaunchConfig,
        provider: providers.Provider,
        deployer: Signer,
        flags: LaunchFlags
    ) {
        this.config = config;
        this.deployer = deployer;
        this.provider = provider;
        this.deployer.getAddress().then((address) => (this.deployerAddress = address));

        // For local testnet fork, use --unlock option for accounts to sign with
        this.web3 = new Web3("http://localhost:8545");
        this.flags = flags;
        this.fastGasPrice = utils.parseUnits("170", "gwei");
        console.log(`Fast Gas Price: ${this.fastGasPrice.toString()}`);
        this.overrides = {
            gasPrice: this.fastGasPrice,
        };
    }

    static fromDeployed(
        config: LaunchConfig,
        provider: providers.Provider,
        deployer: Signer,
        flags: LaunchFlags,
        deployed: EnokiAddresses
    ): EnokiSystem {
        const enoki = new EnokiSystem(config, provider, deployer, flags);
        enoki.sporeToken= new Contract(deployed.sporeToken, SporeToken.abi,deployer);
        enoki.presale= new Contract(deployed.presale, SporePresale.abi,deployer);
        enoki.missionsProxy= new Contract(deployed.missionsProxy, Mission.abi,deployer);
        enoki.missionsLogic= new Contract(deployed.missionsLogic, Mission.abi,deployer);
        enoki.lpTokenVesting= new Contract(deployed.lpTokenVesting, TokenVesting.abi,deployer);
        enoki.approvedContractList= new Contract(deployed.approvedContractList, ApprovedContractList.abi,deployer);
        enoki.enokiGeyserEscrow= new Contract(deployed.enokiGeyserEscrow, GeyserEscrow.abi,deployer);
        enoki.enokiGeyserProxy= new Contract(deployed.sporeToken, EnokiGeyser.abi,deployer);
        enoki.enokiGeyserLogic= new Contract(deployed.sporeToken, EnokiGeyser.abi,deployer);
        enoki.enokiToken= new Contract(deployed.sporeToken, MiniMeToken.abi,deployer);
        enoki.enokiDaoAgent= new Contract(deployed.sporeToken, Agent.abi,deployer);
        enoki.devFundPaymentSplitter= new Contract(deployed.sporeToken, PaymentSplitter.abi,deployer);
        enoki.devFundEthVesting= new Contract(deployed.sporeToken, EthVesting.abi,deployer);
        enoki.devMultisig = Multisig.fromAddress(
            enoki.web3,
            provider,
            deployer,
            config.devMultisig.address,
            config.devMultisig.owners,
            flags.testmode
        );
        enoki.proxyAdmin= new Contract(deployed.sporeToken, SporeToken.abi,deployer);

        return enoki;
    }

    async connectEnokiDAO() {
        const {config, deployer} = this;

        console.log(`Deployer Address: ${await deployer.getAddress()}`);
        this.enokiDaoAgent = new Contract(
            config.externalContracts.enokiDaoAgent,
            Agent.abi,
            deployer
        );
        this.enokiToken = new Contract(
            config.externalContracts.enokiToken,
            MiniMeToken.abi,
            deployer
        );

        console.log(`Connected to Enoki DAO: 
            Agent ${this.enokiDaoAgent.address}
            Token ${this.enokiToken.address}
        `);
    }

    async connectUniswap() {
        const {config, deployer} = this;
        this.uniswapRouter = new Contract(
            config.externalContracts.uniswapV2Router,
            UniswapV2Router.abi,
            deployer
        );
        this.uniswapFactory = new Contract(
            config.externalContracts.uniswapV2Factory,
            UniswapV2Factory.abi,
            deployer
        );
    }

    async deployProxyAdmin() {
        const {config, deployer} = this;
        this.proxyAdmin = await deployContract(
            deployer,
            ProxyAdmin,
            undefined,
            this.overrides
        );

        await (
            await this.proxyAdmin.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        console.log(`Deployed Proxy Admin: 
            ${this.proxyAdmin.address}
        `);
    }

    async deployApprovedContractList() {
        const {config, deployer} = this;
        this.approvedContractList = await deployContract(
            deployer,
            ApprovedContractList,
            undefined,
            this.overrides
        );

        await (
            await this.approvedContractList.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        console.log(`Deployed Approved Contracts List: 
            ${this.approvedContractList.address}
        `);
    }

    async deploySporeToken() {
        const {config, deployer} = this;
        this.sporeToken = await deployContract(
            deployer,
            SporeToken,
            [this.devMultisig.ethersContract.address],
            this.overrides
        );

        console.log(`Deployed Spore Token: 
            ${this.sporeToken.address}
        `);
    }

    async mintInitialSporeTokens() {
        const {config, deployer} = this;

        await (
            await this.sporeToken.mint(
                this.devMultisig.ethersContract.address,
                config.sporeDistribution.initialLiquidity,
                this.overrides
            )
        ).wait();

        await (
            await this.sporeToken.mint(
                this.missionsProxy.address,
                config.sporeDistribution.mission0,
                this.overrides
            )
        ).wait();
    }

    async lockEnokiInGeyserEscrow() {
        const {config, deployer} = this;
        await (
            await this.enokiToken.transfer(
                this.enokiGeyserEscrow.address,
                config.enokiDistribution.geyserAmount,
                this.overrides
            )
        ).wait();
    }

    async finalizeSporeTokenPermissions() {
        const {config, deployer} = this;

        await (
            await this.sporeToken.addMinter(this.enokiDaoAgent.address, this.overrides)
        ).wait();
        await (
            await this.sporeToken.addMinter(this.presale.address, this.overrides)
        ).wait();

        await (
            await this.sporeToken.removeMinter(
                await deployer.getAddress(),
                this.overrides
            )
        ).wait();

        await (
            await this.sporeToken.transferOwnership(
                this.enokiDaoAgent.address,
                this.overrides
            )
        ).wait();
    }

    async transferPresaleToMultisig() {
        await (
            await this.presale.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();
    }

    async deployPresale() {
        const {config, deployer} = this;
        this.presale = await deployContract(
            deployer,
            SporePresale,
            [this.devFundPaymentSplitter.address, this.sporeToken.address],
            this.overrides
        );

        console.log(`Deployed Presale: 
            ${this.presale.address}
        `);
    }

    async deployMission0() {
        const {config, deployer} = this;
        this.missionsLogic = await deployContract(
            deployer,
            Mission,
            undefined,
            this.overrides
        );

        const iface = new utils.Interface(Mission.abi);
        const encoded = iface.encodeFunctionData("initialize", [
            this.sporeToken.address,
        ]);

        const proxy = await deployContract(
            deployer,
            AdminUpgradeabilityProxy,
            [this.missionsLogic.address, this.proxyAdmin.address, encoded],
            this.overrides
        );

        // Interpret as Logic
        this.missionsProxy = new Contract(proxy.address, Mission.abi, deployer);

        console.log("owner", await this.missionsProxy.owner());
        await (
            await this.missionsProxy.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        console.log(`Deployed Mission0
            Proxy: ${this.missionsProxy.address}
            Logic: ${this.missionsLogic.address}
        `);
    }

    async deployEnokiGeyser() {
        const {config, deployer} = this;
        this.enokiGeyserLogic = await deployContract(
            deployer,
            EnokiGeyser,
            undefined,
            this.overrides
        );

        const iface = new utils.Interface(EnokiGeyser.abi);
        const encoded = iface.encodeFunctionData("initialize", [
            this.enokiToken.address,
            config.geyserParams.maxUnlockSchedules,
            config.geyserParams.startBonus,
            config.geyserParams.bonusPeriodSec,
            config.geyserParams.initialSharesPerToken,
            config.geyserParams.maxStakesPerAddress,
            this.devMultisig.ethersContract.address,
            config.geyserParams.devRewardPercentage,
            this.approvedContractList.address,
            this.devMultisig.ethersContract.address,
        ]);

        const proxy = await deployContract(
            deployer,
            AdminUpgradeabilityProxy,
            [this.enokiGeyserLogic.address, this.proxyAdmin.address, encoded],
            this.overrides
        );

        // Interpret as Logic
        this.enokiGeyserProxy = new Contract(proxy.address, EnokiGeyser.abi, deployer);

        console.log(`Deployed EnokiGeyser
            Proxy: ${this.enokiGeyserProxy.address}
            Logic: ${this.enokiGeyserLogic.address}
        `);
    }

    async deployLpVesting(duration: BigNumber) {
        const {config, deployer} = this;

        this.lpTokenVesting = await deployContract(
            deployer,
            TokenVesting,
            [
                this.enokiDaoAgent.address,
                getCurrentTimestamp(),
                config.lpTokenVesting.cliff,
                duration,
                false,
            ],
            this.overrides
        );

        console.log(`Deployed LpTokenVesting
            ${this.lpTokenVesting.address}`);
    }

    async deployVestingInfrastructure() {
        const {config, deployer} = this;
        this.devFundEthVesting = await deployContract(
            deployer,
            EthVesting,
            [
                this.devMultisig.ethersContract.address,
                await deployer.getAddress(),
                getCurrentTimestamp(),
                config.devFundEthVesting.cliff,
                config.devFundEthVesting.duration,
                daysToSeconds(3),
            ],
            this.overrides
        );

        this.devFundPaymentSplitter = await deployContract(
            deployer,
            PaymentSplitter,
            [
                [
                    this.devMultisig.ethersContract.address,
                    this.devFundEthVesting.address,
                ],
                [config.paymentSplitter.share, config.paymentSplitter.share],
            ],
            this.overrides
        );

        this.enokiGeyserEscrow = await deployContract(
            deployer,
            GeyserEscrow,
            [this.enokiGeyserProxy.address],
            this.overrides
        );

        await (
            await this.enokiGeyserEscrow.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        await (
            await this.enokiGeyserProxy.transferOwnership(
                this.enokiGeyserEscrow.address,
                this.overrides
            )
        ).wait();

        this.lpTokenVesting = await deployContract(
            deployer,
            TokenVesting,
            [
                this.enokiDaoAgent.address,
                getCurrentTimestamp(),
                config.lpTokenVesting.cliff,
                config.lpTokenVesting.duration,
                false,
            ],
            this.overrides
        );

        console.log(`Deployed DevEthVesting at
            ${this.devFundEthVesting.address}`);

        console.log(`Deployed DevPaymentSpliter
            ${this.devFundPaymentSplitter.address}`);

        console.log(`Connect ENOKI Geyser Escrow at
            ${this.enokiGeyserEscrow.address}`);

        console.log(`Deployed LpTokenVesting
            ${this.lpTokenVesting.address}`);
    }

    async connectSporeToken() {
        const {config, deployer} = this;
        this.sporeToken = new Contract(
            config.externalContracts.sporeToken,
            SporeToken.abi,
            deployer
        );
        console.log(`Connect to SPORE Token at
        ${this.sporeToken.address}`);
    }

    async connectDevMultisig() {
        if (this.flags.testmode) {
            this.devMultisig = await Multisig.deployTest(
                this.web3,
                this.provider,
                this.deployer,
                this.config.externalContracts.gnosisProxyFactory,
                this.config.devMultisig.owners
            );

            console.log(`Deployed test DevMultisig at
                ${this.devMultisig.ethersContract.address}`);
        } else {
            this.devMultisig = Multisig.fromAddress(
                this.web3,
                this.provider,
                this.deployer,
                this.config.devMultisig.address,
                this.config.devMultisig.owners,
                this.flags.testmode
            );

            console.log(`Connect to DevMultisig at
                ${this.devMultisig.ethersContract.address}`);
        }
    }

    async populateWhitelist() {
        const sectionSize = 50;
        const whitelistSections = 4;
        for (let i = 0; i < whitelistSections; i++) {
            const start = 0 + 50 * i;
            const dataset = whitelist.slice(start, start + 49);
            console.log(`Set ${i}:
                ${dataset}`);
            await (await this.presale.addToWhitelist(dataset, this.overrides)).wait();
        }
    }
}
