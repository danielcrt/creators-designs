//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@solidstate/contracts/token/ERC721/metadata/ERC721MetadataStorage.sol";
import "@solidstate/contracts/token/ERC721/base/ERC721BaseStorage.sol";

abstract contract CreatePatternsInternal {
    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        internal
        virtual
    {
        ERC721MetadataStorage.layout().tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Internal function to set the base URI for all token IDs. It is
     * automatically added as a prefix to the value returned in {tokenURI},
     * or to the token ID if {tokenURI} is empty.
     */
    function _setBaseURI(string memory baseURI_) internal virtual {
        ERC721MetadataStorage.layout().baseURI = baseURI_;
    }

    event TokenPurchase(
        uint256 indexed offChainId,
        uint256 indexed tokenId,
        address buyer,
        uint256 price
    );
}
