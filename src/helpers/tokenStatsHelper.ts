import { TokenStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import {  addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User, token: string): string {
    let id = ((user) ? ('-' + user.id) : EMPTY_STRING)
        + ((token) ? ('-' + token) : EMPTY_STRING)

    return timeStamp.toString()+'#'+type+crypto.keccak256(ByteArray.fromUTF8(id)).toHex();
}

function getNewStat(type: string, timeStamp: i32, user: User, token: string): TokenStat {
    let id = getStatId(type, timeStamp, user, token);
    let statsData = new TokenStat(id)
    statsData.type = type;
    if (user)
        statsData.user = user.id;

    statsData.date = timeStamp
    statsData.token = token;
    statsData.type = type;
    statsData.transferFromVolume = ZERO_BD
    statsData.transferToVolume = ZERO_BD
    statsData.approvalOwnerVolume = ZERO_BD
    statsData.approvalSpenderVolume = ZERO_BD
    statsData.mintTokenVolume = ZERO_BD
    statsData.mintAssetVolume = ZERO_BD
    statsData.burnAssetVolume = ZERO_BD
    statsData.burnTokenVolume = ZERO_BD
    statsData.flashBorrowVolume = ZERO_BD
    statsData.transferFromTxCount = ZERO_BI
    statsData.transferToTxCount = ZERO_BI
    statsData.approvalOwnerTxCount = ZERO_BI
    statsData.approvalSpenderTxCount = ZERO_BI
    statsData.mintTxCount = ZERO_BI
    statsData.burnTxCount = ZERO_BI
    statsData.flashBorrowTxCount = ZERO_BI


    return statsData as TokenStat;
}
function getStatById(type: string, eventTimeStamp: i32, user: User, token: string): TokenStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, user, token);
    let statsData = TokenStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, user, token);
    return statsData as TokenStat;
}

export function saveStats(from: User, token: string, eventTimeStamp: i32,
    lastEventType: string,
    keys: string[],
    values: BigInt[]
): void {
    log.debug("TokenStat: Start saving statistic", []);

    let total = getStatById("T", 0, null, token);
    let totalPerUser = getStatById("T", 0, from, token);

    let daily = getStatById("D", eventTimeStamp, null, token);
    let dailyPerUser = getStatById("D", eventTimeStamp, from, token);

    let accumulatedId = getStatId("A", daily.date, null, token);
    let accumulatedPerUserId = getStatId("A", dailyPerUser.date, from, token);


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

    log.debug("TokenStat: Done saving statistic", []);
};