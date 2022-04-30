import { TokenStakingStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import {  addValues } from "./helper";

import { Address, BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User|null, token: string): string {
    let id = ((user) ? ('-' + user.id) : EMPTY_STRING)
        + ((token) ? ('-' + token) : EMPTY_STRING)

    return timeStamp.toString()+'#'+type+crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, user: User|null, token: string): TokenStakingStat {
    let id = getStatId(type, timeStamp, user, token);
    let statsData = new TokenStakingStat(id)
    statsData.type = type;
    if (user)
        statsData.user = user.id;
    statsData.date = timeStamp
    statsData.token = token;
    statsData.stakeAmountVolume = ZERO_BD;
    statsData.stakeTxCount = ZERO_BI;
    statsData.unstakeAmountVolume = ZERO_BD;
    statsData.unstakeTxCount = ZERO_BI;
    statsData.votingPower = ZERO_BI;

    return statsData as TokenStakingStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User|null, token: string): TokenStakingStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, from, token);
    let statsData = TokenStakingStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, from, token);
    return statsData as TokenStakingStat;
}

export function saveStats(from: User, token: string, eventTimeStamp: i32,
    lastEventType: string,
    votingBalance: BigInt,
    keys: string[],
    values: BigInt[]
): void {
    log.debug("TokenStakingStat: Start saving statistic", []);

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
    totalPerUser.votingPower = votingBalance;
    daily.lastEventTimeStamp = eventTimeStamp;
    daily.lastEventType = lastEventType;
    dailyPerUser.lastEventTimeStamp = eventTimeStamp;
    dailyPerUser.lastEventType = lastEventType;
    dailyPerUser.votingPower = votingBalance;

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

    log.debug("TokenStakingStat: Done saving statistic", []);
};