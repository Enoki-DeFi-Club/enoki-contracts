pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./MushroomNFT.sol";
import "./MushroomLib.sol";
import "./SporePool.sol";
import "./metadata/MushroomMetadata.sol";

contract MushroomFactory is Initializable, Ownable, MushroomLib {
    using SafeMath for uint256;

    SporePool public sporePool;
    IERC20 public sporeToken;
    MushroomNFT public mushroomNft;
    MushroomMetadata public mushroomMetadata;

    uint256 public costPerMushroom;
    uint256 public mySpecies;

    function initialize(SporePool sporePool_, IERC20 sporeToken_, MushroomNFT mushroomNft_, uint256 costPerMushroom_) public initializer {
        sporePool=sporePool_;
        sporeToken=sporeToken_;
        mushroomNft=mushroomNft_;
        costPerMushroom=costPerMushroom_;
    }

    function _generateMushroomLifespan(uint256 minLifespan, uint256 maxLifespan) internal returns (uint256) {
        uint256 range = maxLifespan.sub(minLifespan);
        uint256 fromMin = uint256(keccak256(block.timestamp)) % range;
        return minLifespan.add(fromMin);
    }

    // Each mushroom costs 1/10th of the spore rate in spores.
    function growMushrooms(address recipient, uint256 numMushrooms) public onlyOwner {
        MushroomType memory species = mushroomNft.getSpecies(mySpecies);

        for (uint256 i = 0; i < numMushrooms; i++) {
            uint256 nextId = mushroomNft.totalSupply().add(1);
            mushroomNft.mint(recipient, nextId, mySpecies, _generateMushroomLifespan(species.minLifespan, species.maxLifespan));
        }
    }
}