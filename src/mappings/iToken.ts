//../types/iBZRX/iToken is used for all iTokens
import { Transfer, Approval, Mint, Burn, FlashBorrow } from '../types/iBZRX/iToken'
import { TransferEvent, ApprovalEvent, MintEvent, BurnEvent, FlashBorrowEvent, TokenStat } from '../types/schema'
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
    
    let updateFrom = (data: TokenStat, values: BigInt[]): void =>{
      data.transferFromVolume = data.transferFromVolume.plus(new BigDecimal(values[0]));
      data.transferFromTxCount = data.transferFromTxCount.plus(ONE_BI);  
      data.lastEventType = 'Transfer';
    };
    let updateTo = (data: TokenStat, values: BigInt[]): void =>{
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
    
    let updateOwner = (data: TokenStat, values: BigInt[]): void =>{
      data.approvalOwnerVolume = data.approvalOwnerVolume.plus(new BigDecimal(values[0]));
      data.approvalOwnerTxCount = data.approvalOwnerTxCount.plus(ONE_BI);
      data.lastEventType = 'Approval';
    };
    let updateSpender = (data: TokenStat, values: BigInt[]): void =>{
      data.approvalSpenderVolume = data.approvalSpenderVolume.plus(new BigDecimal(values[0]));
      data.approvalSpenderTxCount = data.approvalSpenderTxCount.plus(ONE_BI);
      data.lastEventType = 'Approval';
    };
    
    saveTokenStats('D', null, event.address, event.timestamp, [event.value], updateOwner, updateSpender);
    saveTokenStats('D', owner, event.address, event.timestamp, [event.value], updateOwner, EMPTY_TOKENSTAT_FUNC);
    saveTokenStats('D', spender, event.address, event.timestamp, [event.value], updateSpender, EMPTY_TOKENSTAT_FUNC);

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
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.minter = minter.id;
  event.tokenAmount = networkEvent.params.tokenAmount;
  event.assetAmount = networkEvent.params.assetAmount;
  event.price = networkEvent.params.price;
  event.save();    
  
  let update = (data: TokenStat, values: BigInt[]): void =>{
    data.mintTokenVolume = data.mintTokenVolume.plus(new BigDecimal(values[0]));
    data.mintAssetVolume = data.mintAssetVolume.plus(new BigDecimal(values[1]));
    data.mintTxCount = data.mintTxCount.plus(ONE_BI);  
    data.lastEventType = 'Mint';
  };
 
  saveTokenStats('D', null, event.address, event.timestamp, [event.tokenAmount, event.assetAmount], update, EMPTY_TOKENSTAT_FUNC);
  saveTokenStats('D', minter, event.address, event.timestamp, [event.tokenAmount, event.assetAmount], update, EMPTY_TOKENSTAT_FUNC); 
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
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.burner = burner.id;
  event.tokenAmount = networkEvent.params.tokenAmount;
  event.assetAmount = networkEvent.params.assetAmount;
  event.price = networkEvent.params.price;
  event.save();    
  
  let update = (data: TokenStat, values: BigInt[]): void =>{
    data.burnTokenVolume = data.burnTokenVolume.plus(new BigDecimal(values[0]));
    data.burnAssetVolume = data.burnAssetVolume.plus(new BigDecimal(values[1]));
    data.burnTxCount = data.burnTxCount.plus(ONE_BI);  
    data.lastEventType = 'Burn';
  };
 
  saveTokenStats('D',null, event.address, event.timestamp, [event.tokenAmount, event.assetAmount], update, EMPTY_TOKENSTAT_FUNC); 
  saveTokenStats('D', burner, event.address, event.timestamp, [event.tokenAmount, event.assetAmount], update, EMPTY_TOKENSTAT_FUNC);
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
  event.transaction = tx.id;
  event.address = networkEvent.address.toHex();
  event.timestamp = timestamp;
  event.borrower = borrower.id;
  event.loanToken = networkEvent.params.loanToken.toHex();
  event.loanAmount = networkEvent.params.loanAmount;
  event.save();
  
  let update = (data: TokenStat, values: BigInt[]): void =>{
    data.flashBorrowVolume = data.flashBorrowVolume.plus(new BigDecimal(values[0]));
    data.flashBorrowTxCount = data.burnTxCount.plus(ONE_BI);  
    data.lastEventType = 'FlashBorrow';
  };
 
  saveTokenStats('D', null, event.address, event.timestamp, [event.loanAmount], update, EMPTY_TOKENSTAT_FUNC);
  saveTokenStats('D', borrower, event.address, event.timestamp, [event.loanAmount], update, EMPTY_TOKENSTAT_FUNC); 
  log.debug("handleFlashBorrow done", []);
}

