import {
    PayLendingFee,
    SettleFeeRewardForInterestExpense,
    PayTradingFee,
    PayBorrowingFee,
    EarnReward
} from '../types/FeesEvents/FeesEvents'

import {
    PayLendingFeeEvent,
    SettleFeeRewardForInterestExpenseEvent,
    PayTradingFeeEvent,
    PayBorrowingFeeEvent,
    EarnRewardEvent,
    FeesStat,

} from '../types/schema'

import { getEventId, ONE_BI, saveTransaction, saveFeesStats, getLoanById, getUser, EMPTY_FEESSTAT_FUNC } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";

const FeesTypes = [
    'Lending',
    'Trading',
    'Borrowing',
    'SettleInterest'
] as string[];

export function handlePayLendingFee(networkEvent: PayLendingFee): void {
    log.info("handlePayLendingFee: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let event = new PayLendingFeeEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let payer = getUser(networkEvent.params.payer.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.payer = payer.id;
    event.amount = networkEvent.params.amount;
    event.save();

    let update = (data: FeesStat, values: BigInt[]): void => {
        data.payTradingFeeVolume = data.payTradingFeeVolume.plus(new BigDecimal(values[0]));
        data.payLendingFeeTxCount = data.payLendingFeeTxCount.plus(ONE_BI);
        data.lastEventType = 'PayLendingFee';
    };

    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', payer, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    log.debug("handlePayLendingFee done", []);
}

export function handleSettleFeeRewardForInterestExpense(networkEvent: SettleFeeRewardForInterestExpense): void {
    log.info("handleSettleFeeRewardForInterestExpense: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new SettleFeeRewardForInterestExpenseEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let payer = getUser(networkEvent.params.payer.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.payer = payer.id;
    event.loan = loan.id;
    event.amount = networkEvent.params.amount;
    event.save();

    let update = (data: FeesStat, values: BigInt[]): void => {
        data.settleFeeRewardForInterestExpenseVolume = data.settleFeeRewardForInterestExpenseVolume.plus(new BigDecimal(values[0]));
        data.settleFeeRewardForInterestExpenseTxCount = data.settleFeeRewardForInterestExpenseTxCount.plus(ONE_BI);
        data.lastEventType = 'SettleFeeRewardForInterestExpense';
    };

    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', payer, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    log.debug("handleSettleFeeRewardForInterestExpense done", []);
}

export function handlePayTradingFee(networkEvent: PayTradingFee): void {
    log.info("handlePayTradingFee: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new PayTradingFeeEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let payer = getUser(networkEvent.params.payer.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.payer = payer.id;
    event.loan = loan.id;
    event.amount = networkEvent.params.amount;
    event.save();

    let update = (data: FeesStat, values: BigInt[]): void => {
        data.payTradingFeeVolume = data.payTradingFeeVolume.plus(new BigDecimal(values[0]));
        data.payTradingFeeTxCount = data.payTradingFeeTxCount.plus(ONE_BI);
        data.lastEventType = 'PayTradingFee';
    };

    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', payer, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    log.debug("handlePayTradingFee done", []);
}
export function handlePayBorrowingFee(networkEvent: PayBorrowingFee): void {
    log.info("handlePayBorrowingFee: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new PayBorrowingFeeEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let payer = getUser(networkEvent.params.payer.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.payer = payer.id;
    event.loan = loan.id;
    event.amount = networkEvent.params.amount;
    event.save();

    let update = (data: FeesStat, values: BigInt[]): void => {
        data.payBorrowingFeeVolume = data.payBorrowingFeeVolume.plus(new BigDecimal(values[0]));
        data.payBorrowingFeeTxCount = data.payBorrowingFeeTxCount.plus(ONE_BI);
        data.lastEventType = 'PayBorrowingFee';
    };

    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', payer, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    log.debug("handlePayBorrowingFee done", []);
}

export function handlEarnReward(networkEvent: EarnReward): void {
    log.info("handlEarnReward: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new EarnRewardEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.receiver = receiver.id;
    event.loan = loan.id;
    event.amount = networkEvent.params.amount;
    event.feeType = networkEvent.params.feeType;

    event.save();

    let update = (data: FeesStat, values: BigInt[]): void => {
        data.earnRewardVolume = data.earnRewardVolume.plus(new BigDecimal(values[0]));
        data.earnRewardTxCount = data.earnRewardTxCount.plus(ONE_BI);
        data.lastEventType = 'EarnReward';
    };

    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', receiver, event.token, event.timestamp, [event.amount], update, EMPTY_FEESSTAT_FUNC);
    log.debug("handlEarnReward done", []);
}
