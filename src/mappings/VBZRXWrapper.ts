//../types/BZRX/Token is used for BZRX, vBZRX, LPT tokens
import { Deposit, Withdraw, Claim } from '../types/wvBzrx/VBZRXWrapper'
import { DepositEvent, WithdrawEvent, ClaimEvent } from '../types/schema'
import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/tokenStatsHelper';


export function handleDeposit(networkEvent: Deposit): void {
  log.info("handleDeposit: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new DepositEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.dst.toHex(), timestamp);
  
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.user = user.id;
  event.amount = networkEvent.params.value;
  event.type = 'DepositEvent'
  event.save();
  saveStats(user, event.address, event.timestamp,  
    event.type ,
    ['depistAmountVolume', 'depositTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleDeposit done", []);
}

export function handleWithdraw(networkEvent: Withdraw): void {
  log.info("handleWithdraw: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new WithdrawEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.src.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = user.id;
  event.amount = networkEvent.params.value;
  event.type = 'WithdrawEvent'
  event.save();

  saveStats(user, event.address, event.timestamp,  
    event.type ,
    ['withdrawalAmountVolume', 'withdrawalTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleWithdraw done", []);
}

export function handleClaim(networkEvent: Claim): void {
  log.info("handleClaim: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new ClaimEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.owner.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = user.id;
  event.amount = networkEvent.params.value;
  event.type = 'ClaimEvent'
  event.save();

  saveStats(user, event.address, event.timestamp,  
    event.type ,
    ['claimAmountVolume', 'claimTxCount'],
    [event.amount, ONE_BI]
  );

  log.debug("handleClaim done", []);
}

