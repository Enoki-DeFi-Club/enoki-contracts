# Deploy Process
There is a deployer which runs the deploy script. By the end of the script, it will have transferred all ownership & tokens to their appropriate recipients.

# Stage 1: Core
- Deploy Enoki DAO + ENOKI Token

- Deploy SPORE Token
    - Mint initial tokens
    - Remove deployer as minter
    - Transfer ownership to DAO

- Deploy Presale
    - Lock portion of SPORE supply in presale

- Provide 5000 SPORE tokens for Uniswap pool w/ 300 ETH for initial liquidity. Lock up the LP tokens in a vesting contract, to be released to the DAO over 24 months.

- Deploy Proxy Admin for DAO Upgradable Contracts

- Deploy vesting contract for LP tokens

- Deploy Missions
    - Lock 210,000 SPORE tokens in Missions
    - The Dev has the ability to approve new pools for the Missions
    - The DAO is the owner. The owner has the ability to set or revoke pool approving rights (This right belongs to the Dev to start)

- Deploy ENOKI escrow
    - Will hold the initial ENOKI supply, to be deposited in the Geyser once ready

# Stage 2: Pools, Mushrooms & Supporting Infrastructure
- Deploy Mushroom NFT + Mushroom Factories
    - One mushroom factory per Spore pool

- Deploy Spore Pools

- Deploy Metadata Registry + Metadata Resolver for Mushroom NFTs

- Initialize Mushroom Factories with their appropriate pool addresses
- Give Mushroom factories minting permissions for Mushroom NFTs

- Setup Metadata Resolver permissions & abilities for Mushroom factories

- Deploy Incubator



