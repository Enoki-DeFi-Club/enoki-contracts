const utils = require("./utils/general");
const safeUtils = require("./utils/execution");
const ethers = require("ethers");

async function execTransaction(web3, jsonRpcProvider, gnosisSafe, txAccount, confirmingAccounts) {
    let executor = txAccount;

    const CALL = 0;
    const CREATE = 2;

    let signTypedData = async function (web3, jsonRpcProvider, account, data) {
        return new Promise(function (resolve, reject) {
            web3.currentProvider.send(
                {
                    jsonrpc: "2.0",
                    method: "eth_signTypedData",
                    params: [account, data],
                    id: new Date().getTime(),
                },
                function (err, response) {
                    if (err) {
                        return reject(err);
                    }
                    console.log('eth_signTypedData response', response);
                    resolve(response.result);
                }
            );
        });
    };

    let signer = async function (
        to,
        value,
        data,
        operation,
        txGasEstimate,
        baseGasEstimate,
        gasPrice,
        txGasToken,
        refundReceiver,
        nonce
    ) {
        console.log("What the signer got", {
            to,
            value,
            data,
            operation,
            txGasEstimate,
            baseGasEstimate,
            gasPrice,
            txGasToken,
            refundReceiver,
            nonce,
        });
        let typedData = {
            types: {
                EIP712Domain: [{type: "address", name: "verifyingContract"}],
                // "SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)"
                SafeTx: [
                    {type: "address", name: "to"},
                    {type: "uint256", name: "value"},
                    {type: "bytes", name: "data"},
                    {type: "uint8", name: "operation"},
                    {type: "uint256", name: "safeTxGas"},
                    {type: "uint256", name: "baseGas"},
                    {type: "uint256", name: "gasPrice"},
                    {type: "address", name: "gasToken"},
                    {type: "address", name: "refundReceiver"},
                    {type: "uint256", name: "nonce"},
                ],
            },
            domain: {
                verifyingContract: gnosisSafe.address,
            },
            primaryType: "SafeTx",
            message: {
                to: to,
                value: value,
                data: data,
                operation: operation,
                safeTxGas: txGasEstimate,
                baseGas: baseGasEstimate,
                gasPrice: gasPrice,
                gasToken: txGasToken,
                refundReceiver: refundReceiver,
                nonce: Number(nonce),
            },
        };
        let signatureBytes = "0x";
        confirmingAccounts.sort();
        for (var i = 0; i < confirmingAccounts.length; i++) {
            signatureBytes += (
                await signTypedData(web3, jsonRpcProvider, confirmingAccounts[i], typedData)
            ).replace("0x", "");
        }
        return signatureBytes;
    };

    // Withdraw 1 ETH
    await safeUtils.executeTransactionWithSigner(
        signer,
        gnosisSafe,
        "executeTransaction withdraw 0.5 ETH",
        confirmingAccounts,
        confirmingAccounts[0],
        ethers.utils.parseEther("0.5").toString(),
        "0x",
        CALL,
        executor
    );
}

module.exports = {
    execTransaction,
};
