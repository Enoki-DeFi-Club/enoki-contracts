pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

import "../../MushroomNFT.sol";
import "../../MushroomLib.sol";
import "./MetadataResolver.sol";

/*
    Reads mushroom NFT metadata directly from the Mushroom NFT contract
*/ 
contract MushroomResolver is Initializable, OwnableUpgradeSafe, MetadataResolver {
    using MushroomLib for MushroomLib.MushroomData;
    using MushroomLib for MushroomLib.MushroomType;

    MushroomNFT public mushroomNft;
    address public lifespanManager;

    function initialize(address mushroomNft_, address lifespanManager_) public initializer {
        __Ownable_init();
        mushroomNft = MushroomNFT(mushroomNft_);
        lifespanManager = lifespanManager_;
    }

    function getMushroomData(uint256 index, bytes calldata data) external view override returns (MushroomLib.MushroomData memory) {
        MushroomLib.MushroomData memory mData = mushroomNft.getMushroomData(index);
        return mData;
    }

    // All Mushrooms are burnable
    function isBurnable(uint256 index) external override view returns (bool) {
        return true;
    }

    function setMushroomLifespan(uint256 index, uint256 lifespan, bytes calldata data) external override {
        require(msg.sender == lifespanManager, "Only lifespanManager can request mushroom lifespan set");
        mushroomNft.setMushroomLifespan(index, lifespan);
    }
}