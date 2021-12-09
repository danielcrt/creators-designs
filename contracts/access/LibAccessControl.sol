// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

struct RoleData {
    mapping(address => bool) members;
    bytes32 adminRole;
}

library LibAccessControl {
    bytes32 constant STORAGE_SLOT = keccak256("access.control.storage");

    struct Layout {
        mapping(bytes32 => RoleData) roles;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 position = STORAGE_SLOT;
        assembly {
            l.slot := position
        }
    }
}
