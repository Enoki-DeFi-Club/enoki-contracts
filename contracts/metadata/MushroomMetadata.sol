pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

import "./resolvers/MetadataResolver.sol";
import "../MushroomLib.sol";

contract MushroomMetadata is OwnableUpgradeSafe {
    using MushroomLib for MushroomLib.MushroomData;
    using MushroomLib for MushroomLib.MushroomType;

    mapping(address => address) public metadataResolvers;

    event ResolverSet(address nft, address resolver);

    modifier onlyWithMetadataResolver(address nftContract) {
        require(metadataResolvers[nftContract] != address(0), "MetadataRegistry: No resolver set for nft");
        _;
    }

    function hasMetadataResolver(address nftContract) external view returns (bool) {
        return metadataResolvers[nftContract] != address(0);
    }

    function getMetadataResolver(address nftContract) external view returns (address) {
        return metadataResolvers[nftContract];
    }

    function initialize() public initializer {
        __Ownable_init();
    }

    function getMushroomData(
        address nftContract,
        uint256 nftIndex,
        bytes calldata data
    ) external view onlyWithMetadataResolver(nftContract) returns (MushroomLib.MushroomData memory) {
        MetadataResolver resolver = MetadataResolver(metadataResolvers[nftContract]);
        MushroomLib.MushroomData memory mushroomData = resolver.getMushroomData(nftIndex, data);
        return mushroomData;
    }

    function isBurnable(
        address nftContract,
        uint256 nftIndex
    ) external view onlyWithMetadataResolver(nftContract) returns (bool) {
        MetadataResolver resolver = MetadataResolver(metadataResolvers[nftContract]);
        return resolver.isBurnable(nftIndex);
    }

    function setMushroomLifespan(
        address nftContract,
        uint256 nftIndex,
        uint256 lifespan,
        bytes calldata data
    ) external onlyWithMetadataResolver(nftContract) {
        MetadataResolver resolver = MetadataResolver(metadataResolvers[nftContract]);
        resolver.setMushroomLifespan(nftIndex, lifespan, data);
    }

    function setResolver(address nftContract, address resolver) public onlyOwner {
        metadataResolvers[nftContract] = resolver;

        emit ResolverSet(nftContract, resolver);
    }
}
