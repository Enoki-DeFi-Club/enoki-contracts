import { BigNumber } from 'ethers'

export async function setNextBlockTimestamp(provider: any, timestamp: number) {
  const timeDiff = timestamp - (await getLastBlockTimestamp(provider))
  console.log('timeDiff', timeDiff);
  await increaseTime(provider, timeDiff)
}

export async function increaseTime(provider: any, amount: number) {
  await provider.send('evm_increaseTime', [amount])
}

export async function getLastBlockTimestamp(provider: any): Promise<number> {
  const block = await provider.send('eth_getBlockByNumber', ['latest', false])
  console.log('Number(block.timestamp)', Number(block.timestamp))
  return Number(block.timestamp)
}

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}

export function getTimeUntil(timestamp: number): number {
  const now = getCurrentTimestamp()

  if (timestamp >= now) {
    return timestamp - now
  } else {
    return 0
  }
}

export function formatTime(timestamp: number | BigNumber): string {
  let time: number
  if (timestamp instanceof BigNumber) time = timestamp.toNumber()
  else time = timestamp
  const dateString = new Date(time * 1000).toLocaleDateString('en-US')
  const timeString = new Date(time * 1000).toLocaleTimeString('en-US')
  return dateString + ' ' + timeString
}
