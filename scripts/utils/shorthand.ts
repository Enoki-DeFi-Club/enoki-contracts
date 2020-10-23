import { BigNumber, utils } from "ethers";

export function BN(num): BigNumber {
    return BigNumber.from(num);
}

export function ETH(value: string): BigNumber {
    return utils.parseEther(value);
}

export function addr(value: string): string {
    return utils.getAddress(value);
}