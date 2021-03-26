import { 
    Stake,
    Unstake,
    AddRewards,
    Claim,
    ConvertFees,
    DistributeFees
} from '../types/StakingConstants/StakingConstants'

import { 
    StakeEvent,
    UnstakeEvent,
    AddRewardsEvent,
    ClaimEvent,
    ConvertFeesEvent,
    DistributeFeesEvent,
    StakingStat,
    TokenStakingStat
 } from '../types/schema'

import { getEventId, ONE_BI, saveTransaction, saveStakingStats, saveTokenStakingStats, getUser } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";


export function handleStake(networkEvent: Stake): void {
    log.info("handleStake: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakeEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.user = user.id;
    event.token = networkEvent.params.token.toHex();
    event.delegate = networkEvent.params.delegate.toHex();
    event.amount = networkEvent.params.amount;
    event.save();  
    
    let update = (data: TokenStakingStat, values: BigInt[]): void =>{
      data.stakeAmountVolume = data.stakeAmountVolume.plus(new BigDecimal(values[0]));
      data.stakeTxCount = data.stakeTxCount.plus(ONE_BI);  
      data.lastEventType = 'Stake';
    };

    saveTokenStakingStats('D', null, event.token, event.timestamp, [event.amount], update);
    saveTokenStakingStats('D', user, event.token, event.timestamp, [event.amount], update);
    log.debug("handleStake done", []);
    
}

export function handleUnstake(networkEvent: Unstake): void {
    log.info("handleUnstake: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new UnstakeEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.user = user.id;
    event.token = networkEvent.params.token.toHex();
    event.delegate = networkEvent.params.delegate.toHex();
    event.amount = networkEvent.params.amount;
    event.save();  
    
    let update = (data: TokenStakingStat, values: BigInt[]): void =>{
      data.unstakeAmountVolume = data.stakeAmountVolume.plus(new BigDecimal(values[0]));
      data.unstakeTxCount = data.stakeTxCount.plus(ONE_BI);  
      data.lastEventType = 'Unstake';
    };

    saveTokenStakingStats('D', null, event.token, event.timestamp, [event.amount], update);
    saveTokenStakingStats('D', user, event.token, event.timestamp, [event.amount], update);
    log.debug("handleUnstake done", []);
}

export function handleAddRewards(networkEvent: AddRewards): void {
    log.info("handleAddRewards: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new AddRewardsEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.bzrxAmount = networkEvent.params.bzrxAmount;
    event.stableCoinAmount = networkEvent.params.stableCoinAmount;
    event.save();  
  
    let update = (data: StakingStat, values: BigInt[]): void =>{
      data.addRewardsBzrxAmountVolume = data.addRewardsBzrxAmountVolume.plus(new BigDecimal(values[0]));
      data.addRewardsStableCoinAmountVolume = data.addRewardsStableCoinAmountVolume.plus(new BigDecimal(values[0]));
      data.addRewardsTxCount = data.addRewardsTxCount.plus(ONE_BI);  
      data.lastEventType = 'AddRewards';
    };
    saveStakingStats('D', null, event.timestamp, [event.bzrxAmount, event.stableCoinAmount], update);
    saveStakingStats('D', sender, event.timestamp, [event.bzrxAmount, event.stableCoinAmount], update);
  
    log.debug("handleAddRewards done", []);
}

export function handleClaim(networkEvent: Claim): void {
    log.info("handleClaim: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ClaimEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let user = getUser(networkEvent.params.user.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.user = user.id;
    event.bzrxAmount = networkEvent.params.bzrxAmount;
    event.stableCoinAmount = networkEvent.params.stableCoinAmount;
    event.save();

    let update = (data: StakingStat, values: BigInt[]): void =>{
        data.claimBzrxAmountVolume = data.claimBzrxAmountVolume.plus(new BigDecimal(values[0]));
        data.claimStableCoinAmountVolume = data.claimStableCoinAmountVolume.plus(new BigDecimal(values[1]));
        data.claimTxCount = data.addRewardsTxCount.plus(ONE_BI);  
        data.lastEventType = 'Claim';
      };
    saveStakingStats('D', null, event.timestamp, [event.bzrxAmount, event.stableCoinAmount], update);
    saveStakingStats('D', user, event.timestamp, [event.bzrxAmount, event.stableCoinAmount], update);

    log.debug("handleClaim done", []);
}

export function handleConvertFees(networkEvent: ConvertFees): void {
    log.info("handleConvertFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new ConvertFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.bzrxOutput = networkEvent.params.bzrxOutput;
    event.stableCoinOutput = networkEvent.params.stableCoinOutput;
    event.save();

    let update = (data: StakingStat, values: BigInt[]): void =>{
        data.convertFeesBzrxOutputVolume = data.convertFeesBzrxOutputVolume.plus(new BigDecimal(values[0]));
        data.convertFeesStableCoinOutputVolume = data.convertFeesStableCoinOutputVolume.plus(new BigDecimal(values[1]));
        data.convertFeesTxCount = data.convertFeesTxCount.plus(ONE_BI);  
        data.lastEventType = 'ConvertFees';
      };
    saveStakingStats('D', null, event.timestamp, [event.bzrxOutput, event.stableCoinOutput], update);
    saveStakingStats('D', sender, event.timestamp, [event.bzrxOutput, event.stableCoinOutput], update);
      
    log.debug("handleConvertFees done", []);
}

export function handleDistributeFees(networkEvent: DistributeFees): void {
    log.info("handleCDistributeFeesFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new DistributeFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.bzrxRewards = networkEvent.params.bzrxRewards;
    event.stableCoinRewards = networkEvent.params.stableCoinRewards;
    event.save();

    let update = (data: StakingStat, values: BigInt[]): void =>{
        data.distributeFeesBzrxRewardsVolume = data.distributeFeesBzrxRewardsVolume.plus(new BigDecimal(values[0]));
        data.distributeFeesStableCoinRewardsVolume = data.distributeFeesStableCoinRewardsVolume.plus(new BigDecimal(values[1]));
        data.distributeFeesTxCount = data.distributeFeesTxCount.plus(ONE_BI);  
        data.lastEventType = 'DistributeFees';
      };
    saveStakingStats('D', null, event.timestamp, [event.bzrxRewards, event.stableCoinRewards], update);
    saveStakingStats('D', sender, event.timestamp, [event.bzrxRewards, event.stableCoinRewards], update);
     
      
    log.debug("handleCDistributeFeesFees done", []);
}
