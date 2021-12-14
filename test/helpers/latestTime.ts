import { ethers } from "hardhat";

// Returns the time of the last mined block in seconds
async function latestTime(): Promise<number> {
    const block = await ethers.provider.getBlock('latest')
    return block.timestamp;
}

export {
    latestTime
}