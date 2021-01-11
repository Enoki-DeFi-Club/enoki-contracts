import {utils} from "ethers";

import IERC20 from "../../artifacts/IERC20.json";
import SporeToken from "../../artifacts/SporeToken.json";
import SporePresale from "../../artifacts/SporePresale.json";

import GeyserEscrow from "../../artifacts/GeyserEscrow.json";

import EthVesting from "../../artifacts/EthVesting.json";
import BannedContractList from "../../artifacts/BannedContractList.json";

import TokenVesting from "../../artifacts/TokenVesting.json";
import PaymentSplitter from "../../artifacts/PaymentSplitter.json";
import SporePool from "../../artifacts/SporePool.json";
import MushroomFactory from "../../artifacts/MushroomFactory.json";

import Agent from "../../dependency-artifacts/aragon/Agent.json";
import MiniMeToken from "../../dependency-artifacts/aragon/MiniMeToken.json";
import RateVote from "../../artifacts/RateVote.json";

import EnokiGeyser from "../../artifacts/EnokiGeyser.json";
import Mission from "../../artifacts/Mission.json";
import MetadataResolver from "../../artifacts/MetadataResolver.json";
import MushroomAdapter from "../../artifacts/MushroomAdapter.json";

import ProxyAdmin from "../../dependency-artifacts/open-zeppelin-upgrades/ProxyAdmin.json";
import AdminUpgradeabilityProxy from "../../dependency-artifacts/open-zeppelin-upgrades/AdminUpgradeabilityProxy.json";

import UniswapV2Pair from "../../dependency-artifacts/uniswap/UniswapV2Pair.json";
import UniswapV2Router from "../../dependency-artifacts/uniswap/UniswapV2Router02.json";
import UniswapV2Factory from "../../dependency-artifacts/uniswap/UniswapV2Factory.json";

import MushroomNFT from "../../artifacts/MushroomNFT.json";
import CentralizedRateVote from "../../artifacts/CentralizedRateVote.json";

export const presaleIface = new utils.Interface(SporePresale.abi);
export const proxyAdminIface = new utils.Interface(ProxyAdmin.abi);
export const sporeTokenIface = new utils.Interface(SporeToken.abi);
export const erc20Iface = new utils.Interface(IERC20.abi);
export const uniswapRouterIface = new utils.Interface(UniswapV2Router.abi);
export const geyserEscrowIface = new utils.Interface(GeyserEscrow.abi);
export const missionIface = new utils.Interface(Mission.abi);
export const rateVoteIFace = new utils.Interface(RateVote.abi);

export const sporePoolIface = new utils.Interface(SporePool.abi);
export const mushroomFactoryIface = new utils.Interface(MushroomFactory.abi);
export const bannedContractListIface = new utils.Interface(BannedContractList.abi);

export const mushroomNftIface = new utils.Interface(MushroomNFT.abi);
export const metadataResolverIface = new utils.Interface(MetadataResolver.abi);
export const mushroomAdapterIface = new utils.Interface(MushroomAdapter.abi);

export const centralizedRateVoteIface = new utils.Interface(CentralizedRateVote.abi);