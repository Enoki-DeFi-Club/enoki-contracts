function currentTimeNs() {
    const hrTime=process.hrtime();
    return hrTime[0] * 1000000000 + hrTime[1]
}

function getParamFromTxEventWithAdditionalDefinitions(definitions, transaction, eventName, paramName, contract, contractFactory, subject) {
    transaction.logs = transaction.logs.concat(transaction.receipt.logs.map(event => definitions.formatter(event)))
    return getParamFromTxEvent(transaction, eventName, paramName, contract, contractFactory, subject)
}

function getParamFromTxEvent(transaction, eventName, paramName, contract, contractFactory, subject) {
    assert.isObject(transaction)
    if (subject != null) {
        logGasUsage(subject, transaction)
    }
    let logs = transaction.logs
    if(eventName != null) {
        logs = logs.filter((l) => l.event === eventName && l.address === contract)
    }
    assert.equal(logs.length, 1, 'too many logs found!')
    let param = logs[0].args[paramName]
    if(contractFactory != null) {
        let contract = contractFactory.at(param)
        assert.isObject(contract, `getting ${paramName} failed for ${param}`)
        return contract
    } else {
        return param
    }
}

function checkTxEvent(transaction, eventName, contract, exists, subject) {
  assert.isObject(transaction)
  if (subject && subject != null) {
      logGasUsage(subject, transaction)
  }
  let logs = transaction.logs
  if(eventName != null) {
      logs = logs.filter((l) => l.event === eventName && l.address === contract)
  }
  assert.equal(logs.length, exists ? 1 : 0, exists ? 'event was not present' : 'event should not be present')
  return exists ? logs[0] : null
}

function logGasUsage(subject, transactionOrReceipt) {
    let receipt = transactionOrReceipt.receipt || transactionOrReceipt
    console.log("    Gas costs for " + subject + ": " + receipt.gasUsed)
}

async function assertRejects(q, msg) {
    let res, catchFlag = false
    try {
        res = await q
    } catch(e) {
        catchFlag = true
    } finally {
        if(!catchFlag)
            assert.fail(res, null, msg)
    }
    return res
}
Object.assign(exports, {
    currentTimeNs,
    getParamFromTxEvent,
    getParamFromTxEventWithAdditionalDefinitions,
    checkTxEvent,
    logGasUsage,
    assertRejects,
})