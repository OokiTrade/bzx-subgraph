import {
    DepositCollateral,
    WithdrawCollateral,
    ExtendLoanDuration,
    ReduceLoanDuration,
    ClaimReward
} from '../types/LoanMaintenanceEvents/LoanMaintenanceEvents'

import {
    ProtocolDepositCollateralEvent,
    ProtocolWithdrawCollateralEvent,
    ProtocolExtendLoanDurationEvent,
    ProtocolReduceLoanDurationEvent,
    ProtocolClaimRewardEvent
} from '../types/schema'

import { getEventId, saveTransaction, getLoanById, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/loanStatsHelper';


export function handleDepositCollateral(networkEvent: DepositCollateral): void {
    log.info("handleDepositCollateral: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ProtocolDepositCollateralEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    if(!networkEvent.params.loanId){
        log.warning("getLoanById: NULL id. Tx: {}", [networkEvent.transaction.hash.toHex()]);
        return;
    }
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.user = user.id;
    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.depositToken = networkEvent.params.depositToken.toHex();
    event.depositAmount = networkEvent.params.depositAmount;
    event.type = 'ProtocolDepositCollateralEvent'
    event.save();

    saveStats(user, loan.loanToken, loan.collateralToken, event.timestamp,
        event.type,
        ['depositCollateralDepositAmountVolume', 'depositCollateralTxCount'],
        [event.depositAmount, ONE_BI]
    );
    log.debug("handleDepositCollateral done", []);
}


export function handleWithdrawCollateral(networkEvent: WithdrawCollateral): void {
    log.info("handleWithdrawCollateral: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ProtocolWithdrawCollateralEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    if(!networkEvent.params.loanId){
        log.warning("getLoanById: NULL id. Tx: {}", [networkEvent.transaction.hash.toHex()]);
        return;
    }
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.user = user.id;
    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.withdrawToken = networkEvent.params.withdrawToken.toHex();
    event.withdrawAmount = networkEvent.params.withdrawAmount;
    event.type = 'ProtocolWithdrawCollateralEvent'
    event.save();

    saveStats(user, loan.loanToken, loan.collateralToken, event.timestamp,
        event.type,
        ['withdrawCollateralWithdrawAmountVolume', 'withdrawCollateralTxCount'],
        [event.withdrawAmount, ONE_BI]
    );

    log.debug("handleWithdrawCollateral done", []);
}

export function handleExtendLoanDuration(networkEvent: ExtendLoanDuration): void {
    log.info("handlextendLoanDuration: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ProtocolExtendLoanDurationEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );

    if(!networkEvent.params.loanId){
        log.warning("getLoanById: NULL id. Tx: {}", [networkEvent.transaction.hash.toHex()]);
        return;
    }
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.user = user.id;
    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.depositToken = networkEvent.params.depositToken.toHex();
    event.depositAmount = networkEvent.params.depositAmount;
    event.collateralUsedAmount = networkEvent.params.collateralUsedAmount;
    event.newEndTimestamp = networkEvent.params.newEndTimestamp.toI32();
    event.type = 'ProtocolExtendLoanDurationEvent'
    event.save();

    saveStats(user, loan.loanToken, loan.collateralToken, event.timestamp,
        event.type,
        ['extendLoanDurationDepositAmountVolume','extendLoanDurationCollateralUsedAmountVolume', 'extendLoanDurationTxCount'],
        [event.depositAmount, event.collateralUsedAmount, ONE_BI]
    );
    log.debug("handlextendLoanDuration done", []);
}

export function handleReduceLoanDuration(networkEvent: ReduceLoanDuration): void {
    log.info("handleReduceLoanDuration: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ProtocolReduceLoanDurationEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    if(!networkEvent.params.loanId){
        log.warning("getLoanById: NULL id. Tx: {}", [networkEvent.transaction.hash.toHex()]);
        return;
    }
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();


    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.loan = loan.id;
    event.user = user.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.withdrawToken = networkEvent.params.withdrawToken.toHex();
    event.withdrawAmount = networkEvent.params.withdrawAmount;
    event.newEndTimestamp = networkEvent.params.newEndTimestamp.toI32();
    event.type = 'ProtocolReduceLoanDurationEvent'
    event.save();

    saveStats(user, loan.loanToken, loan.collateralToken, event.timestamp,
        event.type,
        ['reduceLoanDurationWithdrawAmountVolume', 'reduceLoanDurationTxCount'],
        [event.withdrawAmount, ONE_BI]
    );
    log.debug("handleReduceLoanDuration done", []);
}



export function handleClaimReward(networkEvent: ClaimReward): void {
    log.info("handleClaimReward: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ProtocolClaimRewardEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.user = user.id;
    event.receiver = receiver.id;
    event.token = networkEvent.params.token.toHex();
    event.amount = networkEvent.params.amount;
    event.type = 'ProtocolClaimRewardEvent'
    event.save();
    
    log.debug("handleClaimReward done", []);
}