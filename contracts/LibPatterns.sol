// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./utils/Counters.sol";

library LibPatterns {
    bytes32 public constant STORAGE_SLOT = keccak256("create.patterns.storage");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Layout {
        Counters.Counter tokenIdTracker;
        mapping(uint256 => address) royalties;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 position = STORAGE_SLOT;
        assembly {
            l.slot := position
        }
    }
}
