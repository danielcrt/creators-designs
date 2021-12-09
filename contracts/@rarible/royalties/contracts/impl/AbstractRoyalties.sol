// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../LibPart.sol";
import "../LibRoyaltiesV2.sol";

abstract contract AbstractRoyalties {
    function _saveRoyalties(uint256 _id, LibPart.Part[] memory _royalties)
        internal
    {
        uint256 totalValue;
        for (uint256 i = 0; i < _royalties.length; i++) {
            require(
                _royalties[i].account != address(0x0),
                "Recipient should be present"
            );
            require(
                _royalties[i].value != 0,
                "Royalty value should be positive"
            );
            totalValue += _royalties[i].value;
            LibRoyaltiesV2.layout().royalties[_id].push(_royalties[i]);
        }
        require(totalValue < 10000, "Royalty total value should be < 10000");
        _onRoyaltiesSet(_id, _royalties);
    }

    function _updateAccount(
        uint256 _id,
        address _from,
        address _to
    ) internal {
        LibRoyaltiesV2.Layout storage l = LibRoyaltiesV2.layout();
        uint256 length = l.royalties[_id].length;
        for (uint256 i = 0; i < length; i++) {
            if (l.royalties[_id][i].account == _from) {
                l.royalties[_id][i].account = payable(address(uint160(_to)));
            }
        }
    }

    function _onRoyaltiesSet(uint256 _id, LibPart.Part[] memory _royalties)
        internal
        virtual;
}
