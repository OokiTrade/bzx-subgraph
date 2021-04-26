//../types/iBZRX/iToken is used for all iTokens
import { Transfer, Approval, Mint, Burn, FlashBorrow } from '../types/iETH/iToken'
import { TransferEvent, ApprovalEvent, MintEvent, BurnEvent, FlashBorrowEvent } from '../types/schema'
import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats } from '../helpers/tokenStatsHelper';



export function handleTransfer(networkEvent: Transfer): void {
  log.info("handleTransfer: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new TransferEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let from = getUser(networkEvent.params.from.toHex(), timestamp);
  let to = getUser(networkEvent.params.to.toHex(), timestamp);
  event.user = networkEvent.transaction.from.toHex()
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.from = from.id;
  event.to = to.id;
  event.value = networkEvent.params.value;
  event.type = 'TransferEvent'
  event.save();

  saveStats(from, event.address, event.timestamp,  
    event.type, 
    ['transferFromVolume', 'transferFromTxCount'],
    [event.value, ONE_BI]
  );
  saveStats(from, event.address, event.timestamp,  
    event.type, 
    ['transferToVolume', 'transferToTxCount'],
    [event.value, ONE_BI]
  );

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
  event.user = networkEvent.transaction.from.toHex()
  event.transaction = tx.id;
  event.timestamp = timestamp;
  event.address = networkEvent.address.toHex();
  event.owner = owner.id;
  event.spender = spender.id;
  event.value = networkEvent.params.value;
  event.type = 'ApprovalEvent'
  event.save();

  saveStats(owner, event.address, event.timestamp,  
    event.type, 
    ['approvalOwnerVolume', 'approvalOwnerTxCount'],
    [event.value, ONE_BI]
  );
  saveStats(spender, event.address, event.timestamp,  
    event.type, 
    ['approvalSpenderVolume', 'approvalSpenderTxCount'],
    [event.value, ONE_BI]
  );

  log.debug("handleApproval done", []);
}

export function handleMint(networkEvent: Mint): void {
  log.info("handleMint: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new MintEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let minter = getUser(networkEvent.params.minter.toHex(), timestamp);
  event.user = networkEvent.transaction.from.toHex()
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.minter = minter.id;
  event.tokenAmount = networkEvent.params.tokenAmount;
  event.assetAmount = networkEvent.params.assetAmount;
  event.price = networkEvent.params.price;
  event.type = 'MintEvent'
  event.save();

  saveStats(minter, event.address, event.timestamp,  
    event.type, 
    ['mintTokenVolume', 'mintAssetVolume', 'mintTxCount'],
    [event.tokenAmount, event.assetAmount,  ONE_BI]
  );
  log.debug("handleMint done", []);
}

export function handleBurn(networkEvent: Burn): void {
  log.info("handleBurn: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new BurnEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let burner = getUser(networkEvent.params.burner.toHex(), timestamp);
  event.user = networkEvent.transaction.from.toHex()
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.burner = burner.id;
  event.tokenAmount = networkEvent.params.tokenAmount;
  event.assetAmount = networkEvent.params.assetAmount;
  event.price = networkEvent.params.price;
  event.type = 'BurnEvent'
  event.save();

  saveStats(burner, event.address, event.timestamp,  
    event.type, 
    ['burnTokenVolume', 'burnAssetVolume', 'burnTxCount'],
    [event.tokenAmount, event.assetAmount,  ONE_BI]
  );
  log.debug("handleMint done", []);
}


export function handleFlashBorrow(networkEvent: FlashBorrow): void {
  log.info("handleFlashBorrow: Start processing event: {}", [networkEvent.logIndex.toString()]);
  let event = new FlashBorrowEvent(
    getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
  );
  let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
  let timestamp = networkEvent.block.timestamp.toI32();
  let borrower = getUser(networkEvent.params.borrower.toHex(), timestamp);
  event.user = networkEvent.transaction.from.toHex()
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.borrower = borrower.id;
  event.loanToken = networkEvent.params.loanToken.toHex();
  event.loanAmount = networkEvent.params.loanAmount;
  event.type = 'FlashBorrowEvent'
  event.save();

  saveStats(borrower, event.address, event.timestamp,  
    event.type, 
    ['flashBorrowVolume', 'flashBorrowTxCount'],
    [event.loanAmount, ONE_BI]
  );
  log.debug("handleFlashBorrow done", []);
}

