import { FeesStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import {  addValues } from "./helper";

import { BigInt, ByteArray, crypto, log, Value } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, user: User|null, token: string): string {
    let id = ((user) ? ('-' + user.id) : "null")
        + ((token) ? ('-' + token) : "null")
    return timeStamp.toString()+'#'+type+crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, user: User|null, token: string): FeesStat {
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

    statsData.stakingDistributeFeesBzrxRewardsVolume = ZERO_BD
    statsData.stakingDistributeFeesBzrxRewardsTxCount = ZERO_BI
    statsData.stakingDistributeFeesStableCoinRewardsVolume = ZERO_BD
    statsData.stakingDistributeFeesStableCoinRewardsTxCount = ZERO_BI

    statsData.stakingWithdrawFeesTxCount = ZERO_BI
    statsData.stakingConvertFeesBzrxOutputVolume = ZERO_BD
    statsData.stakingConvertFeesBzrxOutputTxCount = ZERO_BI

    statsData.stakingConvertFeesStableCoinOutputVolume = ZERO_BD
    statsData.stakingConvertFeesStableCoinOutputTxCount = ZERO_BI

    return statsData as FeesStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User|null, token: string): FeesStat {
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

    let daily = getStatById("D", eventTimeStamp, null, token);
    let dailyPerUser = getStatById("D", eventTimeStamp, user, token);

    let accumulatedId = getStatId("A", daily.date, null, token);
    let accumulatedPerUserId = getStatId("A", dailyPerUser.date, user, token);

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
   
    log.debug("FeesStat: Done saving statistic", []);
};