pragma solidity ^0.6.0;

// Only smart contracts will be affected by this modifier
contract Defensible {
    modifier defend() {
        require(
            (msg.sender == tx.origin) // If it is a normal user and not smart contract, then the requirement will pass
        );
        _;
    }
}
