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

/*
    Logging shorthand
*/
export function logobj(value: any, message: string | undefined = undefined) {
    if (message) {
        console.log(message);
    }
    console.dir(value, {depth: null});
}

export function logbn(value: BigNumber, message: string | undefined = undefined) {
    console.log(message ? message : "", value.toString());
}