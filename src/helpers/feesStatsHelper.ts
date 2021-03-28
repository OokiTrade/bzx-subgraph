import { FeesStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import { copyValues, addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User, token: string): string {
    let id = type
        + ((timeStamp > 0) ? ('-' + timeStamp.toString()) : EMPTY_STRING)
        + ((user) ? ('-' + user.id) : EMPTY_STRING)
        + ((token) ? ('-' + token) : EMPTY_STRING)
        + 'FeesStat'

    return crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, user: User, token: string): FeesStat {
    let id = getStatId(type, timeStamp, user, token);
    let statsData = new FeesStat(id)
    statsData.date = timeStamp
    statsData.token = token;

    if (user)
        statsData.user = user.id;

    statsData.type = type;
    statsData.payLendingFeeVolume = ZERO_BD
    statsData.payLendingFeeTxCount = ZERO_BI
    statsData.settleFeeRewardForInterestExpenseVolume = ZERO_BD
    statsData.settleFeeRewardForInterestExpenseTxCount = ZERO_BI
    statsData.payTradingFeeVolume = ZERO_BD
    statsData.payTradingFeeTxCount = ZERO_BI
    statsData.payBorrowingFeeVolume = ZERO_BD
    statsData.payBorrowingFeeTxCount = ZERO_BI
    statsData.earnRewardVolume = ZERO_BD
    statsData.earnRewardTxCount = ZERO_BI

    statsData.withdrawLendingFeesSenderVolume = ZERO_BD
    statsData.withdrawLendingFeesSenderTxCount = ZERO_BI
    statsData.withdrawLendingFeesReceiverVolume = ZERO_BD
    statsData.withdrawLendingFeesReceiverTxCount = ZERO_BI
    statsData.withdrawTradingFeesSenderVolume = ZERO_BD
    statsData.withdrawTradingFeesSenderTxCount = ZERO_BI
    statsData.withdrawTradingFeesReceiverVolume = ZERO_BD
    statsData.withdrawTradingFeesReceiverTxCount = ZERO_BI
    statsData.withdrawBorrowingFeesSenderVolume = ZERO_BD
    statsData.withdrawBorrowingFeesSenderTxCount = ZERO_BI
    statsData.withdrawBorrowingFeesReceiverVolume = ZERO_BD
    statsData.withdrawBorrowingFeesReceiverTxCount = ZERO_BI

    return statsData as FeesStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User, token: string): FeesStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, from, token);
    let statsData = FeesStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, from, token);
    return statsData as FeesStat;
}

export function saveStats(user: User, token: string, eventTimeStamp: i32,
    lastEventType: string,
    keys: string[],
    values: BigInt[]
): void {
    log.debug("FeesStat: Start saving statistic", []);
    let total = getStatById("T", 0, null, token);
    let totalPerUser = getStatById("T", 0, user, token);

    let accumulated = getStatById("A", eventTimeStamp, null, token);
    let accumulatedPerUser = getStatById("A", eventTimeStamp, user, token);

    let daily = getStatById("D", eventTimeStamp, null, token);
    let dailyPerUser = getStatById("D", eventTimeStamp, user, token);


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

    log.debug("FeesStat: Done saving statistic", []);
};