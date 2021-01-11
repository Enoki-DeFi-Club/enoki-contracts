import {utils} from "ethers";

export interface EnokiAddresses {
    sporeToken: string;
    presale: string;
    missionsProxy: string;
    missionsLogic: string;
    lpTokenVesting: string;
    enokiGeyserEscrow: string;
    enokiGeyserProxy: string;
    enokiGeyserLogic: string;
    enokiToken: string;
    enokiDaoAgent: string;
    devFundPaymentSplitter: string;
    devFundEthVesting: string;
    devMultisig: string;
    proxyAdmin: string;
    bannedContractProxy: string;
    bannedContractLogic: string;
    mushroomNftProxy: string;
    mushroomNftLogic: string;
    metadataResolverProxy: string;
    metadataResolverLogic: string;
    mushroomAdapterProxy: string;
    mushroomAdapterLogic: string;
}

export const deployed: EnokiAddresses = {
    sporeToken: utils.getAddress("0xa4Bad5d040d4464EC5CE130987731F2f428c9307"),
    presale: utils.getAddress("0xAa402E8a2E9A5825578850008896C492483F1607"),
    missionsProxy: utils.getAddress("0x1c586b2Ff4e13211aAe187244aef8D4312515151"),
    missionsLogic: utils.getAddress("0x86Cf5Ff6186f42C208f5005151391C5b7344864B"),
    lpTokenVesting: utils.getAddress("0x27b85fd1e4d89f729db3dbaee8a7245ce349e28a"),
    enokiGeyserEscrow: utils.getAddress("0xb0aeCC06f79d3a480E9bE21da8908E8087c49669"),
    enokiGeyserProxy: utils.getAddress("0xf616AA8c22F100fc8D479dCfc1BD905b4D6Fa591"),
    enokiGeyserLogic: utils.getAddress("0x25868456df5d0Eb687E8e2578884bF9171B8bdBa"),
    enokiToken: utils.getAddress("0x886058deded1325a27697122512f618db590ea32"),
    enokiDaoAgent: utils.getAddress("0x37e52356b6602028c7e6cb2803ea0e024a621fd4"),
    devFundPaymentSplitter: utils.getAddress("0xa2bA49EAE61F38Fa07E716D3210E0ca7868c744D"),
    devFundEthVesting: utils.getAddress("0xdb6D78F9C091c5B78319B921Cdde107d1Abf347F"),
    devMultisig: utils.getAddress("0x4f8fDC5D03B21aE85c5E451efE454D6e550fF761"),
    proxyAdmin: utils.getAddress("0x8a51e4C8EAaF044Ec82A11Ac3a991B1B2c247325"),
    bannedContractProxy: utils.getAddress("0x185d8B73D389Bb233328533CDFe8cc3A57E1fb54"),
    bannedContractLogic: utils.getAddress("0xe15b59c65e58416E37E83D5d2C095b4817e75766"),
    mushroomNftProxy: utils.getAddress("0x3De05fbaeeefB97B51fF6518E0f7F51F27d14ce7"),
    mushroomNftLogic: utils.getAddress("0xf43691c1CB3cFDd3aCE0fef2f41Ab08D8273Fcc0"),
    metadataResolverProxy: utils.getAddress("0xa6e8E562a7253DF0f93567E9430Ee880535225BC"),
    metadataResolverLogic: utils.getAddress("0x94586f68d6a331c6758701C0267A35b722E21958"),
    mushroomAdapterProxy: utils.getAddress("0xb3c8Bc203407BAc5bAFF494E87EF25f5d2EA1F12"),
    mushroomAdapterLogic: utils.getAddress("0xC2437749Eb51480F2A01a7bC5702843fc1E3B7c2"),
}