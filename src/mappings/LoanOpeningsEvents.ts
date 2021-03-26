import { 
    Borrow,
    Trade
} from '../types/LoanOpeningsEvents/LoanOpeningsEvents'

import { 
    BorrowEvent,
    TradeEvent,
    LoanStat
 } from '../types/schema'

import { getEventId, ONE_BI, saveTransaction, saveLoanStats,  saveLoan, getUser, EMPTY_LOANSTAT_FUNC } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";


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
        user,lender
    );

    event.loan= loan.id;
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
    
    let update = (data: LoanStat, values: BigInt[]): void =>{
      data.borrowNewPrincipalVolume = data.borrowNewPrincipalVolume.plus(new BigDecimal(values[0]));
      data.newCollateral = data.newCollateral.plus(new BigDecimal(values[1]));
      data.borrowTxCount = data.borrowTxCount.plus(ONE_BI);  
      data.lastEventType = 'Borrow';
    };

    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.newPrincipal, event.newCollateral], update, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', user, loan.loanToken, loan.collateralToken, event.timestamp, [event.newPrincipal, event.newCollateral], update, EMPTY_LOANSTAT_FUNC);
    
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
        user,lender
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
    
    let update = (data: LoanStat, values: BigInt[]): void =>{
        data.tradeBorrowedAmountVolume = data.tradeBorrowedAmountVolume.plus(new BigDecimal(values[0]));
        data.tradePositionSizeVolume = data.tradePositionSizeVolume.plus(new BigDecimal(values[1]));
        data.tradeTxCount = data.tradeTxCount.plus(ONE_BI);  
        data.lastEventType = 'Borrow';
    };
  
    saveLoanStats('D', null, loan.loanToken, loan.collateralToken, event.timestamp, [event.borrowedAmount, event.positionSize], update, EMPTY_LOANSTAT_FUNC);
    saveLoanStats('D', user, loan.loanToken, loan.collateralToken, event.timestamp, [event.borrowedAmount, event.positionSize], update, EMPTY_LOANSTAT_FUNC);
    log.debug("handleTrade done", []);
}