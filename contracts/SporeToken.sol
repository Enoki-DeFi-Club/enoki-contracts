pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SporeToken is ERC20("SporeFinance", "SPORE"), Ownable {
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    bool internal _transfersEnabled = true;
    bool internal _usedTransferDisable = false;

    mapping (address => bool) public minters;

    /* ========== CONSTRUCTOR ========== */

    constructor() public {
        _transfersEnabled = true;
        minters[msg.sender] = true;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /// @notice Transfer is enabled as normal except during an initial phase
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(_transfersEnabled, "SporeToken: transfers not enabled");

        return super.transfer(recipient, amount);
    }

    /// @notice TransferFrom is enabled as normal except during an initial phase
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(_transfersEnabled, "SporeToken: transfers not enabled");

        return super.transferFrom(sender, recipient, amount);
    }

    /// @notice Any account is entitled to burn their own tokens
    function burn(uint amount) public {
        require(amount > 0);
        require(balanceOf(msg.sender) >= amount);
        _burn(msg.sender, amount);
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function mint(address to, uint amount) public onlyMinter {
        _mint(to, amount);
    }

    /// @notice Owner can one-time disable token transfers, which will be used to prevent trading until the presale is complete
    function oneTimeTransferDisable() public onlyOwner {
        require(!_usedTransferDisable, "SporeToken: one time transfer disable already used");
        _usedTransferDisable = true;
        _transfersEnabled = false;
    }

    /// @notice Re-enable transfers after the initial period where transfers are disabled.
    function enableTransfers() public onlyOwner {
        _transfersEnabled = true;
    }

    function addMinter(address account) public onlyOwner {
        minters[account] = true;
    }

    function removeMinter(address account) public onlyOwner {
        minters[account] = false;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "Restricted to minters.");
        _;
    }
}
