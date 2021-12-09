// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@solidstate/contracts/utils/EnumerableSet.sol";

library LibAccessControlEnumerable {
    bytes32 constant STORAGE_SLOT =
        keccak256("access.control.enumerable.storage");

    struct Layout {
        mapping(bytes32 => EnumerableSet.AddressSet) roleMembers;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 position = STORAGE_SLOT;
        assembly {
            l.slot := position
        }
    }
}
