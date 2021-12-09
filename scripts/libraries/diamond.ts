import { Contract } from "ethers";
import { ethers } from "hardhat";
import { deployContract } from "../../test/helpers/utils";

export enum FacetCutAction { 'ADD' = 0, 'REPLACE' = 1, 'REMOVE' = 2 };

async function deployDiamond(facet: string, initializer?: string, functionName?: string, parameters?: Array<any>) {
  const signer = ethers.provider.getSigner();

  const diamondCutFacet = await deployContract('DiamondCutFacet', []);
  const diamondAddress = (await deployContract('Diamond', [await signer.getAddress(), diamondCutFacet.address])).address;
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress);

  await deployFacets(diamondCut, FacetCutAction.ADD, [
    'DiamondLoupeFacet',
    facet
  ], initializer, functionName, parameters);

  return await ethers.getContractAt(facet, diamondAddress);
}

async function deployFacets(diamondCutter: Contract, action: FacetCutAction, facetNames: string[], initializer?: string, functionName?: string, params?: Array<any>): Promise<void> {
  const cut = [];
  for (const facetName of facetNames) {
    const facet: Contract = await deployContract(facetName, []);
    cut.push({
      facetAddress: facet.address,
      action: action,
      functionSelectors: getSelectors(facet)
    })
  }

  if (initializer !== undefined && functionName !== undefined) {
    const initializerContract = await deployContract(initializer, []);
    const functionCall = initializerContract.interface.encodeFunctionData(functionName, params);
    const tx = await diamondCutter.diamondCut(cut, initializerContract.address, functionCall);
    await tx.wait();
  }
}

// get function selectors from ABI
function getSelectors(contract: Contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, [] as string[]);
  return selectors;
}

export {
  deployDiamond,
  deployFacets,
  getSelectors
}