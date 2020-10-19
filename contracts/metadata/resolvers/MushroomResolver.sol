pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "../../MushroomNFT.sol";
import "../../MushroomLib.sol";
import "./MetadataResolver.sol";

/*
    Reads mushroom NFT metadata directly from the Mushroom NFT contract
*/ 
contract MushroomResolver is Initializable, Ownable, MetadataResolver {
    MushroomNFT public mushroomNft;

    function initialize(address mushroomNft_) public initializer {
        mushroomNft = MushroomNFT(mushroomNft_);
    }

    function getMushroomData(uint256 index, bytes calldata data) external override view returns (MushroomData memory) {
        MushroomData memory mData = mushroomNft.getMushroomData(index);
        return mData;
    }
    function setMushroomLifespan(uint256 index, uint256 lifespan, bytes calldata data) external override {
        mushroomNft.setMushroomLifespan(index, lifespan);
    }
}