// Dependency file: contracts/MushroomLib.sol

// SPDX-License-Identifier: MIT

// pragma solidity ^0.6.0;

library MushroomLib {
    struct MushroomData {
        uint256 species;
        uint256 strength;
        uint256 lifespan;
    }

    struct MushroomType {
        uint256 id;
        uint256 strength;
        uint256 minLifespan;
        uint256 maxLifespan;
        uint256 minted;
        uint256 cap;
    }
}


// Root file: contracts/interfaces/IMushroomMetadata.sol


pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

// import "contracts/MushroomLib.sol";

abstract contract IMushroomMetadata {
    using MushroomLib for MushroomLib.MushroomData;
    using MushroomLib for MushroomLib.MushroomType;

    function hasMetadataAdapter(address nftContract) external virtual view returns (bool);

    function getMushroomData(
        address nftContract,
        uint256 nftIndex,
        bytes calldata data
    ) external virtual view returns (MushroomLib.MushroomData memory);

    function setMushroomLifespan(
        address nftContract,
        uint256 nftIndex,
        uint256 lifespan,
        bytes calldata data
    ) external virtual;

    function setResolver(address nftContract, address resolver) public virtual;
}
