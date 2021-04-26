import { StakingStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import {  addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User): string {
    let id = ((user) ? ('-' + user.id) : EMPTY_STRING)
    
    return timeStamp.toString()+'#'+type+crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

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

    return statsData as StakingStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User): StakingStat {
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

    let total = getStatById("T", 0, null);
    let totalPerUser = getStatById("T", 0, user);

    let daily = getStatById("D", eventTimeStamp, null);
    let dailyPerUser = getStatById("D", eventTimeStamp, user);

    let accumulatedId = getStatId("A", daily.date, null);
    let accumulatedPerUserId = getStatId("A", dailyPerUser.date, user);


    total.lastEventTimeStamp = eventTimeStamp;
    total.lastEventType = lastEventType;
    totalPerUser.lastEventTimeStamp = eventTimeStamp;
    totalPerUser.lastEventType = lastEventType;
    
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

    total.id = accumulatedId;
    totalPerUser.id = accumulatedPerUserId;
    total.type = "A";
    totalPerUser.type = "A";
    total.date = daily.date;
    totalPerUser.date = daily.date;
    total.save();
    totalPerUser.save();

    daily.accumulated = accumulatedId;
    dailyPerUser.accumulated = accumulatedPerUserId;
    daily.save();
    dailyPerUser.save();

    log.debug("StakingStat: Done saving statistic", []);
};