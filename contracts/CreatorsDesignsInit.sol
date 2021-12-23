//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CreatorsDesignsInternal.sol";
import "./LibCreatorsDesigns.sol";
import "./utils/cryptography/draft-EIP712Init.sol";
import "./access/AccessControlInternal.sol";
import "./security/Pausable.sol";
import "./@rarible/royalties/contracts/LibRoyaltiesV2.sol";
import "@solidstate/contracts/access/OwnableStorage.sol";
import "@solidstate/contracts/introspection/IERC165.sol";
import "@solidstate/contracts/introspection/ERC165Storage.sol";
import "@solidstate/contracts/token/ERC721/IERC721.sol";
import "@solidstate/contracts/token/ERC721/metadata/IERC721Metadata.sol";
import "@solidstate/contracts/token/ERC721/metadata/ERC721MetadataStorage.sol";

contract CreatorsDesignsInit is
    EIP712Init,
    CreatorsDesignsInternal,
    AccessControlInternal
{
    using ERC165Storage for ERC165Storage.Layout;

    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    function __CreatorsDesigns_init(string memory name_, string memory symbol_)
        external
    {
        ERC721MetadataStorage.Layout storage l = ERC721MetadataStorage.layout();
        l.name = name_;
        l.symbol = symbol_;

        _setupRole(LibCreatorsDesigns.MINTER_ROLE, msg.sender);
        _setupRole(LibCreatorsDesigns.PAUSER_ROLE, msg.sender);
        OwnableStorage.layout().owner = msg.sender;

        ERC165Storage.layout().setSupportedInterface(
            type(IERC165).interfaceId,
            true
        );
        ERC165Storage.layout().setSupportedInterface(
            type(IERC721).interfaceId,
            true
        );
        ERC165Storage.layout().setSupportedInterface(
            type(IERC721Metadata).interfaceId,
            true
        );
        ERC165Storage.layout().setSupportedInterface(
            LibRoyaltiesV2._INTERFACE_ID_ROYALTIES,
            true
        );

        ERC165Storage.layout().setSupportedInterface(
            _INTERFACE_ID_ERC2981,
            true
        );

        _setBaseURI("ipfs://");

        __EIP712_init_unchained(name_, "1");
    }
}
