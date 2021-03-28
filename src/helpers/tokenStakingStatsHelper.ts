import { TokenStakingStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import { copyValues, addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User, token: string): string {
    let id = type
        + ((timeStamp > 0) ? ('-' + timeStamp.toString()) : EMPTY_STRING)
        + ((user) ? ('-' + user.id) : EMPTY_STRING)
        + ((token) ? ('-' + token) : EMPTY_STRING)
        + 'TokenStakingStat'

    return crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, user: User, token: string): TokenStakingStat {
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

    return statsData as TokenStakingStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User, token: string): TokenStakingStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, from, token);
    let statsData = TokenStakingStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, from, token);
    return statsData as TokenStakingStat;
}

export function saveStats(from: User, token: string, eventTimeStamp: i32,
    lastEventType: string,
    keys: string[],
    values: BigInt[]
): void {
    log.debug("TokenStakingStat: Start saving statistic", []);

    let total = getStatById("T", 0, null, token);
    let totalPerUser = getStatById("T", 0, from, token);

    let accumulated = getStatById("A", eventTimeStamp, null, token);
    let accumulatedPerUser = getStatById("A", eventTimeStamp, from, token);

    let daily = getStatById("D", eventTimeStamp, null, token);
    let dailyPerUser = getStatById("D", eventTimeStamp, from, token);


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

    log.debug("TokenStakingStat: Done saving statistic", []);
};