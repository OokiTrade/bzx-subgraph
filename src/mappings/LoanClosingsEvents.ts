import {
    CloseWithDeposit,
    CloseWithSwap,
    Liquidate,
    Rollover
} from '../types/LoanClosingsEvents/LoanClosingsEvents'

import {
    CloseWithDepositEvent,
    CloseWithSwapEvent,
    LiquidateEvent,
    RolloverEvent,
    LoanStat,
    UserStat
} from '../types/schema'

import { getEventId, ONE_BI, saveTransaction, saveLoanStats, getLoanById, getUser, EMPTY_LOANSTAT_FUNC } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";


export function handleCloseWithDeposit(networkEvent: CloseWithDeposit): void {
    log.info("handleCloseWithDeposit: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new CloseWithDepositEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.repayAmount = networkEvent.params.repayAmount;
    event.collateralWithdrawAmount = networkEvent.params.collateralWithdrawAmount;
    event.collateralToLoanRate = networkEvent.params.collateralToLoanRate;
    event.currentMargin = networkEvent.params.currentMargin;
    event.save();

    let closer = getUser(networkEvent.params.closer.toHex(), timestamp);
    loan.closer = closer.id;
    loan.save();

    let updateCloser = (data: LoanStat, values: BigInt[]): void => {
        data.closeWithDepositRepayAmountCloserVolume = data.closeWithDepositRepayAmountCloserVolume.plus(new BigDecimal(values[0]));
        data.closeWithDepositCloserTxCount = data.closeWithDepositCloserTxCount.plus(ONE_BI);
        data.lastEventType = 'CloseWithDeposit';
    };
    let updateUser = (data: LoanStat, values: BigInt[]): void => {
        data.closeWithDepositRepayAmountUserVolume = data.closeWithDepositRepayAmountUserVolume.plus(new BigDecimal(values[0]));
        data.closeWithDepositUserTxCount = data.closeWithDepositUserTxCount.plus(ONE_BI);
        data.lastEventType = 'CloseWithDeposit';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.repayAmount], updateCloser, updateUser);
    saveLoanStats('D', closer, loan.loanToken, loan.collateralToken, event.timestamp, [event.repayAmount], updateCloser, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp, [event.repayAmount], updateUser, EMPTY_LOANSTAT_FUNC);

    log.debug("handleCloseWithDeposit done", []);
}

export function handleCloseWithSwap(networkEvent: CloseWithSwap): void {
    log.info("handleCloseWithSwap: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new CloseWithSwapEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    event.loan = networkEvent.params.loanId.toHex();
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.positionCloseSize = networkEvent.params.positionCloseSize;
    event.loanCloseAmount = networkEvent.params.loanCloseAmount;
    event.exitPrice = networkEvent.params.exitPrice;
    event.currentLeverage = networkEvent.params.currentLeverage;
    event.save();

    let closer = getUser(networkEvent.params.closer.toHex(), timestamp);
    loan.closer = closer.id;
    loan.save();

    let updateCloser = (data: LoanStat, values: BigInt[]): void => {
        data.closeWithSwapPositionCloseSizeCloserVolume = data.closeWithSwapPositionCloseSizeCloserVolume.plus(new BigDecimal(values[0]));
        data.closeWithSwapLoanCloseAmountCloserVolume = data.closeWithSwapLoanCloseAmountCloserVolume.plus(new BigDecimal(values[1]));
        data.closeWithSwapCloserTxCount = data.closeWithSwapCloserTxCount.plus(ONE_BI);
        data.lastEventType = 'CloseWithSwap';
    };

    let updateUser = (data: LoanStat, values: BigInt[]): void => {
        data.closeWithSwapPositionCloseSizeUserVolume = data.closeWithSwapPositionCloseSizeUserVolume.plus(new BigDecimal(values[0]));
        data.closeWithSwapLoanCloseAmountUserVolume = data.closeWithSwapLoanCloseAmountUserVolume.plus(new BigDecimal(values[1]));
        data.closeWithSwapUserTxCount = data.closeWithSwapUserTxCount.plus(ONE_BI);
        data.lastEventType = 'CloseWithSwap';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.positionCloseSize, event.loanCloseAmount], updateCloser, updateUser);
    saveLoanStats('D', closer, loan.loanToken, loan.collateralToken, event.timestamp, [event.positionCloseSize, event.loanCloseAmount], updateCloser, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp, [event.positionCloseSize, event.loanCloseAmount], updateUser, EMPTY_LOANSTAT_FUNC);

    log.debug("handleCloseWithSwap done", []);
}

export function handleLiquidate(networkEvent: Liquidate): void {
    log.info("handleLiquidate: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new LiquidateEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    event.loan = networkEvent.params.loanId.toHex();
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.repayAmount = networkEvent.params.repayAmount;
    event.collateralWithdrawAmount = networkEvent.params.collateralWithdrawAmount;
    event.collateralToLoanRate = networkEvent.params.collateralToLoanRate;
    event.currentMargin = networkEvent.params.currentMargin;
    event.save();

    let liquidator = getUser(networkEvent.params.liquidator.toHex(), timestamp);
    loan.liquidator = liquidator.id;
    loan.save();

    let updateLiquidator = (data: LoanStat, values: BigInt[]): void => {
        data.liquidateRepayAmountLiquidatorVolume = data.liquidateRepayAmountLiquidatorVolume.plus(new BigDecimal(values[0]));
        data.liquidateLiquidatorTxCount = data.liquidateLiquidatorTxCount.plus(ONE_BI);
        data.lastEventType = 'Liquidate';
    };

    let updateUser = (data: LoanStat, values: BigInt[]): void => {
        data.liquidateRepayAmountUserVolume = data.liquidateRepayAmountUserVolume.plus(new BigDecimal(values[0]));
        data.liquidateUserTxCount = data.liquidateUserTxCount.plus(ONE_BI);
        data.lastEventType = 'Liquidate';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.repayAmount], updateLiquidator, updateUser);
    saveLoanStats('D', liquidator, loan.loanToken, loan.collateralToken, event.timestamp, [event.repayAmount], updateLiquidator, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp, [event.repayAmount], updateUser, EMPTY_LOANSTAT_FUNC);


    log.debug("handleLiquidate done", []);
}

export function handleRollover(networkEvent: Rollover): void {
    log.info("handleRollover: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new RolloverEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );

    let loan = getLoanById(networkEvent.params.loanId.toHex());
    if (!loan) {
        log.warning("Related loan {} missing. skip event", [networkEvent.params.loanId.toHex()]);
        return;
    }

    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    event.loan = networkEvent.params.loanId.toHex();
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.collateralAmountUsed = networkEvent.params.collateralAmountUsed;
    event.interestAmountAdded = networkEvent.params.interestAmountAdded;
    event.loanEndTimestamp = networkEvent.params.loanEndTimestamp.toI32();
    event.gasRebate = networkEvent.params.gasRebate;
    event.save();

    let caller = getUser(networkEvent.params.caller.toHex(), timestamp);
    loan.caller = caller.id;
    loan.save();

    let updateCaller = (data: LoanStat, values: BigInt[]): void => {
        data.rolloverCollateralAmountUsedCallerVolume = data.rolloverCollateralAmountUsedCallerVolume.plus(new BigDecimal(values[0]));
        data.rolloverInterestAmountAddedCallerVolume = data.rolloverInterestAmountAddedCallerVolume.plus(new BigDecimal(values[1]));
        data.rolloverCallerTxCount = data.rolloverCallerTxCount.plus(ONE_BI);
        data.lastEventType = 'Rollover';
    };

    let updateUser = (data: LoanStat, values: BigInt[]): void => {
        data.rolloverCollateralAmountUsedUserVolume = data.rolloverCollateralAmountUsedUserVolume.plus(new BigDecimal(values[0]));
        data.rolloverInterestAmountAddedUserVolume = data.rolloverInterestAmountAddedUserVolume.plus(new BigDecimal(values[1]));
        data.rolloverUserTxCount = data.rolloverUserTxCount.plus(ONE_BI);
        data.lastEventType = 'Rollover';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.collateralAmountUsed, event.interestAmountAdded], updateCaller, updateUser);
    saveLoanStats('D', caller, loan.loanToken, loan.collateralToken, event.timestamp, [event.collateralAmountUsed, event.interestAmountAdded], updateCaller, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp, [event.collateralAmountUsed, event.interestAmountAdded], updateUser, EMPTY_LOANSTAT_FUNC);

    log.debug("handleRollover done", []);
}