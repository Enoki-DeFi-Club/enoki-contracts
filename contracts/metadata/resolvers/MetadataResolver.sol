pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "../../MushroomLib.sol";

abstract contract MetadataResolver is MushroomLib {
    function getMushroomData(uint256 index, bytes calldata data) external virtual view returns (MushroomData memory);
    function setMushroomLifespan(uint256 index, uint256 lifespan, bytes calldata data) external virtual;
}
