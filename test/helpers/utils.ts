import { ethers } from "hardhat";

export async function deployContract(contractName: string, parameters: Array<any>) {
  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy(...parameters);
  return contract.deployed();
}