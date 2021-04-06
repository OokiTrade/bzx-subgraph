import { FarmingStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import { addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User, token: string, pid: i32): string {
    let id = ((user) ? ('-' + user.id) : EMPTY_STRING)
        + ((token) ? ('-' + token) : EMPTY_STRING)
        + pid.toString()

    return timeStamp.toString()+'#'+type+crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, user: User, token: string, pid: i32): FarmingStat {
    let id = getStatId(type, timeStamp, user, token, pid);
    let statsData = new FarmingStat(id)
    statsData.type = type;
    if (user)
        statsData.user = user.id;

    statsData.date = timeStamp
    statsData.token = token;
    statsData.type = type;
    statsData.pid = pid;

    statsData.withdrawAmountVolume = ZERO_BD
    statsData.withdrawTxCount = ZERO_BI
    statsData.claimAmountVolume = ZERO_BD
    statsData.claimTxCount = ZERO_BI
    statsData.emergencyWithdrawAmountVolume = ZERO_BD
    statsData.emergencyWithdrawTxCount = ZERO_BI

    return statsData as FarmingStat;
}
function getStatById(type: string, eventTimeStamp: i32, user: User, token: string, pid: i32): FarmingStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, user, token, pid);
    let statsData = FarmingStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, user, token, pid);
    return statsData as FarmingStat;
}

export function saveStats(from: User, token: string, pid:i32, eventTimeStamp: i32,
    lastEventType: string,
    keys: string[],
    values: BigInt[],
): void {
    log.debug("FarmingStat: Start saving statistic", []);

    let total = getStatById("T", 0, null, token, pid);
    let totalPerUser = getStatById("T", 0, from, token, pid);

    
    let daily = getStatById("D", eventTimeStamp, null, token, pid);
    let dailyPerUser = getStatById("D", eventTimeStamp, from, token, pid);
    let accumulatedId = getStatId("A", daily.date, null, token, pid);
    let accumulatedPerUserId = getStatId("A", dailyPerUser.date, from, token, pid);


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
    total.save();
    totalPerUser.save();

    daily.accumulated = accumulatedId;
    dailyPerUser.accumulated = accumulatedPerUserId;
    daily.save();
    dailyPerUser.save();

    log.debug("FarmingStat: Done saving statistic", []);
};