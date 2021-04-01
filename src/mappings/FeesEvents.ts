import {
    PayLendingFee,
    SettleFeeRewardForInterestExpense,
    PayTradingFee,
    PayBorrowingFee,
    EarnReward
} from '../types/FeesEvents/FeesEvents'

import {
    ProtocolPayLendingFeeEvent,
    ProtocolSettleFeeRewardForInterestExpenseEvent,
    ProtocolPayTradingFeeEvent,
    ProtocolPayBorrowingFeeEvent,
    ProtocolEarnRewardEvent

} from '../types/schema'

import { getEventId, saveTransaction, getLoanById, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { saveStats } from '../helpers/feesStatsHelper';
import { ONE_BI } from '../helpers/constants';

const FeesTypes = [
    'Lending',
    'Trading',
    'Borrowing',
    'SettleInterest'
] as string[];

export function handlePayLendingFee(networkEvent: PayLendingFee): void {
    log.info("handlePayLendingFee: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let event = new ProtocolPayLendingFeeEvent(
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

    saveStats(payer, event.token, event.timestamp,  
        'PayLendingFee', 
        ['payLendingFeeVolume', 'payLendingFeeTxCount'],
        [event.amount, ONE_BI]
    );
    log.debug("handlePayLendingFee done", []);
}

export function handleSettleFeeRewardForInterestExpense(networkEvent: SettleFeeRewardForInterestExpense): void {
   
    log.info("handleSettleFeeRewardForInterestExpense: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new ProtocolSettleFeeRewardForInterestExpenseEvent(
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

    saveStats(payer, event.token, event.timestamp,  
        'SettleFeeRewardForInterestExpense', 
        ['settleFeeRewardForInterestExpenseVolume', 'settleFeeRewardForInterestExpenseTxCount'],
        [event.amount, ONE_BI]
    );

    log.debug("handleSettleFeeRewardForInterestExpense done", []);
}

export function handlePayTradingFee(networkEvent: PayTradingFee): void {
    log.info("handlePayTradingFee: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new ProtocolPayTradingFeeEvent(
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

    saveStats(payer, event.token, event.timestamp,  
        'PayTradingFee', 
        ['SettleFeeRewardForInterestExpense', 'payTradingFeeTxCount'],
        [event.amount, ONE_BI]
    );
    
    log.debug("handlePayTradingFee done", []);
}
export function handlePayBorrowingFee(networkEvent: PayBorrowingFee): void {
    log.info("handlePayBorrowingFee: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new ProtocolPayBorrowingFeeEvent(
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
    saveStats(payer, event.token, event.timestamp,  
        'PayBorrowingFee', 
        ['payBorrowingFeeVolume', 'payBorrowingFeeTxCount'],
        [event.amount, ONE_BI]
    );
    log.debug("handlePayBorrowingFee done", []);
}

export function handlEarnReward(networkEvent: EarnReward): void {
    log.info("handlEarnReward: Start processing event: {}", [networkEvent.logIndex.toString()]);

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let event = new ProtocolEarnRewardEvent(
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
    saveStats(receiver, event.token, event.timestamp,  
        'EarnReward', 
        ['earnRewardVolume', 'earnRewardTxCount'],
        [event.amount, ONE_BI]
    );
    log.debug("handlEarnReward done", []);
}
