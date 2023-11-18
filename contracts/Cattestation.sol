// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {NO_EXPIRATION_TIME, EMPTY_UID} from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

/// @title Cattestation
/// @notice Pet cats in Istanbul, they meow back
contract Cattestation is ERC721Enumerable, EIP712, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct ECDSASignature {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    struct Catadata {
        string name;
        string description;
        string image;
    }

    error UnknownCatTBH(address cat);
    error WeKnowThisOne(address cat);

    /// @notice EIP-712 typehash for cat meows
    bytes32 public constant MEOW_TYPEHASH =
        keccak256("Meow(address human,string message)");

    /// @notice EAS contract
    address public immutable eas;
    /// @notice EAS schema
    bytes32 public immutable easPetSchema;

    /// @notice CATS!!!
    EnumerableSet.AddressSet private cats;
    /// @notice Cat metadata
    mapping(address cat => Catadata) public catadatas;
    /// @notice EAS Attestation mapping
    mapping(uint256 tokenId => bytes32) public cattestationIds;
    /// @notice tokenId => cat
    mapping(uint256 tokenId => address) private tokenIdToCat;

    constructor(
        address eas_,
        bytes32 easPetSchema_
    )
        ERC721("Cattestations", "KEDI")
        EIP712("Cattestation", "1")
        Ownable(msg.sender)
    {
        eas = eas_;
        easPetSchema = easPetSchema_;
    }

    /// @notice Register a cat, right meow!
    /// @param cat The kawaii neko
    /// @param catadata Catadata
    function register(
        address cat,
        Catadata calldata catadata
    ) external onlyOwner {
        if (cats.contains(cat)) {
            revert WeKnowThisOne(cat);
        }
        cats.add(cat);
        catadatas[cat] = catadata;
    }

    /// @notice Update a cat's catadata
    /// @param cat The cat
    /// @param catadata New catadata URI
    function update(
        address cat,
        Catadata calldata catadata
    ) external onlyOwner {
        if (!cats.contains(cat)) {
            revert UnknownCatTBH(cat);
        }
        catadatas[cat] = catadata;
    }

    /// @notice Liquidate a cat :(
    /// @param cat Cat
    function liquidate(address cat) external onlyOwner {
        if (!cats.contains(cat)) {
            revert UnknownCatTBH(cat);
        }
        cats.remove(cat);
    }

    /// @notice Check if we know this cat
    /// @param cat The cat
    function isKawaii(address cat) external view returns (bool) {
        return cats.contains(cat);
    }

    /// @notice List paginated cats
    /// @param offset Offset to start page at
    /// @param limit Limit of cats to be returned per page
    /// @return catslice A slice of CATS!!!
    function list(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory catslice) {
        uint256 len = offset + limit > cats.length()
            ? cats.length() - offset
            : limit;
        catslice = new address[](len);
        for (uint256 i; i < len; ++i) {
            catslice[i] = cats.at(offset + i);
        }
    }

    /// @notice Prove that you did indeed pet a cat by submitting a
    ///     cattestation that the cat meowed back.
    /// @param human The human that pet the cat
    /// @param message A message uttered by the human to the cat
    /// @param sig A signature proving a human pet the cat, signed by the cat's
    ///     private key.
    function pet(
        address human,
        string calldata message,
        ECDSASignature calldata sig
    ) external {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(MEOW_TYPEHASH, human, keccak256(bytes(message)))
            )
        );
        address cat = ECDSA.recover(digest, sig.v, sig.r, sig.s);
        if (!cats.contains(cat)) {
            revert UnknownCatTBH(cat);
        }

        bytes32 cattestationId = IEAS(eas).attest(
            AttestationRequest({
                schema: easPetSchema,
                data: AttestationRequestData({
                    recipient: human,
                    expirationTime: NO_EXPIRATION_TIME,
                    revocable: false,
                    refUID: EMPTY_UID,
                    data: abi.encode(cat, human, message),
                    value: 0
                })
            })
        );

        uint256 tokenId = totalSupply() + 1;
        cattestationIds[tokenId] = cattestationId;
        tokenIdToCat[tokenId] = cat;
        _safeMint(human, tokenId);
    }

    /// @notice See {IERC721Metadata-tokenURI}.
    /// @param tokenId Id of...token
    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        Catadata memory catadata = catadatas[tokenIdToCat[tokenId]];
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name":"',
            catadata.name,
            '",',
            '"description":"',
            catadata.description,
            '",',
            '"image":"',
            catadata.image,
            '"',
            "}"
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }
}
