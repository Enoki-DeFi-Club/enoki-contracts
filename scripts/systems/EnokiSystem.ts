import {
    daysToSeconds,
    LaunchConfig,
    MushroomType,
    WHALES,
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

import Agent from "../../dependency-artifacts/aragon/Agent.json";
import MiniMeToken from "../../dependency-artifacts/aragon/MiniMeToken.json";

import EnokiGeyser from "../../artifacts/EnokiGeyser.json";
import Mission from "../../artifacts/Mission.json";
import MushroomMetadata from "../../artifacts/MushroomMetadata.json";
import MushroomResolver from "../../artifacts/MushroomResolver.json";

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
import {getCurrentTimestamp} from "../utils/timeUtils";
import {EnokiAddresses} from "../deploy/deployed";
dotenv.config();

export const LIFESPAN_MODIFIER_ROLE = utils.keccak256(
    utils.toUtf8Bytes("LIFESPAN_MODIFIER_ROLE")
);
export const MINTER_ROLE = utils.keccak256(utils.toUtf8Bytes("MINTER_ROLE"));

import {
    sporePoolIface,
    mushroomFactoryIface,
    proxyAdminIface,
    bannedContractListIface,
    mushroomNftIface,
    mushroomMetadataIface,
    mushroomResolverIface,
    missionIface,
} from "../utils/interfaces";
import {BN} from "../utils/shorthand";

export interface UniswapPool {
    assetName: string;
    contract: Contract;
}

export interface SporePoolEntry {
    assetName: string;
    assetAddress: string;
    sporePool: Contract;
    mushroomFactory: Contract;
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

    mushroomNftLogic!: Contract;
    mushroomNftProxy!: Contract;

    mushroomMetadataLogic!: Contract;
    mushroomMetadataProxy!: Contract;

    mushroomResolverLogic!: Contract;
    mushroomResolverProxy!: Contract;

    bannedContractLogic!: Contract;
    bannedContractProxy!: Contract;

    bannedContractList!: Contract;

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
        this.fastGasPrice = utils.parseUnits("100", "gwei");
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
        enoki.bannedContractList = new Contract(
            deployed.bannedContractList,
            BannedContractList.abi,
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
            this.bannedContractList.address,
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
        const logic = await deployContract(deployer, Artifact);
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
            bannedContractListIface.encodeFunctionData("initialize")
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
        - Set MushroomMetadata on Geyser
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
                    pool.mushroomFactory.address
                )
            ).wait();

            console.log(`Granted LIFESPAN_MODIFIER_ROLE to MushroomFactory: 
                ${pool.assetName} 
                ${pool.mushroomFactory.address}
            `);

            await (
                await this.mushroomNftProxy.grantRole(
                    MINTER_ROLE,
                    pool.mushroomFactory.address
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
                this.enokiGeyserProxy.address
            )
        ).wait();

        console.log(`Granted LIFESPAN_MODIFIER_ROLE to EnokiGeyser: 
            ${this.enokiGeyserProxy.address}
        `);

        await (
            await this.mushroomNftProxy.grantRole(
                LIFESPAN_MODIFIER_ROLE,
                this.mushroomResolverProxy.address
            )
        ).wait();

        console.log(`Granted LIFESPAN_MODIFIER_ROLE to MushroomResolver: 
            ${this.mushroomResolverProxy.address}
        `);

        for (const species of config.species) {
            await (
                await this.mushroomNftProxy.setMushroomType(species.speciesId, [
                    species.speciesId,
                    species.strength,
                    species.minLifespan,
                    species.maxLifespan,
                    BN(0),
                    species.cap,
                ])
            ).wait();

            console.log(`Added Mushroom Species ${species.speciesName}
                id ${species.speciesId.toString()}
                strength ${species.strength.toString()}
                minLifespan ${species.minLifespan.toString()}
                maxLifespan ${species.maxLifespan.toString()}
                minted ${BN(0).toString()}
                cap ${species.cap.toString()}
            `);
        }

        console.log(`Setting MushroomMetadata on EnokiGeyser...`);
        await (
            await this.enokiGeyserProxy.setMushroomMetadata(
                this.mushroomMetadataProxy.address
            )
        ).wait();

        console.log(`Setting MushroomMetadata resolver for MushroomNFT...`);
        await (
            await this.mushroomMetadataProxy.setResolver(
                this.mushroomNftProxy.address,
                this.mushroomResolverProxy.address
            )
        ).wait();

        console.log(`Transferring EnokiGeyser admin rights to Dev Multisig...`);
        await (
            await this.enokiGeyserProxy.transferAdmin(
                this.devMultisig.ethersContract.address
            )
        ).wait();

        console.log(`Transferring MushroomMetadata ownership to Dev Multisig...`);
        await (
            await this.mushroomMetadataProxy.transferOwnership(
                this.devMultisig.ethersContract.address
            )
        ).wait();

        console.log(`Transferring MushroomResolver ownership to Dev Multisig...`);
        await (
            await this.mushroomResolverProxy.transferOwnership(
                this.devMultisig.ethersContract.address
            )
        ).wait();

        console.log(`Transferring MushroomNFT ownership to Dev Multisig...`);
        await (
            await this.mushroomNftProxy.transferOwnership(
                this.devMultisig.ethersContract.address
            )
        ).wait();

        console.log(`Ownership transfers complete`);
    }

    async deployMushroomMetadataInfra() {
        console.log(`Deploy mushroomMetadata`);
        const mushroomMetadata = await this.deployLogicAndProxy(
            MushroomMetadata,
            mushroomMetadataIface.encodeFunctionData("initialize")
        );

        this.mushroomMetadataProxy = mushroomMetadata.proxy;
        this.mushroomMetadataLogic = mushroomMetadata.logic;

        console.log(`Deploy mushroomResolver`);
        // Native mushroom resolver
        const mushroomResolver = await this.deployLogicAndProxy(
            MushroomResolver,
            mushroomResolverIface.encodeFunctionData("initialize", [
                this.mushroomNftProxy.address,
                this.mushroomMetadataProxy.address,
            ])
        );

        this.mushroomResolverProxy = mushroomResolver.proxy;
        this.mushroomResolverLogic = mushroomResolver.logic;

        console.log(`Deployed Mushroom Metadata Infra
            mushroomMetadataProxy: ${this.mushroomMetadataProxy.address}
            mushroomFactoryLogic: ${this.mushroomMetadataLogic.address}
            mushroomResolverProxy: ${this.mushroomResolverProxy.address}
            mushroomResolverLogic: ${this.mushroomResolverLogic.address}
        `);

        console.log(`Confirm MushroomMetadata impl...`);
        expect(
            await this.proxyAdmin.getProxyImplementation(
                this.mushroomMetadataProxy.address
            )
        ).to.be.equal(this.mushroomMetadataLogic.address);

        console.log(`Confirm MushroomResolver impl...`);
        expect(
            await this.proxyAdmin.getProxyImplementation(
                this.mushroomResolverProxy.address
            )
        ).to.be.equal(this.mushroomResolverLogic.address);
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
                this.devMultisig.ethersContract.address
            )
        ).wait();

        console.log(`Transferred ownership of Banned Contract List to multisig
                ${this.devMultisig.ethersContract.address}
        `);
    }

    async upgradeEnokiGeyser() {
        const {config, deployer} = this;

        const newLogic = await deployContract(deployer, EnokiGeyser);

        console.log(`Proxy Admin Owner ${await this.proxyAdmin.owner()}`);

        const oldImpl = await this.proxyAdmin.getProxyImplementation(
            this.enokiGeyserProxy.address
        );

        // Ensure the old logic is as expected until after we do this on live instance
        expect(oldImpl, "Make sure we haven't upgraded from old logic yet").to.be.equal(
            "0x25868456df5d0Eb687E8e2578884bF9171B8bdBa"
        );

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
            from logic : ${oldImpl}
            to logic   : ${newImpl}
        `);

        expect(
            await this.proxyAdmin.getProxyImplementation(this.enokiGeyserProxy.address)
        ).to.be.equal(newImpl);

        await (
            await this.enokiGeyserProxy.reinitialize(
                this.enokiToken.address,
                config.geyserParams.maxUnlockSchedules,
                config.geyserParams.startBonus,
                config.geyserParams.bonusPeriodSec,
                config.geyserParams.initialSharesPerToken,
                config.geyserParams.maxStakesPerAddress,
                this.devMultisig.ethersContract.address,
                BN(6),
                this.bannedContractProxy.address,
                await deployer.getAddress()
            )
        ).wait();

        console.log(`Initialized Enoki Geyser!`);

        // await (
        //     await this.enokiGeyserProxy.initialize(
        //         this.enokiToken.address,
        //         config.geyserParams.maxUnlockSchedules,
        //         config.geyserParams.startBonus,
        //         config.geyserParams.bonusPeriodSec,
        //         config.geyserParams.initialSharesPerToken,
        //         config.geyserParams.maxStakesPerAddress,
        //         this.devMultisig.ethersContract.address,
        //         BN(10),
        //         this.bannedContractProxy.address,
        //         this.devMultisig.ethersContract.address
        //     )
        // ).wait();
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

        this.sporePoolLogic = await deployContract(deployer, SporePool);
        this.sporePoolEthLogic = await deployContract(deployer, SporePoolEth);
        this.mushroomFactoryLogic = await deployContract(deployer, MushroomFactory);

        console.log(`Deployed SporePool Logic
            sporePoolLogic: ${this.sporePoolLogic.address}
            sporePoolEthLogic: ${this.sporePoolEthLogic.address}
            mushroomFactoryLogic: ${this.mushroomFactoryLogic.address}
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
                        speciesConfig.costPerMushroom,
                        poolConfig.mushroomSpecies,
                        this.mushroomMetadataProxy.address,
                    ]),
                ],
                this.overrides
            );

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
                            mushroomFactoryProxy.address,
                            this.missionsProxy.address,
                            this.bannedContractList.address,
                            this.devMultisig.ethersContract.address,
                            this.enokiDaoAgent.address,
                            [
                                BN(10), // devRewardPercentage
                                config.poolGlobals.stakingStartTime, // stakingEnabledTime
                                config.poolGlobals.votingStartTime, // votingEnabledTime
                                config.poolGlobals.voteDuration, // voteDuration
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
                            mushroomFactoryProxy.address,
                            this.missionsProxy.address,
                            this.bannedContractList.address,
                            this.devMultisig.ethersContract.address,
                            this.enokiDaoAgent.address,
                            [
                                BN(10), // devRewardPercentage
                                config.poolGlobals.stakingStartTime, // stakingEnabledTime
                                config.poolGlobals.votingStartTime, // votingEnabledTime
                                config.poolGlobals.voteDuration, // voteDuration
                                poolConfig.initialSporesPerWeek.div(daysToSeconds(7)), // rewardRate (per second)
                            ],
                        ]),
                    ],
                    this.overrides
                );
            }

            this.missionPools.push({
                assetName: poolConfig.assetName,
                assetAddress: poolConfig.assetAddress,
                sporePool: new Contract(
                    sporePoolProxy.address,
                    SporePool.abi,
                    deployer
                ),
                mushroomFactory: new Contract(
                    mushroomFactoryProxy.address,
                    MushroomFactory.abi,
                    deployer
                ),
            });

            console.log(`Deployed SporePool Proxy for ${poolConfig.assetName}
                sporePoolProxy: ${sporePoolProxy.address}
                mushroomFactoryProxy: ${mushroomFactoryProxy.address}
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
