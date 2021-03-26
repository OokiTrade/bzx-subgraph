import { 
    DepositCollateral,
    WithdrawCollateral,
    ExtendLoanDuration,
    ReduceLoanDuration,
    ClaimReward
} from '../types/LoanMaintenanceEvents/LoanMaintenanceEvents'

import { 
    DepositCollateralEvent,
    WithdrawCollateralEvent,
    ExtendLoanDurationEvent,
    ReduceLoanDurationEvent,
    ClaimRewardEvent,
    LoanStat
 } from '../types/schema'

import { getEventId, ONE_BI, saveTransaction, saveLoanStats, getLoanById, getUser, EMPTY_LOANSTAT_FUNC } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";


export function handleDepositCollateral(networkEvent: DepositCollateral): void {
    log.info("handleDepositCollateral: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new DepositCollateralEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if(!loan) {
        log.warning("Related loan {} missing. skip event",[networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(loan.user, timestamp);
    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.depositToken = networkEvent.params.depositToken.toHex();
    event.depositAmount = networkEvent.params.depositAmount;
    event.save();    
    
    let update = (data: LoanStat, values: BigInt[]): void =>{
      data.depositCollateralDepositAmountVolume = data.depositCollateralDepositAmountVolume.plus(new BigDecimal(values[0]));
      data.depositCollateralTxCount = data.depositCollateralTxCount.plus(ONE_BI);  
      data.lastEventType = 'DepositCollateral';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.depositAmount], update, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', user, loan.loanToken, loan.collateralToken, event.timestamp, [event.depositAmount], update, EMPTY_LOANSTAT_FUNC);
    log.debug("handleDepositCollateral done", []);
}


export function handleWithdrawCollateral(networkEvent: WithdrawCollateral): void {
    log.info("handleWithdrawCollateral: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new WithdrawCollateralEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if(!loan) {
        log.warning("Related loan {} missing. skip event",[networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(loan.user, timestamp);
    event.loan= loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.withdrawToken = networkEvent.params.withdrawToken.toHex();
    event.withdrawAmount = networkEvent.params.withdrawAmount;
    event.save();    
    
    let update = (data: LoanStat, values: BigInt[]): void =>{
      data.withdrawCollateralWithdrawAmountVolume = data.withdrawCollateralWithdrawAmountVolume.plus(new BigDecimal(values[0]));
      data.withdrawCollateralTxCount = data.withdrawCollateralTxCount.plus(ONE_BI);  
      data.lastEventType = 'WithdrawCollateral';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.withdrawAmount], update, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', user, loan.loanToken, loan.collateralToken, event.timestamp, [event.withdrawAmount], update, EMPTY_LOANSTAT_FUNC);
    log.debug("handleWithdrawCollateral done", []);
}

export function handleExtendLoanDuration(networkEvent: ExtendLoanDuration): void {
    log.info("handlextendLoanDuration: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ExtendLoanDurationEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if(!loan) {
        log.warning("Related loan {} missing. skip event",[networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(loan.user, timestamp);
    event.loan= loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.depositToken = networkEvent.params.depositToken.toHex();
    event.depositAmount = networkEvent.params.depositAmount;
    event.collateralUsedAmount = networkEvent.params.collateralUsedAmount;
    event.newEndTimestamp = networkEvent.params.newEndTimestamp.toI32();
    event.save();    
    
    let update = (data: LoanStat, values: BigInt[]): void =>{
      data.extendLoanDurationDepositAmountVolume = data.extendLoanDurationDepositAmountVolume.plus(new BigDecimal(values[0]));
      data.extendLoanDurationCollateralUsedAmountVolume = data.extendLoanDurationCollateralUsedAmountVolume.plus(new BigDecimal(values[1]));
      data.extendLoanDurationTxCount = data.extendLoanDurationTxCount.plus(ONE_BI);  
      data.lastEventType = 'ExtendLoanDuration';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.depositAmount, event.collateralUsedAmount], update, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', user, loan.loanToken, loan.collateralToken, event.timestamp, [event.depositAmount, event.collateralUsedAmount], update, EMPTY_LOANSTAT_FUNC);
    log.debug("handlextendLoanDuration done", []);
}

export function handleReduceLoanDuration(networkEvent: ReduceLoanDuration): void {
    log.info("handleReduceLoanDuration: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ReduceLoanDurationEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if(!loan) {
        log.warning("Related loan {} missing. skip event",[networkEvent.params.loanId.toHex()]);
        return;
    }
    
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(loan.user, timestamp);
    event.loan= loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.withdrawToken = networkEvent.params.withdrawToken.toHex();
    event.withdrawAmount = networkEvent.params.withdrawAmount;
    event.newEndTimestamp = networkEvent.params.newEndTimestamp.toI32();
    event.save();    
    
    let update = (data: LoanStat, values: BigInt[]): void =>{
      data.reduceLoanDurationWithdrawAmountVolume = data.reduceLoanDurationWithdrawAmountVolume.plus(new BigDecimal(values[0]));
      data.reduceLoanDurationTxCount = data.reduceLoanDurationTxCount.plus(ONE_BI);  
      data.lastEventType = 'ExtendLoanDuration';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.withdrawAmount], update, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', user, loan.loanToken, loan.collateralToken, event.timestamp, [event.withdrawAmount], update, EMPTY_LOANSTAT_FUNC);
    log.debug("handleReduceLoanDuration done", []);
}



export function handleClaimReward(networkEvent: ClaimReward): void {
    log.info("handleClaimReward: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ClaimRewardEvent(
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
    event.save();
    log.debug("handleClaimReward done", []);
}