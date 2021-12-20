import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as chai from "chai";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployDiamond } from "../scripts/libraries/diamond";
import { CreatorsMetadata, defaultCreatorsMetadata, signAsset } from "./helpers/assets";
import chaiAsPromised from "chai-as-promised";
import { CreatePatterns } from "../typechain";
import { Bytes } from "ethers";
import { latestTime } from "./helpers/latestTime";
import { increaseTimeTo } from "./helpers/increaseTime";
chai.use(chaiAsPromised)

describe("CreatePatterns", function () {
  const name = 'CreatePatterns';
  const eip712Name = name;
  const symbol = 'SYMBOL';
  const MINTER_ROLE = ethers.utils.solidityKeccak256(["string"], ["MINTER_ROLE"]);
  const PAUSER_ROLE = ethers.utils.solidityKeccak256(["string"], ["PAUSER_ROLE"]);
  const tokenURI = '<token_uri>';
  const baseUri = 'ipfs://';
  const defaultToken: CreatorsMetadata = {
    ...defaultCreatorsMetadata,
    tokenURI
  };

  let [deployer, account1]: SignerWithAddress[] = [];
  let token: CreatePatterns;

  this.beforeEach(async () => {
    [deployer, account1] = await ethers.getSigners();
    defaultToken.creator = deployer.address;

    token = await deployDiamond(
      'CreatePatterns',
      'CreatePatternsInit',
      '__CreatePatterns_init',
      [
        name, symbol
      ]
    ) as CreatePatterns;
  });

  it("Should have the right metadata", async function () {
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
  });

  it("Deployer has pauser and minter roles", async function () {
    expect(await token.hasRole(MINTER_ROLE, deployer.address)).to.equal(true);
    expect(await token.hasRole(PAUSER_ROLE, deployer.address)).to.equal(true);
  });

  it("Deployer is owner", async function () {
    await expect(token.owner()).to.eventually.be.equal(deployer.address);
  });

  it("Minter can mint to his own wallet", async function () {
    await expect(token.connect(deployer).mint(deployer.address, defaultToken)).to.eventually.be.fulfilled;
  });

  it("Creator can mint to another wallet", async function () {
    await expect(token.connect(deployer).mint(account1.address, defaultToken)).to.be.fulfilled;
  });

  it("Mint to another wallet emits 2 transfers", async function () {
    await expect(token.connect(deployer).mint(account1.address, defaultToken))
      .to.emit(token, 'Transfer').withArgs(ethers.constants.AddressZero, deployer.address, 0)
      .to.emit(token, 'Transfer').withArgs(deployer.address, account1.address, 0);
  });

  it("Mint to own wallet emits 1 transfer", async function () {
    await expect(token.connect(deployer).mint(deployer.address, defaultToken))
      .to.emit(token, 'Transfer').withArgs(ethers.constants.AddressZero, deployer.address, 0)
  });

  it("Balance increments after mint", async function () {
    await token.mint(deployer.address, defaultToken);
    await expect(token.balanceOf(deployer.address)).to.eventually.equal(1);
  });

  it("Non minter cannot mint", async function () {
    await expect(token.connect(account1).mint(account1.address, defaultToken)).to.eventually.be.rejected;
  });

  it("Pauser can pause", async function () {
    await expect(token.pause()).to.eventually.be.fulfilled;
  });

  it("Pauser can unpause", async function () {
    await token.pause();
    await expect(token.unpause()).to.eventually.be.fulfilled;
  });

  it("Non pauser cannot pause", async function () {
    await expect(token.connect(account1).pause()).to.eventually.be.rejected;
  });

  it("Pauser can unpause", async function () {
    await token.pause();
    await expect(token.connect(account1).unpause()).to.eventually.be.rejected;
  });

  it("Default royalty is 10%", async function () {
    const royalty10Percent = 1000;
    await token.connect(deployer).mint(account1.address, defaultToken);
    const token0Royalty = await token.getRaribleV2Royalties(0);
    expect(token0Royalty[0][1]).to.equal(royalty10Percent);
  });

  it("Royalties can be updated", async function () {
    const royalty10Percent = 1000;
    await token.connect(deployer).mint(account1.address, defaultToken);
    await token.connect(deployer).setRoyalties(0, account1.address, royalty10Percent);
    const token0Royalty = await token.getRaribleV2Royalties(0);
    expect(token0Royalty[0][1]).to.equal(royalty10Percent);
  });

  it("Can update base token uri", async function () {
    await token.connect(deployer).mint(account1.address, defaultToken);
    await token.connect(deployer).setBaseURI(baseUri);
    await expect(token.tokenURI(0)).to.eventually.be.equal(baseUri + tokenURI);
  });

  it("Can update token uri", async function () {
    const newtokenURI = '<new_token_uri>';
    await token.connect(deployer).mint(account1.address, defaultToken);
    await token.connect(account1).setTokenURI(0, newtokenURI);
    await expect(token.tokenURI(0)).to.eventually.be.equal(baseUri + newtokenURI);
  });

  it("Only token owner or approved can change token uri", async function () {
    const newtokenURI = '<new_token_uri>';
    await token.connect(deployer).mint(account1.address, defaultToken);
    await expect(token.connect(deployer).setTokenURI(0, baseUri + newtokenURI)).to.be.rejected;
  });

  it("Can lazy mint", async function () {
    const price = ethers.utils.parseEther('0.0005');
    const assetMetadata = {
      tokenId: '5a457352-fa9a-494d-b709-93dccf931bf7',
      tokenURI: '123',
      price: price,
      creator: deployer.address,
      expiresAt: Date.now() + 3600 * 24,
    } as CreatorsMetadata;

    assetMetadata.signature = await getAssetSignature(assetMetadata, deployer);
    await expect(token.connect(account1).mint(account1.address, assetMetadata, { value: price }))
      .to.emit(token, 'Transfer').withArgs(ethers.constants.AddressZero, deployer.address, 0)
      .to.emit(token, 'Transfer').withArgs(deployer.address, account1.address, 0);

    await expect(token.balanceOf(account1.address)).to.eventually.equal(1);
  });

  it("Lazy mint denied. Not enough ETH", async function () {
    const price = ethers.utils.parseEther('0.0005');
    const assetMetadata = {
      tokenId: '5a457352-fa9a-494d-b709-93dccf931bf7',
      tokenURI: '123',
      price: price,
      creator: deployer.address,
      expiresAt: Date.now() + 3600 * 24,
    } as CreatorsMetadata;

    assetMetadata.signature = await getAssetSignature(assetMetadata, deployer);
    await expect(token.connect(account1).mint(account1.address, assetMetadata, { value: price.sub(1) })).to.be.rejected;
  });

  it("Lazy mint denied. Signature expired", async function () {
    const price = ethers.utils.parseEther('0.0005');
    const expiresAfter = Date.now() + 3600 * 24;
    const assetMetadata = {
      tokenId: '5a457352-fa9a-494d-b709-93dccf931bf7',
      tokenURI: '123',
      price: price,
      creator: deployer.address,
      expiresAt: Date.now() + 3600 * 24,
    } as CreatorsMetadata;

    await increaseTimeTo(await latestTime() + expiresAfter + 1);

    assetMetadata.signature = await getAssetSignature(assetMetadata, deployer);
    await expect(token.connect(account1).mint(account1.address, assetMetadata, { value: price })).to.be.rejected;
  });

  it("Cannot lazy mint twice with the same signature", async function () {
    const price = ethers.utils.parseEther('0.0005');
    const assetMetadata = {
      tokenId: '5a457352-fa9a-494d-b709-93dccf931bf7',
      tokenURI: '123',
      price: price,
      creator: deployer.address,
      expiresAt: await latestTime() + 3600 * 24,
    } as CreatorsMetadata;

    assetMetadata.signature = await getAssetSignature(assetMetadata, deployer);
    await token.connect(account1).mint(account1.address, assetMetadata, { value: price });
    await expect(token.connect(account1).mint(account1.address, assetMetadata, { value: price })).to.be.rejected;
  });

  async function getAssetSignature(asset: CreatorsMetadata, signer: SignerWithAddress): Promise<Bytes> {
    return ethers.utils.arrayify(
      await signAsset(asset, signer, eip712Name, token.address)
    );
  }
});