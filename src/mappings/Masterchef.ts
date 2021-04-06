//../types/BZRX/Token is used for BZRX, vBZRX, LPT tokens
import { Deposit, Withdraw, EmergencyWithdraw } from '../types/Masterchef/Masterchef'
import { FarmingDepositEvent, FarmingWithdrawEvent, FarmingEmergencyWithdrawEvent } from '../types/schema'
import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/farmingStatsHelper';


export function handleDeposit(networkEvent: Deposit): void {
  log.info("handleDeposit: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new FarmingDepositEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.user.toHex(), timestamp);
  
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.user = user.id;
  event.amount = networkEvent.params.amount;
  event.pid = networkEvent.params.pid.toI32();
  event.save();
  saveStats(user, event.address, event.pid, event.timestamp,  
    'Deposit', 
    ['depistAmountVolume', 'depositTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleDeposit done", []);
}

export function handleWithdraw(networkEvent: Withdraw): void {
  log.info("handleWithdraw: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new FarmingWithdrawEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.user.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = user.id;
  event.amount = networkEvent.params.amount;
  event.pid = networkEvent.params.pid.toI32();
  event.save();

  saveStats(user, event.address, event.pid, event.timestamp,  
    'Withdraw', 
    ['withdrawAmountVolume', 'withdrawTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleWithdraw done", []);
}

export function handleEmergencyWithdraw(networkEvent: EmergencyWithdraw): void {
  log.info("handleEmergencyWithdraw: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new FarmingEmergencyWithdrawEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.user.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = user.id;
  event.amount = networkEvent.params.amount;
  event.pid = networkEvent.params.pid.toI32();
  event.save();

  saveStats(user, event.address, networkEvent.params.pid.toI32(), event.timestamp,  
    'EmergencyWithdraw', 
    ['emergencyWithdrawAmountVolume', 'emergencyWithdrawTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleWithdraw done", []);
}
