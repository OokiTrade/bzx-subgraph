//../types/BZRX/Token is used for BZRX, vBZRX, LPT tokens
import { ProposalCreated, VoteCast, ProposalCanceled, ProposalExecuted, ProposalQueued } from '../types/GovernorBravoDelegate/GovernorBravoDelegate'
import { ProposalCreatedEvent, VoteCastEvent, ProposalCanceledEvent, ProposalExecutedEvent, ProposalQueuedEvent } from '../types/schema'
import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';


export function handleProposalCreated(networkEvent: ProposalCreated): void {
  log.info("handleProposalCreated: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new ProposalCreatedEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.proposer.toHex(), timestamp);
  
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.user = user.id;
  event.proposalId = networkEvent.params.id;
  event.description = networkEvent.params.description;
  event.startBlock = networkEvent.params.startBlock;
  event.endBlock = networkEvent.params.endBlock;
  event.type = 'ProposalCreatedEvent'
  event.save();
  log.debug("handleProposalCreated done", []);
}

export function handleVoteCast(networkEvent: VoteCast): void {
  log.info("handleVoteCast: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new VoteCastEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let user = getUser(networkEvent.params.voter.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = user.id;
  event.proposalId = networkEvent.params.proposalId;
  event.reason = networkEvent.params.reason;
  event.support = networkEvent.params.support;
  event.votes = networkEvent.params.votes;
  event.type = 'VoteCastEventEvent'
  event.save();

  log.debug("handleVoteCast done", []);
}

export function handleProposalCanceled(networkEvent: ProposalCanceled): void {
  log.info("handleProposalCanceled: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new ProposalCanceledEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let from = getUser(networkEvent.transaction.from.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = from.id;
  event.proposalId = networkEvent.params.id;
  event.type = 'ProposalCanceledEvent'
  event.save();

  log.debug("handleProposalCanceled done", []);
}

export function handleProposalQueued(networkEvent: ProposalQueued): void {
  log.info("handleProposalExecuted: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new ProposalQueuedEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let from = getUser(networkEvent.transaction.from.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = from.id;
  event.proposalId = networkEvent.params.id;
  event.eta = networkEvent.params.eta;
  event.type = 'ProposalQueuedEvent'
  event.save();

  log.debug("handleProposalQueued done", []);
}

export function handleProposalExecuted(networkEvent: ProposalExecuted): void {
  log.info("handleProposalExecuted: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new ProposalExecutedEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let from = getUser(networkEvent.transaction.from.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.user = from.id;
  event.proposalId = networkEvent.params.id;
  event.type = 'ProposalExecutedEvent'
  event.save();

  log.debug("handleProposalExecuted done", []);
}

