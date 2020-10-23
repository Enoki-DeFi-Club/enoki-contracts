import {utils} from "ethers";

import SporePresale from "../../artifacts/SporePresale.json";
import SporeToken from "../../artifacts/SporeToken.json";
import IERC20 from "../../artifacts/IERC20.json";
import GeyserEscrow from "../../artifacts/GeyserEscrow.json";
import Mission from "../../artifacts/Mission.json";

import UniswapV2Router from "../../dependency-artifacts/uniswap/UniswapV2Router02.json";

export const presaleIface = new utils.Interface(SporePresale.abi);
export const sporeTokenIface = new utils.Interface(SporeToken.abi);
export const erc20Iface = new utils.Interface(IERC20.abi);
export const uniswapRouterIface = new utils.Interface(UniswapV2Router.abi);
export const geyserEscrowIface = new utils.Interface(GeyserEscrow.abi);
export const missionIface = new utils.Interface(Mission.abi);
