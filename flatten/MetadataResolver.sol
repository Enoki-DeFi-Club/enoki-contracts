// Dependency file: contracts/MushroomLib.sol

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


// Root file: contracts/metadata/resolvers/MetadataResolver.sol

pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

// import "contracts/MushroomLib.sol";

abstract contract MetadataResolver {
    using MushroomLib for MushroomLib.MushroomData;
    using MushroomLib for MushroomLib.MushroomType;

    function getMushroomData(uint256 index, bytes calldata data) external virtual view returns (MushroomLib.MushroomData memory);
    function setMushroomLifespan(uint256 index, uint256 lifespan, bytes calldata data) external virtual;
}
