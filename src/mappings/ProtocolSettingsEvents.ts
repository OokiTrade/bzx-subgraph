import { 
    WithdrawLendingFees,
    WithdrawTradingFees,
    WithdrawBorrowingFees
} from '../types/ProtocolSettingsEvents/ProtocolSettingsEvents'

import { 
    WithdrawLendingFeesEvent,
    WithdrawTradingFeesEvent,
    WithdrawBorrowingFeesEvent,
    FeesStat
 } from '../types/schema'

import { getEventId, ONE_BI, saveTransaction, saveFeesStats, getUser, EMPTY_FEESSTAT_FUNC } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";


export function handleWithdrawLendingFees(networkEvent: WithdrawLendingFees): void {
    log.info("handleWithdrawLendingFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new WithdrawLendingFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.sender = sender.id;
    event.receiver = receiver.id;
    event.amount = networkEvent.params.amount;
    event.save();    
    
    let updateSender = (data: FeesStat, values: BigInt[]): void =>{
      data.withdrawLendingFeesSenderVolume = data.withdrawLendingFeesSenderVolume.plus(new BigDecimal(values[0]));
      data.withdrawLendingFeesSenderTxCount = data.withdrawLendingFeesSenderTxCount.plus(ONE_BI);  
      data.lastEventType = 'WithdrawLendingFeesEvent';
    };

    let updateReceiver = (data: FeesStat, values: BigInt[]): void =>{
        data.withdrawLendingFeesReceiverVolume = data.withdrawLendingFeesReceiverVolume.plus(new BigDecimal(values[0]));
        data.withdrawLendingFeesReceiverTxCount = data.withdrawLendingFeesReceiverTxCount.plus(ONE_BI);  
        data.lastEventType = 'WithdrawLendingFees';
      };
   
    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], updateSender,updateReceiver);
    saveFeesStats('D', sender, event.token, event.timestamp, [event.amount], updateSender, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', receiver, event.token, event.timestamp, [event.amount], updateReceiver, EMPTY_FEESSTAT_FUNC);
    log.debug("handleWithdrawLendingFees done", []);
}

export function handleWithdrawTradingFees(networkEvent: WithdrawTradingFees): void {
    log.info("handleWithdrawTradingFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new WithdrawTradingFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.sender = sender.id;
    event.receiver = receiver.id;
    event.amount = networkEvent.params.amount;
    event.save();    
    
    let updateSender = (data: FeesStat, values: BigInt[]): void =>{
      data.withdrawTradingFeesSenderVolume = data.withdrawTradingFeesSenderVolume.plus(new BigDecimal(values[0]));
      data.withdrawTradingFeesSenderTxCount = data.withdrawTradingFeesSenderTxCount.plus(ONE_BI);  
      data.lastEventType = 'WithdrawTradingFees';
    };

    let updateReceiver = (data: FeesStat, values: BigInt[]): void =>{
        data.withdrawTradingFeesReceiverVolume = data.withdrawTradingFeesReceiverVolume.plus(new BigDecimal(values[0]));
        data.withdrawTradingFeesReceiverTxCount = data.withdrawTradingFeesReceiverTxCount.plus(ONE_BI);  
        data.lastEventType = 'WithdrawTradingFees';
    };
   
    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], updateSender,updateReceiver);
    saveFeesStats('D', sender, event.token, event.timestamp, [event.amount], updateSender, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', receiver, event.token, event.timestamp, [event.amount], updateReceiver, EMPTY_FEESSTAT_FUNC);
    log.debug("handleWithdrawTradingFees done", []);
}

export function handleWithdrawBorrowingFees(networkEvent: WithdrawBorrowingFees): void {
    log.info("handleWithdrawBorrowingFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new WithdrawBorrowingFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.token = networkEvent.params.token.toHex();
    event.sender = sender.id;
    event.receiver = receiver.id;
    event.amount = networkEvent.params.amount;
    event.save();    
    
    let updateSender = (data: FeesStat, values: BigInt[]): void =>{
      data.withdrawBorrowingFeesSenderVolume = data.withdrawBorrowingFeesSenderVolume.plus(new BigDecimal(values[0]));
      data.withdrawBorrowingFeesSenderTxCount = data.withdrawBorrowingFeesSenderTxCount.plus(ONE_BI);  
      data.lastEventType = 'WithdrawBorrowingFees';
    };
    let updateReceiver = (data: FeesStat, values: BigInt[]): void =>{
        data.withdrawBorrowingFeesReceiverVolume = data.withdrawBorrowingFeesReceiverVolume.plus(new BigDecimal(values[0]));
        data.withdrawBorrowingFeesReceiverTxCount = data.withdrawBorrowingFeesReceiverTxCount.plus(ONE_BI);  
        data.lastEventType = 'WithdrawBorrowingFees';
      };
   
    saveFeesStats('D', null, event.token, event.timestamp, [event.amount], updateSender,updateReceiver);
    saveFeesStats('D', sender, event.token, event.timestamp, [event.amount], updateSender, EMPTY_FEESSTAT_FUNC);
    saveFeesStats('D', receiver, event.token, event.timestamp, [event.amount], updateReceiver, EMPTY_FEESSTAT_FUNC);
    log.debug("handleWithdrawBorrowingFees done", []);
}
