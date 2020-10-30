import Web3 from "web3";
import { EnokiSystem } from "../systems/EnokiSystem";
import { Configs, daysToSeconds, LaunchConfig } from "../config/launchConfig";
import dotenv from "dotenv";
import { providers, Signer } from "ethers";
import { confirmCore } from "../confirmCore";
import { deployed } from "./deployed";
import { confirmNewGeyser } from "../confirmNewGeyser";
import { confirmPools } from "../confirmPools";
export const colors = require("colors/safe");

colors.setTheme({
  title: ["rainbow", "bold"],
  testTitle: ["cyan", "bold"],
  input: "rainbow",
  verbose: "cyan",
  prompt: "grey",
  info: "green",
  data: "grey",
  help: "cyan",
  warn: "yellow",
  debug: "blue",
  error: "red",
});

dotenv.config();

export interface LaunchFlags {
  testmode: boolean;
}

/* Steps  
  - Deploy BannedContracts
  - Upgrade Missions0 to new contract
    (make sure to change approvedContractsList -> BannedContractsList)
  - Upgrade EnokiGeyser to new contract
    (approvedContractsList -> BannedContractsList)
  - Deploy Pools

  Does anything else require the ContractList update?

*/

export async function deployPools(
  enoki: EnokiSystem,
): Promise<{
  enoki: EnokiSystem;
}> {

  console.log(colors.title("---Deploy Banned Contract List---"));
  await enoki.deployBannedContractList();
  console.log("");

  console.log(colors.title("---Upgrade Enoki Geyser---"));
  await enoki.upgradeEnokiGeyser();
  console.log("");

  console.log(colors.title("---Confirm all variables of upgraded Geyser---"));
  await confirmNewGeyser(enoki, enoki.config);
  console.log("");

  console.log(colors.title("---Deploy Mushroom NFT---"));
  await enoki.deployMushroomNft();
  console.log("");

  console.log(colors.title("---Deploy Mushroom Metadata Infra---"));
  await enoki.deployMushroomMetadataInfra();
  console.log("");

  console.log(colors.title("---Deploy Initial Mission Pools & Mushroom Factories---"));
  await enoki.deployMission0Pools();
  console.log("");

  console.log(colors.title("---Set MetadataResolver on EnokiGeyser---"));
  console.log(colors.title("---Set Muchroom NFT minting & lifespan modification permissions---"));
  await enoki.setupMushroomInfra();
  console.log("");

  // await confirmPools(enoki, enoki.config);

  return { enoki };
}
