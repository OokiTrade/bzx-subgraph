import { StakingStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import { copyValues, addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User): string {
    let id = type
        + ((timeStamp > 0) ? ('-' + timeStamp.toString()) : EMPTY_STRING)
        + ((user) ? ('-' + user.id) : EMPTY_STRING)
        + 'StakingStat'

    return crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, user: User): StakingStat {
    let id = getStatId(type, timeStamp, user);
    let statsData = new StakingStat(id)
    statsData.date = timeStamp

    if (user)
        statsData.user = user.id;

    statsData.type = type;
    statsData.addRewardsBzrxAmountVolume = ZERO_BD;
    statsData.addRewardsStableCoinAmountVolume = ZERO_BD;
    statsData.addRewardsTxCount = ZERO_BI;
    statsData.claimBzrxAmountVolume = ZERO_BD;
    statsData.claimStableCoinAmountVolume = ZERO_BD;
    statsData.claimTxCount = ZERO_BI;
    statsData.convertFeesBzrxOutputVolume = ZERO_BD;
    statsData.convertFeesStableCoinOutputVolume = ZERO_BD;
    statsData.convertFeesTxCount = ZERO_BI;
    statsData.distributeFeesBzrxRewardsVolume = ZERO_BD;
    statsData.distributeFeesStableCoinRewardsVolume = ZERO_BD;
    statsData.distributeFeesTxCount = ZERO_BI;

    return statsData as StakingStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User, token: string): StakingStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, from);
    let statsData = StakingStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, from);
    return statsData as StakingStat;
}

export function saveStats(user: User, eventTimeStamp: i32,
    lastEventType: string,
    keys: string[],
    values: BigInt[]
): void {
    log.debug("StakingStat: Start saving statistic", []);

    let total = getStatById("T", 0, null, null);
    let totalPerUser = getStatById("T", 0, user, null);

    let accumulated = getStatById("A", eventTimeStamp, null, null);
    let accumulatedPerUser = getStatById("A", eventTimeStamp, user, null);

    let daily = getStatById("D", eventTimeStamp, null, null);
    let dailyPerUser = getStatById("D", eventTimeStamp, user, null);


    total.lastEventTimeStamp = eventTimeStamp;
    total.lastEventType = lastEventType;
    totalPerUser.lastEventTimeStamp = eventTimeStamp;
    totalPerUser.lastEventType = lastEventType;
    accumulated.lastEventTimeStamp = eventTimeStamp;
    accumulated.lastEventType = lastEventType;
    accumulatedPerUser.lastEventTimeStamp = eventTimeStamp;
    accumulatedPerUser.lastEventType = lastEventType;
    daily.lastEventTimeStamp = eventTimeStamp;
    daily.lastEventType = lastEventType;
    dailyPerUser.lastEventTimeStamp = eventTimeStamp;
    dailyPerUser.lastEventType = lastEventType;

    addValues(total, keys, values);
    addValues(totalPerUser, keys, values);
    addValues(daily, keys, values);
    addValues(dailyPerUser, keys, values);


    total.save();
    totalPerUser.save();

    copyValues(total, accumulated, keys);
    copyValues(totalPerUser, accumulatedPerUser, keys);
    accumulated.save();
    accumulatedPerUser.save();

    daily.accumulated = accumulated.id;
    dailyPerUser.accumulated = accumulatedPerUser.id;
    daily.save();
    dailyPerUser.save();

    log.debug("StakingStat: Done saving statistic", []);
};