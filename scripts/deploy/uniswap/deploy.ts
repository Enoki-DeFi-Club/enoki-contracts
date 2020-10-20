/*
    Modified from uniswap-v2-periphery test fixtures
    Credit: https://github.com/Uniswap/uniswap-v2-periphery/blob/master/test/shared/fixtures.ts
*/
import { Wallet, Contract, Signer } from 'ethers'
import { providers } from 'ethers'
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import UniswapV2Factory from '../../../dependency-artifacts/uniswap-v2-core/UniswapV2Factory.json'
import IUniswapV2Pair from '../../../dependency-artifacts/uniswap-v2-core/IUniswapV2Pair.json'

import ERC20 from '../../../dependency-artifacts/uniswap-v2-periphery/ERC20.json'
import WETH9 from '../../../dependency-artifacts/uniswap-v2-periphery/WETH9.json'
import UniswapV1Exchange from '../../../dependency-artifacts/uniswap-v2-periphery/UniswapV1Exchange.json'
import UniswapV1Factory from '../../../dependency-artifacts/uniswap-v2-periphery/UniswapV1Factory.json'
import UniswapV2Router01 from '../../../dependency-artifacts/uniswap-v2-periphery/UniswapV2Router01.json'
import UniswapV2Migrator from '../../../dependency-artifacts/uniswap-v2-periphery/UniswapV2Migrator.json'
import UniswapV2Router02 from '../../../dependency-artifacts/uniswap-v2-periphery/UniswapV2Router02.json'
import RouterEventEmitter from '../../../dependency-artifacts/uniswap-v2-periphery/RouterEventEmitter.json'

const overrides = {
  gasLimit: 9999999
}

interface V2Fixture {
  token0: Contract
  token1: Contract
  WETH: Contract
  WETHPartner: Contract
  factoryV2: Contract
  router02: Contract
  routerEventEmitter: Contract
  router: Contract
  pair: Contract
  WETHPair: Contract
}

export async function deployUniswapSystem(signer: Signer): Promise<V2Fixture> {
  const signerAddress = await signer.getAddress()

  // deploy tokens
  const tokenA = await deployContract(signer, ERC20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(signer, ERC20, [expandTo18Decimals(10000)])
  const WETH = await deployContract(signer, WETH9)
  const WETHPartner = await deployContract(signer, ERC20, [expandTo18Decimals(10000)])

  // deploy V2
  const factoryV2 = await deployContract(signer, UniswapV2Factory, [signerAddress])

  // deploy routers
  const router02 = await deployContract(signer, UniswapV2Router02, [factoryV2.address, WETH.address], overrides)

  // event emitter for testing
  const routerEventEmitter = await deployContract(signer, RouterEventEmitter, [])

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)
  const pair = new Contract(pairAddress, JSON.stringify(IUniswapV2Pair.abi), signer)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WETH.address, WETHPartner.address)
  const WETHPairAddress = await factoryV2.getPair(WETH.address, WETHPartner.address)
  console.log(WETHPairAddress);
  const WETHPair = new Contract(WETHPairAddress, JSON.stringify(IUniswapV2Pair.abi), signer)

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factoryV2,
    router02,
    router: router02, // the default router, 01 had a minor bug
    routerEventEmitter,
    pair,
    WETHPair
  }
}
