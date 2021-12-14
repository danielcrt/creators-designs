import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Bytes } from "ethers";
import { ethers } from "hardhat";


export type CreatorsMetadata = {
    tokenId: string;
    tokenURI: string;
    creator: string;
    price: BigNumber;
    expiresAt: number;
    signature: Bytes;
}

const defaultCreatorsMetadata: CreatorsMetadata = {
    tokenId: '',
    tokenURI: '',
    creator: '',
    price: BigNumber.from(0),
    expiresAt: Date.now(),
    signature: [],
}

const Types = {
    CreatorsPatternsMetadata: [
        { name: 'tokenId', type: 'string' },
        { name: 'tokenURI', type: 'string' },
        { name: 'creator', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: 'expiresAt', type: 'uint256' },
    ]
};

async function signAsset(asset: CreatorsMetadata, account: SignerWithAddress, eip712Name: string, verifyingContract: string): Promise<string> {
    const { chainId } = await ethers.provider.getNetwork();

    return (await account._signTypedData(
        {
            name: eip712Name,
            version: "1",
            chainId,
            verifyingContract
        }, Types, asset));
}

export { defaultCreatorsMetadata, signAsset }