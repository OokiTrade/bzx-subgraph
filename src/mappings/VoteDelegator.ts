//../types/BZRX/Token is used for BZRX, vBZRX, LPT tokens
import { DelegateChanged, DelegateVotesChanged } from '../types/VoteDelegator/VoteDelegator'
import { DelegateChangedEvent, DelegateVotesChangedEvent } from '../types/schema'
import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';


export function handleDelegateChanged(networkEvent: DelegateChanged): void {
  log.info("handleDelegateChanged: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new DelegateChangedEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.delegator.toHex(), timestamp);
  let from = getUser(networkEvent.params.fromDelegate.toHex(), timestamp);
  let to = getUser(networkEvent.params.toDelegate.toHex(), timestamp);
  
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.user = user.id;
  event.toDelegate = to.id;
  event.fromDelegate = from.id;
  event.type = 'DelegateChangedEvent'
  event.save();
  log.debug("handleDelegateChanged done", []);
}

export function handleDelegateVotesChanged(networkEvent: DelegateVotesChanged): void {
  log.info("handleDelegateVotesChanged: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new DelegateVotesChangedEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.delegate.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = user.id;
  event.previousBalance = networkEvent.params.previousBalance;
  event.newBalance = networkEvent.params.newBalance;
  event.type = 'DelegateVotesChangedEvent'
  event.save();

  log.debug("handleDelegateVotesChanged done", []);
}

