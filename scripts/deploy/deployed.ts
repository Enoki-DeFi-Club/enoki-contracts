import {utils} from "ethers";

export interface EnokiAddresses {
    sporeToken: string;
    presale: string;
    missionsProxy: string;
    missionsLogic: string;
    lpTokenVesting: string;
    approvedContractList: string;
    enokiGeyserEscrow: string;
    enokiGeyserProxy: string;
    enokiGeyserLogic: string;
    enokiToken: string;
    enokiDaoAgent: string;
    devFundPaymentSplitter: string;
    devFundEthVesting: string;
    devMultisig: string;
    proxyAdmin: string;
}

export const deployed: EnokiAddresses = {
    sporeToken: utils.getAddress("0xa4Bad5d040d4464EC5CE130987731F2f428c9307"),
    presale: utils.getAddress("0xAa402E8a2E9A5825578850008896C492483F1607"),
    missionsProxy: utils.getAddress("0x1c586b2Ff4e13211aAe187244aef8D4312515151"),
    missionsLogic: utils.getAddress("0x86Cf5Ff6186f42C208f5005151391C5b7344864B"),
    lpTokenVesting: utils.getAddress("0xDeC2D420C217971bdf8a94aB1DFe18f275ceFF3F"),
    approvedContractList: utils.getAddress("0xd0089684A552B36f2f82F1c7Fe94905C8ca1c292"),
    enokiGeyserEscrow: utils.getAddress("0xb0aeCC06f79d3a480E9bE21da8908E8087c49669"),
    enokiGeyserProxy: utils.getAddress("0xf616AA8c22F100fc8D479dCfc1BD905b4D6Fa591"),
    enokiGeyserLogic: utils.getAddress("0x25868456df5d0Eb687E8e2578884bF9171B8bdBa"),
    enokiToken: utils.getAddress("0x886058deded1325a27697122512f618db590ea32"),
    enokiDaoAgent: utils.getAddress("0x37e52356b6602028c7e6cb2803ea0e024a621fd4"),
    devFundPaymentSplitter: utils.getAddress("0xa2bA49EAE61F38Fa07E716D3210E0ca7868c744D"),
    devFundEthVesting: utils.getAddress("0xdb6D78F9C091c5B78319B921Cdde107d1Abf347F"),
    devMultisig: utils.getAddress("0x4f8fDC5D03B21aE85c5E451efE454D6e550fF761"),
    proxyAdmin: utils.getAddress("0x8a51e4C8EAaF044Ec82A11Ac3a991B1B2c247325"),
}