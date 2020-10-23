import Web3 from "web3";
import { EnokiSystem } from "../systems/EnokiSystem";
import { Configs, daysToSeconds, LaunchConfig } from "../config/launchConfig";
import dotenv from "dotenv";
import { providers, Signer } from "ethers";
import { confirmCore } from "../confirmCore";
import { deployed } from "./deployed";
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

export async function deployPools(
  enoki: EnokiSystem,
): Promise<{
  enoki: EnokiSystem;
}> {

  console.log(colors.title("---Deploy Initial Mission Pool---"));
  await enoki.deployMission0Pools();
  console.log("");

//   await confirmPools(enoki, Configs.MAINNET);

  return { enoki };
}
