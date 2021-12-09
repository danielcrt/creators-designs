// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibPausable {
    bytes32 constant STORAGE_SLOT = keccak256("security.pausable.storage");

    struct Layout {
        bool paused;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 position = STORAGE_SLOT;
        assembly {
            l.slot := position
        }
    }
}
