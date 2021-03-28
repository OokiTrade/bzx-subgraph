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
    RolloverEvent
} from '../types/schema'

import { getEventId, saveTransaction, getLoanById, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/loanStatsHelper';


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

    saveStats(closer, loan.loanToken, loan.collateralToken, event.timestamp,
        'CloseWithDeposit',
        ['closeWithDepositRepayAmountCloserVolume', 'closeWithDepositCloserTxCount'],
        [event.repayAmount, ONE_BI]
    );

    saveStats(getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp,
        'CloseWithDeposit',
        ['closeWithDepositRepayAmountUserVolume', 'closeWithDepositUserTxCount'],
        [event.repayAmount, ONE_BI]
    );

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


    saveStats(closer, loan.loanToken, loan.collateralToken, event.timestamp,
        'CloseWithSwap',
        ['closeWithSwapPositionCloseSizeCloserVolume', 'closeWithSwapLoanCloseAmountCloserVolume', 'closeWithSwapCloserTxCount'],
        [event.positionCloseSize, event.loanCloseAmount, ONE_BI]
    );

    saveStats(getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp,
        'CloseWithSwap',
        ['closeWithSwapPositionCloseSizeUserVolume', 'closeWithSwapLoanCloseAmountUserVolume', 'closeWithSwapUserTxCount'],
        [event.positionCloseSize, event.loanCloseAmount, ONE_BI]
    );
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


    saveStats(liquidator, loan.loanToken, loan.collateralToken, event.timestamp,
        'Liquidate',
        ['liquidateRepayAmountLiquidatorVolume', 'liquidateLiquidatorTxCount'],
        [event.repayAmount, ONE_BI]
    );

    saveStats(getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp,
        'Liquidate',
        ['liquidateRepayAmountUserVolume', 'liquidateUserTxCount'],
        [event.repayAmount, ONE_BI]
    );

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

    saveStats(caller, loan.loanToken, loan.collateralToken, event.timestamp,
        'Rollover',
        ['closeWithSwapPositionCloseSizeCloserVolume', 'closeWithSwapLoanCloseAmountCloserVolume', 'closeWithSwapCloserTxCount'],
        [event.collateralAmountUsed, event.interestAmountAdded, ONE_BI]
    );

    saveStats(getUser(loan.user, timestamp), loan.loanToken, loan.collateralToken, event.timestamp,
        'Rollover',
        ['rolloverCollateralAmountUsedUserVolume', 'rolloverInterestAmountAddedUserVolume', 'rolloverUserTxCount'],
        [event.collateralAmountUsed, event.interestAmountAdded, ONE_BI]
    );

    log.debug("handleRollover done", []);
}