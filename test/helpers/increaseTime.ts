import { ethers } from "hardhat";
import { latestTime } from './latestTime';

function increaseTime(duration: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
        await ethers.provider.send("evm_increaseTime", [duration]);
        await ethers.provider.send("evm_mine", []);
        resolve();
    });
}

/**
 * Beware that due to the need of calling two separate ganache methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param target time in seconds
 */
async function increaseTimeTo(target: number): Promise<void> {
    let now = await latestTime();
    if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
    let diff = target - now;
    return increaseTime(diff);
}

const duration = {
    seconds: function (val: number) { return val; },
    minutes: function (val: number) { return val * this.seconds(60); },
    hours: function (val: number) { return val * this.minutes(60); },
    days: function (val: number) { return val * this.hours(24); },
    weeks: function (val: number) { return val * this.days(7); },
    years: function (val: number) { return val * this.days(365); },
};

export {
    increaseTime,
    increaseTimeTo,
    duration
}