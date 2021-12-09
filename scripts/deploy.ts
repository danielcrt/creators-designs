// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { deployDiamond } from "./libraries/diamond";

async function main() {
  const name = "Create Patterns";
  const symbol = "CPT";

  const token = await deployDiamond(
    'CreatePatterns',
    'CreatePatternsInit',
    '__CreatePatterns_init',
    [
      name, symbol
    ]
  );

  console.log('Contract has been successfully deployed at: ', token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
