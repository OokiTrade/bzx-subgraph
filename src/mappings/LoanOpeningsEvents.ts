import {
    Borrow,
    Trade
} from '../types/LoanOpeningsEvents/LoanOpeningsEvents'

import {
    BorrowEvent,
    TradeEvent
} from '../types/schema'

import { getEventId, saveTransaction, saveLoan, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/loanStatsHelper';


export function handleBorrow(networkEvent: Borrow): void {
    log.info("handleBorrow: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new BorrowEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    let lender = getUser(networkEvent.params.lender.toHex(), timestamp);
    let loan = saveLoan(networkEvent.params.loanId.toHex(),
        networkEvent.params.loanToken.toHex(),
        networkEvent.params.collateralToken.toHex(),
        user, lender
    );

    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.newPrincipal = networkEvent.params.newPrincipal;
    event.newCollateral = networkEvent.params.newCollateral;
    event.interestRate = networkEvent.params.interestRate;
    event.interestDuration = networkEvent.params.interestDuration;
    event.collateralToLoanRate = networkEvent.params.collateralToLoanRate;
    event.currentMargin = networkEvent.params.currentMargin;
    event.save();

    saveStats(user, loan.loanToken, loan.collateralToken, event.timestamp,
        'Borrow',
        ['borrowNewPrincipalVolume', 'newCollateral', 'borrowTxCount'],
        [event.newPrincipal, event.newCollateral, ONE_BI]
    );
    log.debug("handleBorrow done", []);
}

export function handleTrade(networkEvent: Trade): void {
    log.info("handleTrade: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new TradeEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    let lender = getUser(networkEvent.params.lender.toHex(), timestamp);
    let loan = saveLoan(networkEvent.params.loanId.toHex(),
        networkEvent.params.loanToken.toHex(),
        networkEvent.params.collateralToken.toHex(),
        user, lender
    );
    event.loan = loan.id;
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.positionSize = networkEvent.params.positionSize;
    event.borrowedAmount = networkEvent.params.borrowedAmount;
    event.interestRate = networkEvent.params.interestRate;
    event.settlementDate = networkEvent.params.settlementDate.toI32();
    event.entryPrice = networkEvent.params.entryPrice;
    event.entryLeverage = networkEvent.params.entryLeverage;
    event.currentLeverage = networkEvent.params.currentLeverage;
    event.save();

    saveStats(user, loan.loanToken, loan.collateralToken, event.timestamp,
        'Trade',
        ['tradeBorrowedAmountVolume', 'tradePositionSizeVolume', 'tradeTxCount'],
        [event.borrowedAmount, event.positionSize, ONE_BI]
    );
    log.debug("handleTrade done", []);
}