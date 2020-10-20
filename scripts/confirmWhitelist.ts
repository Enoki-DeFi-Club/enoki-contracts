import {daysToSeconds, LaunchConfig} from "./config/launchConfig";
import {EnokiSystem} from "./systems/EnokiSystem";

export async function confirmWhitelist(
    enoki: EnokiSystem,
    config: LaunchConfig,
    whitelist: string[]
) {
    const whitelistCount = await enoki.presale.whitelistCount();
    console.log(`Whitelist Count
        Live: ${whitelistCount}
        Config: ${whitelist.length}
    `);

    const missing: string[] = [];

    for (const account of whitelist) {
        const isListed = await enoki.presale.whitelist(account);
        if (!isListed) {
            missing.push(account);
            console.log(`Address from config missing in live deploy: 
                ${account}
            `);
        }
    }
}
