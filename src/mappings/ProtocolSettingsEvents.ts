import {
  WithdrawLendingFees,
  WithdrawTradingFees,
  WithdrawBorrowingFees
} from '../types/ProtocolSettingsEvents/ProtocolSettingsEvents'

import {
  WithdrawLendingFeesEvent,
  WithdrawTradingFeesEvent,
  WithdrawBorrowingFeesEvent
} from '../types/schema'

import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/feesStatsHelper';


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

  saveStats(sender, event.token, event.timestamp,  
    'WithdrawLendingFees', 
    ['withdrawLendingFeesSenderVolume', 'withdrawLendingFeesSenderTxCount'],
    [event.amount, ONE_BI]
  );

  saveStats(receiver, event.token, event.timestamp,  
    'WithdrawLendingFees', 
    ['withdrawLendingFeesReceiverVolume', 'withdrawLendingFeesReceiverTxCount'],
    [event.amount, ONE_BI]
  );
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

  saveStats(sender, event.token, event.timestamp,  
    'WithdrawTradingFees', 
    ['withdrawTradingFeesSenderVolume', 'withdrawTradingFeesSenderTxCount'],
    [event.amount, ONE_BI]
  );

  saveStats(receiver, event.token, event.timestamp,  
    'WithdrawTradingFees', 
    ['withdrawTradingFeesReceiverVolume', 'withdrawTradingFeesReceiverTxCount'],
    [event.amount, ONE_BI]
  );

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

  saveStats(sender, event.token, event.timestamp,  
    'WithdrawBorrowingFees', 
    ['withdrawBorrowingFeesSenderVolume', 'withdrawBorrowingFeesSenderTxCount'],
    [event.amount, ONE_BI]
  );

  saveStats(receiver, event.token, event.timestamp,  
    'WithdrawBorrowingFees', 
    ['withdrawBorrowingFeesReceiverVolume', 'withdrawBorrowingFeesReceiverTxCount'],
    [event.amount, ONE_BI]
  );
  log.debug("handleWithdrawBorrowingFees done", []);
}
