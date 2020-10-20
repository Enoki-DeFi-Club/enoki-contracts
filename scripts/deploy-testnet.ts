import { deployCore } from './deploy/deployCore'
import { run, ethers } from '@nomiclabs/buidler'

async function main() {
  const jsonRpcProvider = ethers.provider

  const [first, deployer] = await ethers.getSigners()
  await deployCore(jsonRpcProvider, deployer, {
      testmode: true
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
