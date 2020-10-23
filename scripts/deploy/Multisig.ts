import {BigNumber, utils, constants, Contract, Signer} from "ethers";
import GnosisSafe from "../../dependency-artifacts/gnosis-safe/GnosisSafe.json";
import TestGnosisSafe from "../../dependency-artifacts/gnosis-safe/TestGnosisSafe.json";
import ProxyFactory from "../../dependency-artifacts/gnosis-safe/ProxyFactory.json";

import {deployContract} from "ethereum-waffle";
import {execTransaction} from "../gnosis-safe/signTypedData.js";
import {string} from "@nomiclabs/buidler/internal/core/params/argumentTypes";

export enum Operation {
    CALL = 0,
    CREATE = 2,
}

export interface ExecTransactionParams {
    to: string;
    value?: BigNumber;
    data?: string;
    operation?: Operation;
    safeTxGas?: BigNumber;
    baseGas?: BigNumber;
    gasPrice?: BigNumber;
    gasToken?: string;
    refundReceiver?: string;
    signatures?: string;
}
export class Multisig {
    signer!: Signer;
    web3!: any;
    jsonRpcProvider!: any;
    contract!: Contract;
    ethersContract!: Contract;
    owners!: string[];
    testmode!: boolean;

    constructor(web3, jsonRpcProvider) {
        this.web3 = web3;
        this.jsonRpcProvider = jsonRpcProvider;
    }

    /*
        Create a TestGnosisSafe with the same properties of the real one. This instance does not require signatures to execute transactions, but is otherwise identical
    */
    static async deployTest(
        web3: any,
        jsonRpcProvider: any,
        signer: Signer,
        proxyFactoryAddress: string,
        owners: string[]
    ) {
        const multisig = new Multisig(web3, jsonRpcProvider);

        const masterCopy = await deployContract(signer, TestGnosisSafe, undefined, {
            gasLimit: 6200000,
        });

        const proxyFactory = new Contract(
            proxyFactoryAddress,
            ProxyFactory.abi,
            signer
        );

        // Temporary: Creation code of real Enoki Dev Multisig
        const encoded =
            "0xb63e800d00000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000d5d82b6addc9027b22dca772aa68d5d74cdbdf440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000000000000000000000e9673e2806305557daa67e3207c123af9f95f9d2000000000000000000000000482c741b0711624d1f462e56ee5d8f776d5970dc000000000000000000000000a2b3872c3d1e0a1c75a3bf3ef0214e2168a36713000000000000000000000000c66d67132bb439e7ec4383db19110581a44ddc4a0000000000000000000000009005ca508d14b4173f7063884a8ff6db7af5eecd0000000000000000000000000000000000000000000000000000000000000000";

        await (await proxyFactory.createProxy(masterCopy.address, encoded)).wait();

        const events = await proxyFactory.queryFilter(
            proxyFactory.filters.ProxyCreation(),
            "latest"
        );

        console.log(`Created Test Gnosis Safe Instance ${events[0]?.args?.proxy}`);

        const safeAddress = events[0]?.args?.proxy;

        multisig.contract = new web3.eth.Contract(GnosisSafe.abi, safeAddress);
        multisig.ethersContract = new Contract(safeAddress, GnosisSafe.abi, signer);

        multisig.owners = owners;
        multisig.testmode = true;
        return multisig;
    }

    static fromAddress(
        web3: any,
        jsonRpcProvider: any,
        signer: Signer,
        address: string,
        owners: string[],
        testmode: boolean
    ) {
        const multisig = new Multisig(web3, jsonRpcProvider);
        multisig.contract = new web3.eth.Contract(GnosisSafe.abi, address);

        multisig.ethersContract = new Contract(address, GnosisSafe.abi, signer);

        multisig.owners = owners;
        multisig.testmode = testmode;
        return multisig;
    }

    /* 
        Testing only: Use internal call that skips signature verification
        Can only be executed 'as' the contract address, using ganache --unlock option
        Calls: function execute(address to, uint256 value, bytes memory data, Enum.Operation operation, uint256 txGas)
    */
    async execDirectly(params: ExecTransactionParams) {
        return await this.contract.methods
            .execute(
                params.to,
                params.value ? params.value.toString() : "0",
                params.data ? params.data : "0x",
                params.operation ? String(params.operation) : String(Operation.CALL),
                this.web3.utils.toWei("2000000") //Static gas
            )
            .send({from: this.contract.address});
    }

    async execTransaction(params: ExecTransactionParams) {
        if (!this.testmode) {
            throw new Error(
                "Cannot directly execute transactions as Safe when not in control of accounts"
            );
        }
        const {web3, jsonRpcProvider, ethersContract, contract, owners} = this;

        // console.log('execTransaction', params);

        const tx = await ethersContract.execTransaction(
            params.to,
            params.value ? params.value : utils.parseEther("0"),
            params.data ? params.data : "0x",
            params.operation ? params.operation : Operation.CALL,
            BigNumber.from(2000000),
            BigNumber.from(2000000),
            utils.parseUnits("100", "gwei"),
            constants.AddressZero,
            owners[0],
            "0x",
            {
                gasPrice: utils.parseUnits("100", "gwei"),
                gasLimit: 6000000,
            }
        );

        const result = await tx.wait();
        return result;
    }
}
