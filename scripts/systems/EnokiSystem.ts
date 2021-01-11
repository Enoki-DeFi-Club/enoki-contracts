import {
    daysToSeconds,
    LaunchConfig,
    MushroomType,
    WHALES,
    WHALE_AMOUNT,
} from "../config/launchConfig";
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
import {expect} from "chai";

import SporeToken from "../../artifacts/SporeToken.json";
import SporePresale from "../../artifacts/SporePresale.json";

import GeyserEscrow from "../../artifacts/GeyserEscrow.json";

import EthVesting from "../../artifacts/EthVesting.json";
import BannedContractList from "../../artifacts/BannedContractList.json";
import SporePoolEth from "../../artifacts/SporePoolEth.json";

import TokenVesting from "../../artifacts/TokenVesting.json";
import PaymentSplitter from "../../artifacts/PaymentSplitter.json";
import SporePool from "../../artifacts/SporePool.json";
import MushroomFactory from "../../artifacts/MushroomFactory.json";
import MushroomNFT from "../../artifacts/MushroomNFT.json";
import RateVote from "../../artifacts/RateVote.json";

import Agent from "../../dependency-artifacts/aragon/Agent.json";
import MiniMeToken from "../../dependency-artifacts/aragon/MiniMeToken.json";

import EnokiGeyser from "../../artifacts/EnokiGeyser.json";
import Mission from "../../artifacts/Mission.json";
import MetadataResolver from "../../artifacts/MetadataResolver.json";
import MushroomAdapter from "../../artifacts/MushroomAdapter.json";

import ProxyAdmin from "../../dependency-artifacts/open-zeppelin-upgrades/ProxyAdmin.json";
import AdminUpgradeabilityProxy from "../../dependency-artifacts/open-zeppelin-upgrades/AdminUpgradeabilityProxy.json";

import UniswapV2Pair from "../../dependency-artifacts/uniswap/UniswapV2Pair.json";
import UniswapV2Router from "../../dependency-artifacts/uniswap/UniswapV2Router02.json";
import UniswapV2Factory from "../../dependency-artifacts/uniswap/UniswapV2Factory.json";
import MushroomLifespanMock from "../../artifacts/MushroomLifespanMock.json";
import CentralizedRateVote from "../../artifacts/CentralizedRateVote.json";

import whitelist from "../config/whitelist";

import {colors, LaunchFlags} from "../deploy/deployCore";
const fs = require("fs");
import {Multisig} from "../deploy/Multisig";
const Web3 = require("web3");
import dotenv from "dotenv";
import {getCurrentTimestamp} from "../utils/timeUtils";
import {EnokiAddresses} from "../deploy/deployed";
dotenv.config();

export const LIFESPAN_MODIFIER_ROLE = utils.keccak256(
    utils.toUtf8Bytes("LIFESPAN_MODIFIER_ROLE")
);
export const LIFESPAN_MODIFY_REQUEST_ROLE = utils.keccak256(
    utils.toUtf8Bytes("LIFESPAN_MODIFY_REQUEST_ROLE")
);
export const MINTER_ROLE = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));
export const DEFAULT_ADMIN_ROLE = utils.keccak256(
    utils.toUtf8Bytes("DEFAULT_ADMIN_ROLE")
);

import {
    sporePoolIface,
    mushroomFactoryIface,
    proxyAdminIface,
    bannedContractListIface,
    mushroomNftIface,
    metadataResolverIface,
    mushroomAdapterIface,
    missionIface,
    geyserEscrowIface,
    rateVoteIFace,
    centralizedRateVoteIface,
} from "../utils/interfaces";
import {BN, ETH} from "../utils/shorthand";

export interface UniswapPool {
    assetName: string;
    contract: Contract;
}

export interface SporePoolEntry {
    assetName: string;
    assetAddress: string;
    sporePool: Contract;
    mushroomFactory: Contract;
    rateVote: Contract;
}

export class EnokiSystem {
    sporeToken!: Contract;

    // Spore Distribution
    presale!: Contract;

    missionsEscrow!: Contract;
    missionsProxy!: Contract;
    missionsLogic!: Contract;

    lpTokenVesting!: Contract;

    sporePoolLogic!: Contract;
    sporePoolEthLogic!: Contract;
    mushroomFactoryLogic!: Contract;
    rateVoteLogic!: Contract;

    mushroomNftLogic!: Contract;
    mushroomNftProxy!: Contract;

    metadataResolverLogic!: Contract;
    metadataResolverProxy!: Contract;

    mushroomAdapterLogic!: Contract;
    mushroomAdapterProxy!: Contract;

    centralizedRateVoteLogic!: Contract;
    centralizedRateVoteProxy!: Contract;

    bannedContractLogic!: Contract;
    bannedContractProxy!: Contract;

    missionPools!: SporePoolEntry[];

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
        // this.web3 = new Web3(process.env.FORKNET_NODE_URL);
        this.flags = flags;
        this.fastGasPrice = utils.parseUnits("92", "gwei");
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
        file: string
    ): EnokiSystem {
        const enoki = new EnokiSystem(config, provider, deployer, flags);

        const rawdata = fs.readFileSync(file);
        const deployed = JSON.parse(rawdata);

        enoki.sporeToken = new Contract(deployed.sporeToken, SporeToken.abi, deployer);
        enoki.presale = new Contract(deployed.presale, SporePresale.abi, deployer);

        enoki.missionsProxy = new Contract(
            deployed.missionsProxy,
            Mission.abi,
            deployer
        );

        enoki.missionsLogic = new Contract(
            deployed.missionsLogic,
            Mission.abi,
            deployer
        );
        enoki.lpTokenVesting = new Contract(
            deployed.lpTokenVesting,
            TokenVesting.abi,
            deployer
        );

        enoki.bannedContractProxy = new Contract(
            deployed.bannedContractProxy,
            BannedContractList.abi,
            deployer
        );
        enoki.bannedContractLogic = new Contract(
            deployed.bannedContractLogic,
            BannedContractList.abi,
            deployer
        );

        enoki.sporePoolLogic = new Contract(
            deployed.sporePoolLogic,
            SporePool.abi,
            deployer
        );
        enoki.sporePoolEthLogic = new Contract(
            deployed.sporePoolEthLogic,
            SporePoolEth.abi,
            deployer
        );

        enoki.mushroomFactoryLogic = new Contract(
            deployed.mushroomFactoryLogic,
            MushroomFactory.abi,
            deployer
        );

        enoki.rateVoteLogic = new Contract(
            deployed.rateVoteLogic,
            RateVote.abi,
            deployer
        );

        enoki.enokiGeyserEscrow = new Contract(
            deployed.enokiGeyserEscrow,
            GeyserEscrow.abi,
            deployer
        );
        enoki.enokiGeyserProxy = new Contract(
            deployed.enokiGeyserProxy,
            EnokiGeyser.abi,
            deployer
        );
        enoki.enokiGeyserLogic = new Contract(
            deployed.enokiGeyserLogic,
            EnokiGeyser.abi,
            deployer
        );

        enoki.enokiToken = new Contract(deployed.enokiToken, MiniMeToken.abi, deployer);
        enoki.enokiDaoAgent = new Contract(deployed.enokiDaoAgent, Agent.abi, deployer);

        enoki.devFundPaymentSplitter = new Contract(
            deployed.devFundPaymentSplitter,
            PaymentSplitter.abi,
            deployer
        );
        enoki.devFundEthVesting = new Contract(
            deployed.devFundEthVesting,
            EthVesting.abi,
            deployer
        );

        enoki.devMultisig = Multisig.fromAddress(
            enoki.web3,
            provider,
            deployer,
            config.devMultisig.address,
            config.devMultisig.owners,
            flags.testmode
        );
        enoki.proxyAdmin = new Contract(deployed.proxyAdmin, ProxyAdmin.abi, deployer);

        enoki.mushroomNftProxy = new Contract(
            deployed.mushroomNftProxy,
            MushroomNFT.abi,
            deployer
        );
        enoki.mushroomNftLogic = new Contract(
            deployed.mushroomNftLogic,
            MushroomNFT.abi,
            deployer
        );

        enoki.metadataResolverProxy = new Contract(
            deployed.metadataResolverProxy,
            MetadataResolver.abi,
            deployer
        );
        enoki.metadataResolverLogic = new Contract(
            deployed.metadataResolverLogic,
            MetadataResolver.abi,
            deployer
        );

        enoki.mushroomAdapterProxy = new Contract(
            deployed.mushroomAdapterProxy,
            MushroomAdapter.abi,
            deployer
        );
        enoki.mushroomAdapterLogic = new Contract(
            deployed.mushroomAdapterLogic,
            MushroomAdapter.abi,
            deployer
        );

        enoki.centralizedRateVoteLogic = new Contract(
            deployed.centralizedRateVoteLogic,
            CentralizedRateVote.abi,
            deployer
        );
        enoki.centralizedRateVoteProxy = new Contract(
            deployed.centralizedRateVoteProxy,
            CentralizedRateVote.abi,
            deployer
        );

        enoki.missionPools = [];

        for (const pool of deployed.missionPools) {
            enoki.missionPools.push({
                assetAddress: pool.assetAddress,
                assetName: pool.assetName,
                sporePool: new Contract(pool.sporePool, SporePool.abi, deployer),
                mushroomFactory: new Contract(
                    pool.mushroomFactory,
                    MushroomFactory.abi,
                    deployer
                ),
                rateVote: new Contract(pool.rateVote, RateVote.abi, deployer),
            });
        }

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

    async deployCentralizedRateVote() {
        const {logic, proxy} = await this.deployLogicAndProxy(
            CentralizedRateVote,
            centralizedRateVoteIface.encodeFunctionData("initialize")
        );

        this.centralizedRateVoteProxy = proxy;
        this.centralizedRateVoteLogic = logic;

        console.log(`Deployed Centralized Rate Vote
            centralizedRateVoteProxy: ${this.centralizedRateVoteProxy.address}
            centralizedRateVoteLogic: ${this.centralizedRateVoteLogic.address}
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

    async distributeTestAssets(recipients: string[]) {
        const {config, deployer, web3} = this;

        // Create a web3 contract instance for asset address, if not ETH
        // Transfer from whale to the recipients (special for ETH)

        for (const poolConfig of config.pools) {
            // Only some assets have whales defined
            if (!WHALES[poolConfig.assetName]) {
                continue;
            }

            // Ensure All Whales have ETH
            if (poolConfig.assetName !== "ETH") {
                await web3.eth.sendTransaction({
                    from: WHALES["ETH"],
                    to: WHALES[poolConfig.assetName],
                    value: utils.parseEther("5").toString(),
                });
            }

            console.log(poolConfig.assetName);
            if (poolConfig.assetName === "ETH") {
                for (const recipient of recipients) {
                    const amount = WHALE_AMOUNT["ETH"].div(recipients.length);
                    await web3.eth.sendTransaction({
                        from: WHALES["ETH"],
                        to: recipient,
                        value: amount.toString(),
                    });

                    console.log(
                        `Distributed ${utils.formatEther(amount)} test ${
                            poolConfig.assetName
                        } to ${recipient}`
                    );
                }
            } else {
                const token = new web3.eth.Contract(
                    SporeToken.abi,
                    poolConfig.assetAddress
                );

                const whaleBalance = await token.methods.balanceOf(
                    WHALES[poolConfig.assetName]
                );
                console.log("whaleBalance", whaleBalance.toString());

                for (const recipient of recipients) {
                    const amount = WHALE_AMOUNT[poolConfig.assetName].div(
                        recipients.length
                    );
                    await token.methods
                        .transfer(recipient, amount.toString())
                        .send({from: WHALES[poolConfig.assetName]});

                    console.log(
                        `Distributed ${utils.formatEther(amount)} test ${
                            poolConfig.assetName
                        } to ${recipient}`
                    );
                }
            }
        }
    }

    async deployMushroomMock() {
        const {config, deployer} = this;

        const mock = await deployContract(
            deployer,
            MushroomLifespanMock,
            undefined,
            this.overrides
        );

        console.log(`Grant minting role to deployMushroomMock...
            ${mock.address}`);

        console.log(await this.mushroomNftProxy.owner());

        await (await this.mushroomNftProxy.grantRole(MINTER_ROLE, mock.address)).wait();

        await (
            await this.mushroomNftProxy.grantRole(LIFESPAN_MODIFIER_ROLE, mock.address)
        ).wait();

        const res1 = await this.devMultisig.execDirectly(
            {
                to: this.mushroomNftProxy.address,
                data: mushroomNftIface.encodeFunctionData("grantRole", [
                    MINTER_ROLE,
                    mock.address,
                ]),
            },
            deployer
        );

        console.log(res1);

        // expect(res1).to.be.equal('ExecutionSuccess');

        const res2 = await this.devMultisig.execDirectly(
            {
                to: this.mushroomNftProxy.address,
                data: mushroomNftIface.encodeFunctionData("grantRole", [
                    LIFESPAN_MODIFIER_ROLE,
                    mock.address,
                ]),
            },
            deployer
        );

        console.log(res2);

        // expect(res2).to.be.equal('ExecutionSuccess');

        console.log("Granted minting role to deployMushroomMock...");

        console.log((await this.provider.getBalance(this.deployerAddress)).toString());

        await this.devMultisig.execDirectly(
            {
                to: this.mushroomNftProxy.address,
                data: mushroomNftIface.encodeFunctionData("grantRole", [
                    LIFESPAN_MODIFIER_ROLE,
                    await deployer.getAddress(),
                ]),
            },
            deployer
        );
    }

    async transferEnokiGeyserAdmin() {
        const {config, deployer} = this;

        console.log("Transfer Geyser to Multisig...");
        await (
            await this.enokiGeyserProxy.grantRole(
                DEFAULT_ADMIN_ROLE,
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        await (
            await this.enokiGeyserProxy.renounceRole(
                DEFAULT_ADMIN_ROLE,
                await this.deployer.getAddress(),
                this.overrides
            )
        ).wait();
    }

    async sendEnokiToGeyser() {
        const {config, deployer} = this;

        const result = await this.devMultisig.execDirectly(
            {
                to: this.enokiGeyserEscrow.address,
                data: geyserEscrowIface.encodeFunctionData("lockTokens", [
                    ETH("12600"),
                    daysToSeconds(60),
                ]),
            },
            deployer
        );

        console.log(result);
        console.log("Enoki Sent to Geyser!");
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

    getSpeciesDataById(id: BigNumber): MushroomType {
        const species = this.config.species.find((species) => species.speciesId.eq(id));

        if (!species) {
            throw new Error(`Species with id ${id.toString()} not found`);
        }
        return species;
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
            this.bannedContractProxy.address,
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

        const deployTime = getCurrentTimestamp() + 100;
        this.lpTokenVesting = await deployContract(
            deployer,
            TokenVesting,
            [
                this.enokiDaoAgent.address,
                deployTime,
                config.lpTokenVesting.cliff,
                duration,
                false,
            ],
            this.overrides
        );

        console.log(`Deployed LpTokenVesting
            contract: ${this.lpTokenVesting.address}
            beneficiary: ${this.enokiDaoAgent.address}
            start: ${deployTime.toString()}
            cliff: ${config.lpTokenVesting.cliff.toString()}
            duration: ${duration.toString()}
            revocable: ${false}
        `);
    }

    /*
        Ownership: deployer
        Admin: proxyAdmin
    */
    async deployLogicAndProxy(
        Artifact: any,
        initParams: string
    ): Promise<{logic: Contract; proxy: Contract}> {
        const {deployer} = this;
        const logic = await deployContract(
            deployer,
            Artifact,
            undefined,
            this.overrides
        );
        const proxy = await deployContract(
            deployer,
            AdminUpgradeabilityProxy,
            [logic.address, this.proxyAdmin.address, initParams],
            this.overrides
        );

        const encodedProxy = new Contract(proxy.address, Artifact.abi, deployer);

        return {
            logic: logic,
            proxy: encodedProxy,
        };
    }

    async deployMushroomNft() {
        const {logic, proxy} = await this.deployLogicAndProxy(
            MushroomNFT,
            mushroomNftIface.encodeFunctionData("initialize")
        );

        this.mushroomNftProxy = proxy;
        this.mushroomNftLogic = logic;

        console.log(`Deployed Mushroom NFT
            mushroomNftProxy: ${this.mushroomNftProxy.address}
            mushroomNftLogic: ${this.mushroomNftLogic.address}
        `);

        expect(
            await this.proxyAdmin.getProxyImplementation(this.mushroomNftProxy.address)
        ).to.be.equal(this.mushroomNftLogic.address);
    }

    /*
        - Add all initial species to Mushroom NFT
        - Set MetadataResolver on Geyser
        - Lifespan permissions to EnokiGeyser
        - Minting & lifespan permissions to all MushroomFactories
    */
    async setupMushroomInfra() {
        const {config, deployer} = this;

        console.log(`Number of Pools to setup: ${this.missionPools.length}`);

        for (const pool of this.missionPools) {
            await (
                await this.mushroomNftProxy.grantRole(
                    LIFESPAN_MODIFIER_ROLE,
                    pool.mushroomFactory.address,
                    this.overrides
                )
            ).wait();

            console.log(`Granted LIFESPAN_MODIFIER_ROLE to MushroomFactory: 
                ${pool.assetName} 
                ${pool.mushroomFactory.address}
            `);

            await (
                await this.mushroomNftProxy.grantRole(
                    MINTER_ROLE,
                    pool.mushroomFactory.address,
                    this.overrides
                )
            ).wait();

            console.log(`Granted MINTER_ROLE to MushroomFactory: 
                ${pool.assetName} 
                ${pool.mushroomFactory.address}
            `);
        }

        await (
            await this.mushroomNftProxy.grantRole(
                LIFESPAN_MODIFIER_ROLE,
                this.mushroomAdapterProxy.address,
                this.overrides
            )
        ).wait();

        console.log(`Granted LIFESPAN_MODIFIER_ROLE to MushroomAdapter:
            ${this.mushroomAdapterProxy.address}
        `);

        // console.log(`Allow EnokiGeyser to set lifespans via MetadataResolver...`);
        // await (
        //     await this.metadataResolverProxy.grantRole(
        //         LIFESPAN_MODIFY_REQUEST_ROLE,
        //         this.enokiGeyserProxy.address
        //     )
        // ).wait();

        // console.log(`Setting MetadataResolver on EnokiGeyser...`);
        // await (
        //     await this.enokiGeyserProxy.setmetadataResolver(
        //         this.metadataResolverProxy.address
        //     )
        // ).wait();

        console.log(`Setting MetadataResolver resolver for MushroomNFT...`);
        await (
            await this.metadataResolverProxy.setResolver(
                this.mushroomNftProxy.address,
                this.mushroomAdapterProxy.address,
                this.overrides
            )
        ).wait();
    }

    async setupSpecies() {
        const {config, deployer} = this;

        for (const species of config.species) {
            console.log("   Setting Species Type");
            await (
                await this.mushroomNftProxy.setMushroomType(
                    species.speciesId,
                    [
                        species.speciesId,
                        species.strength,
                        species.minLifespan,
                        species.maxLifespan,
                        BN(0),
                        species.cap,
                    ],
                    this.overrides
                )
            ).wait();

            const composedUri = `https://ipfs.infura.io:5001/api/v0/cat/${species.ipfsUri}`;

            console.log("   Setting Species URI");
            await (
                await this.mushroomNftProxy.setSpeciesUri(
                    species.speciesId,
                    composedUri,
                    this.overrides
                )
            ).wait();

            console.log(`Added Mushroom Species ${species.speciesName}
                id ${species.speciesId.toString()}
                strength ${species.strength.toString()}
                minLifespan ${species.minLifespan.toString()}
                maxLifespan ${species.maxLifespan.toString()}
                minted ${BN(0).toString()}
                cap ${species.cap.toString()}
                ipfsUri ${species.ipfsUri}
                finalUrl ${composedUri}
            `);
        }
    }

    async managePermissions() {
        // console.log(`Transferring EnokiGeyser admin rights to Dev Multisig...`);
        // await (
        //     await this.enokiGeyserProxy.transferAdmin(
        //         this.devMultisig.ethersContract.address
        //     )
        // ).wait();

        console.log(`Transferring MetadataResolver admin to Dev Multisig...`);
        await (
            await this.metadataResolverProxy.grantRole(
                DEFAULT_ADMIN_ROLE,
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        await (
            await this.metadataResolverProxy.renounceRole(
                DEFAULT_ADMIN_ROLE,
                await this.deployer.getAddress(),
                this.overrides
            )
        ).wait();

        console.log(`Transferring MushroomNFT ownership to Dev Multisig...`);
        await (
            await this.mushroomNftProxy.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        console.log(`Ownership transfers complete`);
    }

    async deploymetadataResolverInfra() {
        console.log(`Deploy metadataResolver`);
        const metadataResolver = await this.deployLogicAndProxy(
            MetadataResolver,
            metadataResolverIface.encodeFunctionData("initialize", [
                this.enokiGeyserProxy.address,
            ])
        );

        this.metadataResolverProxy = metadataResolver.proxy;
        this.metadataResolverLogic = metadataResolver.logic;

        console.log(`Deploy mushroomAdapter`);
        // Native mushroom resolver
        const mushroomAdapter = await this.deployLogicAndProxy(
            MushroomAdapter,
            mushroomAdapterIface.encodeFunctionData("initialize", [
                this.mushroomNftProxy.address,
                this.metadataResolverProxy.address,
            ])
        );

        this.mushroomAdapterProxy = mushroomAdapter.proxy;
        this.mushroomAdapterLogic = mushroomAdapter.logic;

        console.log(`Deployed Mushroom Metadata Infra
            metadataResolverProxy: ${this.metadataResolverProxy.address}
            metadataResolverLogic: ${this.metadataResolverLogic.address}
            mushroomAdapterProxy: ${this.mushroomAdapterProxy.address}
            mushroomAdapterLogic: ${this.mushroomAdapterLogic.address}
        `);

        console.log(`Confirm MetadataResolver impl...`);
        expect(
            await this.proxyAdmin.getProxyImplementation(
                this.metadataResolverProxy.address
            )
        ).to.be.equal(this.metadataResolverLogic.address);

        console.log(`Confirm MushroomAdapter impl...`);
        expect(
            await this.proxyAdmin.getProxyImplementation(
                this.mushroomAdapterProxy.address
            )
        ).to.be.equal(this.mushroomAdapterLogic.address);
    }

    // Deploy Banned contract list, transfer ownership to Dev multisig
    async deployBannedContractList() {
        const {logic, proxy} = await this.deployLogicAndProxy(
            BannedContractList,
            bannedContractListIface.encodeFunctionData("initialize")
        );

        this.bannedContractProxy = proxy;
        this.bannedContractLogic = logic;

        console.log(`Deployed Banned Contract List
            bannedContractProxy: ${this.bannedContractProxy.address}
            bannedContractLogic: ${this.bannedContractLogic.address}
        `);

        await (
            await this.bannedContractProxy.transferOwnership(
                this.devMultisig.ethersContract.address,
                this.overrides
            )
        ).wait();

        console.log(`Transferred ownership of Banned Contract List to multisig
                ${this.devMultisig.ethersContract.address}
        `);
    }

    async deployLogicUpgrades() {
        const {config, deployer} = this;

        this.sporePoolLogic = await deployContract(
            deployer,
            SporePool,
            undefined,
            this.overrides
        );
        console.log(`Deployed new sporePoolLogic
            ${this.sporePoolLogic.address}
        `);

        this.sporePoolEthLogic = await deployContract(
            deployer,
            SporePoolEth,
            undefined,
            this.overrides
        );
        console.log(`Deployed new sporePoolEthLogic
            ${this.sporePoolEthLogic.address}
        `);
    }

    async deployUpgradedMetadataInfra() {
        const {config, deployer} = this;

        // console.log(`Deploying new metadataResolverLogic...`);
        // this.metadataResolverLogic = await deployContract(
        //     deployer,
        //     MetadataResolver,
        //     undefined,
        //     this.overrides
        // );

        // console.log(`Deploying new mushroomAdapterLogic...`);
        // this.mushroomAdapterLogic = await deployContract(
        //     deployer,
        //     MushroomAdapter,
        //     undefined,
        //     this.overrides
        // );

        console.log(`Deploying new enokiGeyserLogic...`);
        this.enokiGeyserLogic = await deployContract(
            deployer,
            EnokiGeyser,
            undefined,
            this.overrides
        );

        console.log(this.enokiGeyserLogic.address);

        // console.log(`Deploying new mushroomNftLogic...`);
        // this.mushroomNftLogic = await deployContract(
        //     deployer,
        //     MushroomNFT,
        //     undefined,
        //     this.overrides
        // );
    }

    async upgradeMetadataResolver() {
        const {config, deployer} = this;

        await this.devMultisig.execDirectly(
            {
                to: this.proxyAdmin.address,
                data: proxyAdminIface.encodeFunctionData("upgrade", [
                    this.metadataResolverProxy.address,
                    this.metadataResolverLogic.address,
                ]),
            },
            deployer
        );
        console.log(`Upgraded metadataResolverProxy ${this.metadataResolverProxy.address}
            to: ${this.metadataResolverLogic.address}
        `);
    }

    async swtichRateVotes() {
        const {config, deployer} = this;
        
        console.log()

        for (const pool of this.missionPools) {
            const encoded = sporePoolIface.encodeFunctionData("setRateVote", [
                this.centralizedRateVoteProxy.address,
            ]);

            await this.devMultisig.execDirectly(
                {
                    to: pool.sporePool.address,
                    data: encoded,
                },
                deployer
            );
            console.log(`Switched vote rate for ${pool.assetName} 
                    to: ${this.centralizedRateVoteProxy.address}
                    encoded: ${encoded}
            `);
        }
    }

    async upgradeFarms() {
        const {config, deployer} = this;

        for (const pool of this.missionPools) {
            if (pool.assetName == "ETH") {

                console.log(
                    pool.sporePool.address,
                    this.sporePoolEthLogic.address,
                )

                const encoded = proxyAdminIface.encodeFunctionData("upgrade", [
                    pool.sporePool.address,
                    this.sporePoolEthLogic.address,
                ]);
                await this.devMultisig.execDirectly(
                    {
                        to: this.proxyAdmin.address,
                        data: encoded,
                    },
                    deployer
                );
                console.log(`Upgraded Pool logic for ${pool.assetName} 
                    proxy: ${pool.sporePool.address}
                    to: ${this.sporePoolEthLogic.address} (ETH Variant)
                    encoded: ${encoded}
                `);
            } else {
                const encoded = proxyAdminIface.encodeFunctionData("upgrade", [
                    pool.sporePool.address,
                    this.sporePoolLogic.address,
                ]);
                await this.devMultisig.execDirectly(
                    {
                        to: this.proxyAdmin.address,
                        data: encoded,
                    },
                    deployer
                );
                console.log(
                    pool.sporePool.address,
                    this.sporePoolLogic.address,
                );
                console.log(`Upgraded Pool logic for ${pool.assetName} 
                    proxy: ${pool.sporePool.address}
                    to: ${this.sporePoolLogic.address} (Token Variant)
                    encoded: ${encoded}
                `);
            }
        }
    }

    async upgradeMushroomNft() {
        const {config, deployer} = this;

        await this.devMultisig.execDirectly(
            {
                to: this.proxyAdmin.address,
                data: proxyAdminIface.encodeFunctionData("upgrade", [
                    this.mushroomNftProxy.address,
                    this.mushroomNftLogic.address,
                ]),
            },
            deployer
        );
        console.log(`Upgraded mushroomAdapterProxy ${this.mushroomNftProxy.address}
            to: ${this.mushroomNftLogic.address}
        `);
    }

    async upgradeMushroomAdapter() {
        const {config, deployer} = this;

        await this.devMultisig.execDirectly(
            {
                to: this.proxyAdmin.address,
                data: proxyAdminIface.encodeFunctionData("upgrade", [
                    this.mushroomAdapterProxy.address,
                    this.mushroomAdapterLogic.address,
                ]),
            },
            deployer
        );
        console.log(`Upgraded mushroomAdapterProxy ${this.mushroomAdapterProxy.address}
            to: ${this.mushroomAdapterLogic.address}
        `);
    }

    async initializeEnokiGeyser() {
        const {config, deployer} = this;

        await (
            await this.enokiGeyserProxy.initialize(
                this.enokiToken.address,
                config.geyserParams.maxStakesPerAddress,
                this.devMultisig.ethersContract.address,
                BN(6),
                this.bannedContractProxy.address,
                config.poolGlobals.enokiEnabledTime,
                config.geyserParams.maxAirdropPool,
                this.metadataResolverProxy.address,
                this.overrides
            )
        ).wait();
    }

    async upgradeEnokiGeyser() {
        const {config, deployer} = this;

        const newLogic = await deployContract(
            deployer,
            EnokiGeyser,
            undefined,
            this.overrides
        );

        console.log(`Proxy Admin Owner ${await this.proxyAdmin.owner()}`);

        expect(this.enokiGeyserProxy.address, "enokiGeyserProxy.address").to.be.equal(
            "0xf616AA8c22F100fc8D479dCfc1BD905b4D6Fa591"
        );

        const newImpl = newLogic.address;

        const result = await this.devMultisig.execDirectly(
            {
                to: this.proxyAdmin.address,
                data: proxyAdminIface.encodeFunctionData("upgrade", [
                    this.enokiGeyserProxy.address,
                    newLogic.address,
                ]),
            },
            deployer
        );

        this.enokiGeyserLogic = newLogic;

        console.log(`Upgraded Enoki Geyser Proxy ${this.enokiGeyserProxy.address}
            to logic   : ${newImpl}
        `);

        expect(
            await this.proxyAdmin.getProxyImplementation(this.enokiGeyserProxy.address)
        ).to.be.equal(newImpl);

        /*
            IERC20 enokiToken_,
            uint256 maxUnlockSchedules,
            uint256 startBonus_,
            uint256 bonusPeriodSec_,
            uint256 initialSharesPerToken,
            uint256 maxStakesPerAddress_,
            address devRewardAddress_,
            uint256 devRewardPercentage_,
            address bannedContractList_
        */

        console.log(
            !!this.enokiToken.address,
            !!config.geyserParams.maxStakesPerAddress,
            !!this.devMultisig.ethersContract.address,
            !!this.bannedContractProxy.address
        );

        // await (
        //     await this.enokiGeyserProxy.initialize(
        //         this.enokiToken.address,
        //         config.geyserParams.maxStakesPerAddress,
        //         this.devMultisig.ethersContract.address,
        //         BN(6),
        //         this.bannedContractProxy.address,
        //         config.poolGlobals.enokiEnabledTime,
        //         config.geyserParams.maxAirdropPool,
        //         this.metadataResolverProxy.address,
        //         this.overrides
        //     )
        // ).wait();

        console.log(`Initialized Enoki Geyser!`);
    }

    async setupMission0Pools() {
        const {config, deployer} = this;

        for (const pool of this.missionPools) {
            await this.devMultisig.execDirectly(
                {
                    to: this.missionsProxy.address,
                    data: missionIface.encodeFunctionData("approvePool", [
                        pool.sporePool.address,
                    ]),
                },
                deployer
            );

            console.log(
                `Added SporePool for ${pool.assetName} to Approved Mission Pools`
            );
        }
    }

    /*
        Each pool will be a proxy to reduce gas costs
    */
    async deployMission0Pools() {
        this.missionPools = [];
        const {config, deployer} = this;

        this.sporePoolLogic = await deployContract(
            deployer,
            SporePool,
            undefined,
            this.overrides
        );
        this.sporePoolEthLogic = await deployContract(
            deployer,
            SporePoolEth,
            undefined,
            this.overrides
        );
        this.mushroomFactoryLogic = await deployContract(
            deployer,
            MushroomFactory,
            undefined,
            this.overrides
        );
        this.rateVoteLogic = await deployContract(
            deployer,
            RateVote,
            undefined,
            this.overrides
        );

        console.log(`Deployed SporePool Logic
            sporePoolLogic: ${this.sporePoolLogic.address}
            sporePoolEthLogic: ${this.sporePoolEthLogic.address}
            mushroomFactoryLogic: ${this.mushroomFactoryLogic.address}
            rateVoteLogic: ${this.rateVoteLogic.address}
        `);

        for (const poolConfig of config.pools) {
            const speciesConfig = this.getSpeciesDataById(poolConfig.mushroomSpecies);

            console.log(`Deploying SporePool for ${poolConfig.assetName}...
                assetAddress: ${poolConfig.assetAddress}
                initialSporesPerWeek: ${poolConfig.initialSporesPerWeek.toString()}
                mushroomSpecies: ${poolConfig.mushroomSpecies.toString()}
                devRewardPercentage: ${BN(10)}
                stakingEnabledTime: ${config.poolGlobals.stakingStartTime}
                votingEnabledTime: ${config.poolGlobals.votingStartTime}
                voteDuration: ${config.poolGlobals.voteDuration}
                sporeRewardRate: ${poolConfig.initialSporesPerWeek
                    .div(daysToSeconds(7))
                    .toString()}
                mushroomSpecies: ${speciesConfig.speciesId}
                costPerMushroom: ${speciesConfig.costPerMushroom}
            `);

            console.log(`   Deploying Spore Pool Proxy...`);
            let sporePoolProxy: Contract;

            // Deploy ETH variant for ETH
            if (poolConfig.assetName === "ETH") {
                sporePoolProxy = await deployContract(
                    deployer,
                    AdminUpgradeabilityProxy,
                    [
                        this.sporePoolEthLogic.address,
                        this.proxyAdmin.address,
                        sporePoolIface.encodeFunctionData("initialize", [
                            this.sporeToken.address,
                            poolConfig.assetAddress,
                            this.missionsProxy.address,
                            this.bannedContractProxy.address,
                            this.devMultisig.ethersContract.address,
                            this.enokiDaoAgent.address,
                            [
                                BN(10), // devRewardPercentage
                                config.poolGlobals.stakingStartTime, // stakingEnabledTime
                                poolConfig.initialSporesPerWeek.div(daysToSeconds(7)), // rewardRate (per second)
                            ],
                        ]),
                    ],
                    this.overrides
                );
            } else {
                sporePoolProxy = await deployContract(
                    deployer,
                    AdminUpgradeabilityProxy,
                    [
                        this.sporePoolLogic.address,
                        this.proxyAdmin.address,
                        sporePoolIface.encodeFunctionData("initialize", [
                            this.sporeToken.address,
                            poolConfig.assetAddress,
                            this.missionsProxy.address,
                            this.bannedContractProxy.address,
                            this.devMultisig.ethersContract.address,
                            this.enokiDaoAgent.address,
                            [
                                BN(10), // devRewardPercentage
                                config.poolGlobals.stakingStartTime, // stakingEnabledTime
                                poolConfig.initialSporesPerWeek.div(daysToSeconds(7)), // rewardRate (per second)
                            ],
                        ]),
                    ],
                    this.overrides
                );
            }

            console.log(`   Deploying Mushroom Factory Proxy...`);
            const mushroomFactoryProxy = await deployContract(
                deployer,
                AdminUpgradeabilityProxy,
                [
                    this.mushroomFactoryLogic.address,
                    this.proxyAdmin.address,
                    mushroomFactoryIface.encodeFunctionData("initialize", [
                        this.sporeToken.address,
                        this.mushroomNftProxy.address,
                        sporePoolProxy.address,
                        speciesConfig.costPerMushroom,
                        poolConfig.mushroomSpecies,
                    ]),
                ],
                this.overrides
            );

            console.log(`   Deploying Rate Vote Proxy...`);
            const rateVoteProxy = await deployContract(
                deployer,
                AdminUpgradeabilityProxy,
                [
                    this.rateVoteLogic.address,
                    this.proxyAdmin.address,
                    rateVoteIFace.encodeFunctionData("initialize", [
                        sporePoolProxy.address,
                        this.enokiToken.address,
                        config.poolGlobals.voteDuration,
                        config.poolGlobals.votingStartTime,
                        this.bannedContractProxy.address,
                    ]),
                ],
                this.overrides
            );

            const sporePool = new Contract(
                sporePoolProxy.address,
                SporePool.abi,
                deployer
            );

            const mushroomFactory = new Contract(
                mushroomFactoryProxy.address,
                MushroomFactory.abi,
                deployer
            );

            const rateVote = new Contract(
                rateVoteProxy.address,
                RateVote.abi,
                deployer
            );

            console.log(`   Initializing SporePool contracts...`);
            await (
                await sporePool.setMushroomFactory(
                    mushroomFactoryProxy.address,
                    this.overrides
                )
            ).wait();

            await (
                await sporePool.setRateVote(rateVoteProxy.address, this.overrides)
            ).wait();

            console.log(`   Transferring Ownership...`);
            console.log("owner", await sporePool.owner());
            console.log("deployer", await deployer.getAddress());

            const sporePoolWeb3 = new this.web3.eth.Contract(
                SporePool.abi,
                sporePool.address
            );
            const mushroomFactoryWeb3 = new this.web3.eth.Contract(
                MushroomFactory.abi,
                mushroomFactory.address
            );
            // Transfer ownership to dev multisig
            await (
                await sporePool
                    .connect(deployer)
                    .transferOwnership(
                        this.devMultisig.ethersContract.address,
                        this.overrides
                    )
            ).wait();

            this.missionPools.push({
                assetName: poolConfig.assetName,
                assetAddress: poolConfig.assetAddress,
                sporePool: sporePool,
                mushroomFactory: mushroomFactory,
                rateVote: rateVote,
            });

            console.log(`Deployed SporePool Proxy for ${poolConfig.assetName}
                sporePoolProxy: ${sporePoolProxy.address}
                sporePoolProxy: ${sporePool.address}
                mushroomFactoryProxy: ${mushroomFactoryProxy.address}
                mushroomFactoryProxy: ${mushroomFactory.address}
                rateVoteProxy: ${rateVoteProxy.address}
                rateVoteProxy: ${rateVote.address}
            `);
        }
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

    getPoolByAsset(address: string): SporePoolEntry {
        const entry = this.missionPools.find((entry) => entry.assetAddress === address);

        if (!entry) {
            throw new Error(`Unable to find pool for ${address}`);
        }

        return entry;
    }
}
