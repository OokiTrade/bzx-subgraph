import {  LoanStat, User } from "../types/schema";
import { EMPTY_STRING, ZERO_BD, ZERO_BI } from "./constants";
import {  addValues } from "./helper";

import { BigInt, ByteArray, crypto, log } from "@graphprotocol/graph-ts";

function getStatId(type: string, timeStamp: i32, from: User|null, loanToken: string, collateralToken: string): string {
    let id = ((from) ? ('-' + from.id) : EMPTY_STRING)
        + ((loanToken) ? ('-' + loanToken) : EMPTY_STRING)
        + ((collateralToken) ? ('-' + collateralToken) : EMPTY_STRING)

    return timeStamp.toString()+'#'+type+crypto.keccak256(ByteArray.fromUTF8(id)).toHex();

}

function getNewStat(type: string, timeStamp: i32, from: User|null, loanToken: string, collateralToken: string): LoanStat {
    let id = getStatId(type, timeStamp, from, loanToken, collateralToken);
    let statsData = new LoanStat(id)
    if (from)
        statsData.user = from.id;
    
    statsData.date = timeStamp
    statsData.type = type;
    statsData.loanToken = loanToken;
    statsData.collateralToken = collateralToken;
    statsData.closeWithDepositRepayAmountUserVolume = ZERO_BD;
    statsData.closeWithDepositRepayAmountCloserVolume = ZERO_BD;
    statsData.closeWithDepositCloserTxCount = ZERO_BI;
    statsData.closeWithDepositUserTxCount = ZERO_BI;
    statsData.closeWithSwapPositionCloseSizeCloserVolume = ZERO_BD;
    statsData.closeWithSwapLoanCloseAmountCloserVolume = ZERO_BD;
    statsData.closeWithSwapPositionCloseSizeUserVolume = ZERO_BD;
    statsData.closeWithSwapLoanCloseAmountUserVolume = ZERO_BD;
    statsData.closeWithSwapUserTxCount = ZERO_BI;
    statsData.closeWithSwapCloserTxCount = ZERO_BI;

    statsData.liquidateRepayAmountLiquidatorVolume = ZERO_BD;
    statsData.liquidateRepayAmountUserVolume = ZERO_BD;
    statsData.liquidateLiquidatorTxCount = ZERO_BI;
    statsData.liquidateUserTxCount = ZERO_BI;

    statsData.rolloverCollateralAmountUsedCallerVolume = ZERO_BD;
    statsData.rolloverInterestAmountAddedCallerVolume = ZERO_BD;
    statsData.rolloverCollateralAmountUsedUserVolume = ZERO_BD;
    statsData.rolloverInterestAmountAddedUserVolume = ZERO_BD;
    statsData.rolloverCallerTxCount = ZERO_BI;
    statsData.rolloverUserTxCount = ZERO_BI;

    statsData.loanDepositVolume = ZERO_BD;
    statsData.loanDepositTxCount = ZERO_BI;
    statsData.borrowNewPrincipalVolume = ZERO_BD;
    statsData.borrowNewCollateral = ZERO_BD;
    statsData.borrowTxCount = ZERO_BI;
    statsData.tradePositionSizeVolume = ZERO_BD;
    statsData.tradeBorrowedAmountVolume = ZERO_BD;
    statsData.tradeTxCount = ZERO_BI;
    statsData.depositCollateralDepositAmountVolume = ZERO_BD;
    statsData.depositCollateralTxCount = ZERO_BI;
    statsData.withdrawCollateralWithdrawAmountVolume = ZERO_BD;
    statsData.withdrawCollateralTxCount = ZERO_BI;
    statsData.extendLoanDurationDepositAmountVolume = ZERO_BD;
    statsData.extendLoanDurationCollateralUsedAmountVolume = ZERO_BD;
    statsData.extendLoanDurationTxCount = ZERO_BI;
    statsData.reduceLoanDurationWithdrawAmountVolume = ZERO_BD;
    statsData.reduceLoanDurationTxCount = ZERO_BI;
    statsData.claimRewardAmountVolume = ZERO_BD;
    statsData.claimRewardTxCount = ZERO_BI;

    return statsData as LoanStat;
}
function getStatById(type: string, eventTimeStamp: i32, from: User|null, loanToken: string, collateralToken: string): LoanStat {
    let dayStartTimestamp = eventTimeStamp / 86400;

    let id = getStatId(type, dayStartTimestamp, from, loanToken, collateralToken);
    let statsData = LoanStat.load(id.toString()) || getNewStat(type, dayStartTimestamp, from, loanToken, collateralToken);
    return statsData as LoanStat;
}

export function saveStats(from: User, loanToken: string, collateralToken: string, eventTimeStamp: i32,
    lastEventType: string,
    keys: string[],
    values: BigInt[]
): void {
    log.debug("LoanStat: Start saving statistic", []);
    let total = getStatById("T", 0, null, loanToken, collateralToken);
    let totalPerUser = getStatById("T", 0, from, loanToken, collateralToken);

    let daily = getStatById("D", eventTimeStamp, null, loanToken, collateralToken);
    let dailyPerUser = getStatById("D", eventTimeStamp, from, loanToken, collateralToken);

    let accumulatedId = getStatId("A", daily.date, null, loanToken, collateralToken);
    let accumulatedPerUserId = getStatId("A", dailyPerUser.date, from, loanToken, collateralToken);

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
    totalPerUser.date = dailyPerUser.date;
    total.save();
    totalPerUser.save();

    daily.accumulated = accumulatedId;
    dailyPerUser.accumulated = accumulatedPerUserId;
    daily.save();
    dailyPerUser.save();

    log.debug("LoanStat: Done saving statistic", []);
};