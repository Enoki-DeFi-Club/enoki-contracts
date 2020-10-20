const utils = require("./general");
const ethers = require("ethers");
const BigNumber = require("bignumber.js");

const GAS_PRICE = ethers.utils.parseUnits("100", "gwei").toString();

let baseGasValue = function (hexValue) {
    switch (hexValue) {
        case "0x":
            return 0;
        case "00":
            return 4;
        default:
            return 68;
    }
};

let estimateBaseGas = function (
    signatureCount,
    nonce
) {
    // numbers < 256 are 192 -> 31 * 4 + 68
    // numbers < 65k are 256 -> 30 * 4 + 2 * 68
    // For signature array length and baseGasEstimate we already calculated the 0 bytes so we just add 64 for each non-zero byte
    let signatureCost = signatureCount * (68 + 2176 + 2176 + 6000); // (array count (3 -> r, s, v) + ecrecover costs) * signature count

    let baseGasEstimate =
        2000000 +
        signatureCost +
        (nonce > 0 ? 5000 : 20000) +
        1500; // 1500 -> hash generation costs
    return baseGasEstimate + 32000; // Add aditional gas costs (e.g. base tx costs, transfer costs)
};

let executeTransactionWithSigner = async function (
    signer,
    safe,
    subject,
    accounts,
    to,
    value,
    data,
    operation,
    executor,
    opts
) {
    let options = opts || {};
    let txFailed = options.fails || false;
    let txGasToken = options.gasToken || 0;
    let refundReceiver = options.refundReceiver || 0;

    let nonce = await safe.methods.nonce().call();

    let baseGasEstimate = estimateBaseGas(
        accounts.length,
        nonce
    );
    txGasEstimate = 2000000;
    console.log("    Base Gas estimate: " + baseGasEstimate);

    let gasPrice = GAS_PRICE;
    if (txGasToken != 0) {
        gasPrice = 1;
    }
    gasPrice = options.gasPrice || gasPrice;

    let sigs = await signer(
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
    );

    // Estimate gas of paying transaction
    let estimate = null;
    try {
        estimate = await safe.methods
            .execTransaction(
                to,
                value,
                data,
                operation,
                txGasEstimate,
                baseGasEstimate,
                gasPrice,
                txGasToken,
                refundReceiver,
                sigs
            )
            .estimateGas();
    } catch (e) {
        if (options.revertMessage == undefined || options.revertMessage == null) {
            throw e;
        }
        assert.equal(
            (
                "VM Exception while processing transaction: revert " +
                opts.revertMessage
            ).trim(),
            e.message
        );
        return null;
    }

    // Execute paying transaction
    // We add the txGasEstimate and an additional 10k to the estimate to ensure that there is enough gas for the safe transaction
    let tx = await safe.methods
        .execTransaction(
            to,
            value,
            data,
            operation,
            txGasEstimate,
            baseGasEstimate,
            gasPrice,
            txGasToken,
            refundReceiver,
            sigs
        )
        .send({
            from: executor,
            gas: estimate + txGasEstimate + 10000,
            gasPrice: gasPrice,
        });
    let events = utils.checkTxEvent(
        tx,
        "ExecutionFailed",
        safe.address,
        txFailed,
        subject
    );
    if (txFailed) {
        let transactionHash = await safe.getTransactionHash(
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
        );
        assert.equal(transactionHash, events.args.txHash);
    }
    return tx;
};

Object.assign(exports, {
    estimateBaseGas,
    executeTransactionWithSigner,
});
