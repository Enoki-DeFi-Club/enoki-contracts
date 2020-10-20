import Web3 from "web3";
import { EnokiSystem } from "../systems/EnokiSystem";
import { Configs, LaunchConfig } from "../config/launchConfig";
import dotenv from "dotenv";
import { providers, Signer } from "ethers";
import { confirmCore } from "../confirmCore";
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

export async function deployCore(
  jsonRpcProvider: providers.Provider,
  deployer: Signer,
  flags: LaunchFlags
): Promise<{
  enoki: EnokiSystem;
  config: LaunchConfig;
}> {
  const enoki = new EnokiSystem(
    Configs.MAINNET,
    jsonRpcProvider,
    deployer,
    flags
    )

  // Deploy SPORE token
  console.log(colors.title("---Connect Enoki DAO---"));
  await enoki.connectEnokiDAO();
  console.log("");

  console.log(colors.title("---Connect Dev Multisig---"));
  await enoki.connectDevMultisig();
  console.log("");

  console.log(colors.title("---Deploy Proxy Admin---"));
  await enoki.deployProxyAdmin();
  console.log("");

  console.log(colors.title("---Deploy Approved Contracts List---"));
  await enoki.deployApprovedContractList();
  console.log("");

  console.log(colors.title("---Deploy SPORE Token---"));
  await enoki.deploySporeToken();
  console.log("");

  console.log(colors.title("---Connect Uniswap System---"));
  await enoki.connectUniswap();
  console.log("");

  console.log(colors.title("---Deploy Enoki Geyser & Escrow---"));
  await enoki.deployEnokiGeyser();
  console.log("");

  console.log(colors.title("---Deploy Vesting Infrastructure---"));
  await enoki.deployVestingInfrastructure();
  console.log("");

  console.log(colors.title("---Deploy Presale---"));
  await enoki.deployPresale();
  console.log("");

  console.log(colors.title("---Deploy Mission 0---"));
  await enoki.deployMission0();
  console.log("");

  console.log(colors.title("---Mint Initial SPORE Tokens---"));
  await enoki.mintInitialSporeTokens();
  console.log("");

  console.log(colors.title("---Finalize SPORE Permissions---"));
  await enoki.finalizeSporeTokenPermissions();
  console.log("");

  console.log(colors.title("---Lock ENOKI in Geyser Escrow---"));
  await enoki.lockEnokiInGeyserEscrow();
  console.log("");

  console.log(colors.title("---Submit Whitelist Addresses---"));
  await enoki.populateWhitelist();
  console.log("");

  console.log(colors.title("---Transfer Presale to DevMultisig---"));
  await enoki.transferPresaleToMultisig();
  console.log("");

  await confirmCore(enoki, Configs.MAINNET);

  return { enoki, config: Configs.MAINNET };
}
