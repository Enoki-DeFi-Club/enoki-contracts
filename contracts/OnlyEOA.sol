// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

/*
    Prevent smart contracts from calling functions.
*/
contract OnlyEOA {
 // Only smart contracts will be affected by this modifier
  modifier onlyEOA {
    require(
      (msg.sender == tx.origin), "Only EOAs can call"
    );
    _;
  }
}
