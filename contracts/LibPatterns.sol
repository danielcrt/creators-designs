// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./utils/Counters.sol";
import "./utils/cryptography/LibEIP712.sol";

library LibPatterns {
    using ECDSA for bytes32;

    bytes32 public constant STORAGE_SLOT = keccak256("create.patterns.storage");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    string constant SIGNATURE_ERROR = "signature verification error";
    bytes32 public constant MINT_AND_TRANSFER_TYPEHASH =
        keccak256(
            "CreatorsPatternsMetadata(string tokenId,string tokenURI,address creator,uint256 price,uint256 expiresAt)"
        );

    struct Layout {
        Counters.Counter tokenIdTracker;
        mapping(uint256 => address) royalties;
    }

    struct CreatorsPatternsMetadata {
        string tokenId;
        string tokenURI;
        address creator;
        uint256 price;
        uint256 expiresAt;
        bytes signature;
    }

    function hash(CreatorsPatternsMetadata memory data)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    MINT_AND_TRANSFER_TYPEHASH,
                    keccak256(bytes(data.tokenId)),
                    keccak256(bytes(data.tokenURI)),
                    data.creator,
                    data.price,
                    data.expiresAt
                )
            );
    }

    function validateSignature(
        address signer,
        bytes32 structHash,
        bytes memory signature
    ) internal view {
        bytes32 typedHash = LibEIP712.hashTypedDataV4(structHash);
        require(typedHash.recover(signature) == signer, SIGNATURE_ERROR);
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 position = STORAGE_SLOT;
        assembly {
            l.slot := position
        }
    }
}
