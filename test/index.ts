import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as chai from "chai";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { deployDiamond } from "../scripts/libraries/diamond";
import chaiAsPromised from "chai-as-promised";
import { CreatePatterns } from "../typechain";
chai.use(chaiAsPromised)

describe("CreatePatterns", function () {
  const name = 'My NFT';
  const symbol = 'SYMBOL';
  const MINTER_ROLE = ethers.utils.solidityKeccak256(["string"], ["MINTER_ROLE"]);
  const PAUSER_ROLE = ethers.utils.solidityKeccak256(["string"], ["PAUSER_ROLE"]);
  const tokenUri = '<token_uri>';

  let [deployer, account1]: SignerWithAddress[] = [];
  let token: CreatePatterns;

  this.beforeEach(async () => {
    [deployer, account1] = await ethers.getSigners();
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
    expect(token.owner()).to.eventually.be.equal(deployer.address);
  });

  it("Minter can mint", async function () {
    expect(token.mint(account1.address, tokenUri)).to.eventually.be.fulfilled;
  });

  it("Balance increments after mint", async function () {
    await token.mint(deployer.address, tokenUri);
    expect(token.balanceOf(deployer.address)).to.eventually.equal(1);
  });

  it("Non minter cannot mint", async function () {
    expect(token.connect(account1).mint(account1.address, tokenUri)).to.eventually.be.rejected;
  });

  it("Pauser can pause", async function () {
    expect(token.pause()).to.eventually.be.fulfilled;
  });

  it("Pauser can unpause", async function () {
    await token.pause();
    expect(token.unpause()).to.eventually.be.fulfilled;
  });

  it("Non pauser cannot pause", async function () {
    expect(token.connect(account1).pause()).to.eventually.be.rejected;
  });

  it("Pauser can unpause", async function () {
    await token.pause();
    expect(token.connect(account1).unpause()).to.eventually.be.rejected;
  });

  it("Default royalty is 10%", async function () {
    const royalty10Percent = 1000;
    await token.connect(deployer).mint(account1.address, tokenUri);
    const token0Royalty = await token.getRaribleV2Royalties(0);
    expect(token0Royalty[0][1]).to.equal(royalty10Percent);
  });

  it("Royalties can be updated", async function () {
    const royalty10Percent = 1000;
    await token.connect(deployer).mint(account1.address, tokenUri);
    await token.connect(deployer).setRoyalties(0, account1.address, royalty10Percent);
    const token0Royalty = await token.getRaribleV2Royalties(0);
    expect(token0Royalty[0][1]).to.equal(royalty10Percent);
  });

  it("Can update base token uri", async function () {
    const baseUri = 'ipfs://';
    await token.connect(deployer).mint(account1.address, tokenUri);
    await token.connect(deployer).setBaseURI(baseUri);
    expect(token.tokenURI(0)).to.eventually.be.equal(baseUri + tokenUri);
  });

  it("Can update token uri", async function () {
    const newTokenUri = '<new_token_uri>';
    await token.connect(deployer).mint(account1.address, tokenUri);
    await token.connect(account1).setTokenURI(0, newTokenUri);
    expect(token.tokenURI(0)).to.eventually.be.equal(newTokenUri);
  });

  it("Only token owner or approved can change token uri", async function () {
    const newTokenUri = '<new_token_uri>';
    await token.connect(deployer).mint(account1.address, tokenUri);
    expect(token.connect(deployer).setTokenURI(0, newTokenUri)).to.be.rejected;
  });
});
