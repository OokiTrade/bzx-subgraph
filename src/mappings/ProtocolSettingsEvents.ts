import {
  WithdrawLendingFees,
  WithdrawTradingFees,
  WithdrawBorrowingFees
} from '../types/ProtocolSettingsEvents/ProtocolSettingsEvents'

import {
  ProtocolWithdrawLendingFeesEvent,
  ProtocolWithdrawTradingFeesEvent,
  ProtocolWithdrawBorrowingFeesEvent
} from '../types/schema'

import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/feesStatsHelper';


export function handleWithdrawLendingFees(networkEvent: WithdrawLendingFees): void {
  log.info("handleWithdrawLendingFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new ProtocolWithdrawLendingFeesEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
  let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
  let from = getUser(networkEvent.transaction.from.toHex(), timestamp);
  event.user = from.id
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.token = networkEvent.params.token.toHex();
  event.sender = sender.id;
  event.receiver = receiver.id;
  event.amount = networkEvent.params.amount;
  event.type = 'ProtocolWithdrawLendingFeesEvent'
  event.save();

  saveStats(sender, event.token, event.timestamp,  
    event.type, 
    ['withdrawLendingFeesSenderVolume', 'withdrawLendingFeesSenderTxCount'],
    [event.amount, ONE_BI]
  );

  saveStats(receiver, event.token, event.timestamp,  
    event.type, 
    ['withdrawLendingFeesReceiverVolume', 'withdrawLendingFeesReceiverTxCount'],
    [event.amount, ONE_BI]
  );
  log.debug("handleWithdrawLendingFees done", []);
}

export function handleWithdrawTradingFees(networkEvent: WithdrawTradingFees): void {
  log.info("handleWithdrawTradingFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new ProtocolWithdrawTradingFeesEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
  let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
  let from = getUser(networkEvent.transaction.from.toHex(), timestamp);
  event.user = from.id
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.token = networkEvent.params.token.toHex();
  event.sender = sender.id;
  event.receiver = receiver.id;
  event.amount = networkEvent.params.amount;
  event.type = 'ProtocolWithdrawTradingFeesEvent'
  event.save();

  saveStats(sender, event.token, event.timestamp,  
    event.type, 
    ['withdrawTradingFeesSenderVolume', 'withdrawTradingFeesSenderTxCount'],
    [event.amount, ONE_BI]
  );

  saveStats(receiver, event.token, event.timestamp,  
    event.type, 
    ['withdrawTradingFeesReceiverVolume', 'withdrawTradingFeesReceiverTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleWithdrawTradingFees done", []);
}

export function handleWithdrawBorrowingFees(networkEvent: WithdrawBorrowingFees): void {
  log.info("handleWithdrawBorrowingFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new ProtocolWithdrawBorrowingFeesEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
  let receiver = getUser(networkEvent.params.receiver.toHex(), timestamp);
  let from = getUser(networkEvent.transaction.from.toHex(), timestamp);
  event.user = from.id
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.token = networkEvent.params.token.toHex();
  event.sender = sender.id;
  event.receiver = receiver.id;
  event.amount = networkEvent.params.amount;
  event.type = 'ProtocolWithdrawBorrowingFeesEvent'
  event.save();

  saveStats(sender, event.token, event.timestamp,  
    event.type, 
    ['withdrawBorrowingFeesSenderVolume', 'withdrawBorrowingFeesSenderTxCount'],
    [event.amount, ONE_BI]
  );

  saveStats(receiver, event.token, event.timestamp,  
    event.type, 
    ['withdrawBorrowingFeesReceiverVolume', 'withdrawBorrowingFeesReceiverTxCount'],
    [event.amount, ONE_BI]
  );
  log.debug("handleWithdrawBorrowingFees done", []);
}
