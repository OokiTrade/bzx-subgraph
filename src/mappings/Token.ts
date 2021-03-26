//../types/BZRX/Token is used for BZRX, vBZRX, LPT tokens
import { Transfer, Approval } from '../types/BZRX/Token'
import { TransferEvent, ApprovalEvent, TokenStat } from '../types/schema'
import { getEventId, ONE_BI, saveTransaction, saveTokenStats, getUser, EMPTY_TOKENSTAT_FUNC } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";


export function handleTransfer(networkEvent: Transfer): void {
  log.info("handleTransfer: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new TransferEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let from = getUser(networkEvent.params.from.toHex(), timestamp);
  let to = getUser(networkEvent.params.to.toHex(), timestamp);
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.from = from.id;
  event.to = to.id;
  event.value = networkEvent.params.value;
  event.save();

  let updateFrom = (data: TokenStat, values: BigInt[]): void => {
    data.transferFromVolume = data.transferFromVolume.plus(new BigDecimal(values[0]));
    data.transferFromTxCount = data.transferFromTxCount.plus(ONE_BI);
    data.lastEventType = 'Transfer';
  };
  let updateTo = (data: TokenStat, values: BigInt[]): void => {
    data.transferToVolume = data.transferToVolume.plus(new BigDecimal(values[0]));
    data.transferToTxCount = data.transferToTxCount.plus(ONE_BI);
    data.lastEventType = 'Transfer';
  };

  saveTokenStats('D', null, event.address, event.timestamp, [event.value], updateFrom, updateTo);
  saveTokenStats('D', from, event.address, event.timestamp, [event.value], updateFrom, EMPTY_TOKENSTAT_FUNC);
  saveTokenStats('D', to, event.address, event.timestamp, [event.value], updateTo, EMPTY_TOKENSTAT_FUNC);
  log.debug("handleTransfer done", []);
}

export function handleApproval(networkEvent: Approval): void {
  log.info("handleApproval: Start processing event: {}", [networkEvent.logIndex.toString()]);

  let event = new ApprovalEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let owner = getUser(networkEvent.params.owner.toHex(), timestamp);
  let spender = getUser(networkEvent.params.spender.toHex(), timestamp);
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.owner = owner.id;
  event.spender = spender.id;
  event.value = networkEvent.params.value;
  event.save();

  let updateOwner = (data: TokenStat, values: BigInt[]): void => {
    data.approvalOwnerVolume = data.approvalOwnerVolume.plus(new BigDecimal(values[0]));
    data.approvalOwnerTxCount = data.approvalOwnerTxCount.plus(ONE_BI);
    data.lastEventType = 'Approval';
  };
  let updateSpender = (data: TokenStat, values: BigInt[]): void => {
    data.approvalSpenderVolume = data.approvalSpenderVolume.plus(new BigDecimal(values[0]));
    data.approvalSpenderTxCount = data.approvalSpenderTxCount.plus(ONE_BI);
    data.lastEventType = 'Approval';
  };

  saveTokenStats('D', null, event.address, event.timestamp, [event.value], updateOwner, updateSpender);
  saveTokenStats('D', owner, event.address, event.timestamp, [event.value], updateOwner, EMPTY_TOKENSTAT_FUNC);
  saveTokenStats('D', spender, event.address, event.timestamp, [event.value], updateSpender, EMPTY_TOKENSTAT_FUNC);
  log.debug("handleApproval done", []);
}

