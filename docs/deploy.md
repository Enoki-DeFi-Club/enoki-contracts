# Deploy Process
There is a deployer which runs the deploy script. By the end of the script, it will have transferred all ownership & tokens to their appropriate recipients. There are two deploys, one for the Enoki Core and one for the Pools, Mushrooms & associated mechanics.

# Stage 1: Enoki Core
Prerequisites (Before script, put addresses in launch config):
- Enoki DAO + ENOKI Token
- Dev Multisig

Script Actions:
- Deploy SPORE Token
    - Mint initial tokens
    - Transfer ownership & minting rights to DAO
    - Give Dev initial transfer switch rights, to ensure initial liquidity is not frontrun
        - Transfer permissions to Dev (and Uni pool?)

- Deploy PaymentSplitter & Dev fund TokenVesting
    - 2/3 of presale funds go to 6 months token vesting
    - 1/3 goes toward initial liquidity, will be sent directly to dev multisig for locking in Uni pool

- Deploy Presale
    - Lock portion of SPORE supply in presale
    - Add all whitelist addresses from config, in batches

- Deploy Proxy Admin for DAO Upgradable Contracts

- Deploy Mission0 + Escrow
    - Deploy Mission0 Logic
    - Deploy Mission0 Proxy
    - Deploy Escrow for 210,000 SPORE tokens and lock until pool launch
        - Recipient should be Mission0 contract
    - The Dev has the ability to approve new pools for mission
    - The DAO is the owner. The owner has the ability to set or revoke pool approving rights (This right belongs to the Dev to start)

- Deploy ENOKI Geyser + Escrow
    - Will hold the initial ENOKI supply, to be deposited in the Geyser once ready
    - Deploy Geyser Proxy
    - Deploy Geyser Logic
    - (Later: Give upgradability to DAO on Dev key burn)


## Stage 1a: After Presale begins
- Dev provides 5000 SPORE tokens for Uniswap pool w/ 300 ETH for initial liquidity.
    - Create UNI pool in this process

- Deploy a TokenVesting contract
    - Cliff 1 month, total duration 24 months
    - Lock all initial LP tokens

- Once initial liquidity is locked, enable free transfer of SPORE

# Stage 2: Pools, Mushrooms & Supporting Infrastructure
- Deploy Mushroom NFT + Mushroom Factories
    - One mushroom factory per Spore pool

- Deploy Spore Pools

- Deploy Metadata Registry + Metadata Resolver for Mushroom NFTs

- Initialize Mushroom Factories with their appropriate pool addresses
- Give Mushroom factories minting permissions for Mushroom NFTs

- Setup Metadata Resolver permissions & abilities for Mushroom factories

- Deploy Incubator



