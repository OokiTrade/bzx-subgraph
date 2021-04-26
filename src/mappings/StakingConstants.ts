import {
    Stake,
    Unstake,
    AddRewards,
    Claim,
    ConvertFees,
    DistributeFees,
    WithdrawFees
} from '../types/StakingConstants/StakingConstants'

import {
    StakingStakeEvent,
    StakingUnstakeEvent,
    StakingAddRewardsEvent,
    StakingClaimEvent,
    StakingConvertFeesEvent,
    StakingDistributeFeesEvent,
    StakingWithdrawFeesEvent
} from '../types/schema'

import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats as saveTokenStakingStats } from '../helpers/tokenStakingStatsHelper';
import { saveStats as saveStakingStats } from '../helpers/stakingStatsHelper';
import { saveStats as saveFeesStats} from '../helpers/feesStatsHelper';


export function handleStake(networkEvent: Stake): void {
    log.info("handleStake: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingStakeEvent(
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
    event.type = 'StakingStakeEvent'
    event.save();

    saveTokenStakingStats(user, event.token, event.timestamp,
        event.type, 
        ['stakeAmountVolume', 'stakeTxCount'],
        [event.amount, ONE_BI]
    );

    log.debug("handleStake done", []);
}

export function handleUnstake(networkEvent: Unstake): void {
    log.info("handleUnstake: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingUnstakeEvent(
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
    event.type = 'StakingUnstakeEvent'
    event.save();

    saveTokenStakingStats(user, event.token, event.timestamp,
        event.type, 
        ['unstakeAmountVolume', 'unstakeTxCount'],
        [event.amount, ONE_BI]
    );

    log.debug("handleUnstake done", []);
}

export function handleAddRewards(networkEvent: AddRewards): void {
    log.info("handleAddRewards: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingAddRewardsEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.user = networkEvent.transaction.from.toHex()
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.bzrxAmount = networkEvent.params.bzrxAmount;
    event.stableCoinAmount = networkEvent.params.stableCoinAmount;
    event.type = 'StakingAddRewardsEvent'
    event.save();


    saveStakingStats(sender, event.timestamp,
        event.type, 
        ['addRewardsBzrxAmountVolume', 'addRewardsStableCoinAmountVolume', 'addRewardsTxCount'],
        [event.bzrxAmount, event.stableCoinAmount, ONE_BI]
    );

    log.debug("handleAddRewards done", []);
}

export function handleClaim(networkEvent: Claim): void {
    log.info("handleClaim: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingClaimEvent(
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
    event.type = 'StakingClaimEvent'
    event.save();

    saveStakingStats(user, event.timestamp,
        event.type, 
        ['claimBzrxAmountVolume', 'claimStableCoinAmountVolume', 'claimTxCount'],
        [event.bzrxAmount, event.stableCoinAmount, ONE_BI]
    );

    log.debug("handleClaim done", []);
}

export function handleConvertFees(networkEvent: ConvertFees): void {
    log.info("handleConvertFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingConvertFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.user = networkEvent.transaction.from.toHex()
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.bzrxOutput = networkEvent.params.bzrxOutput;
    event.stableCoinOutput = networkEvent.params.stableCoinOutput;
    event.type = 'StakingConvertFeesEvent'
    event.save();

    saveFeesStats(sender,  event.address, event.timestamp,
        event.type, 
        ['stakingConvertFeesBzrxOutputVolume', 'stakingConvertFeesBzrxOutputTxCount',
        'stakingConvertFeesStableCoinOutputVolume', 'stakingConvertFeesStableCoinOutputTxCount'],
        [event.bzrxOutput, ONE_BI, event.stableCoinOutput, ONE_BI]
    );

    log.debug("handleConvertFees done", []);
}

export function handleDistributeFees(networkEvent: DistributeFees): void {
    log.info("handleDistributeFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingDistributeFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.user = networkEvent.transaction.from.toHex()
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.bzrxRewards = networkEvent.params.bzrxRewards;
    event.stableCoinRewards = networkEvent.params.stableCoinRewards;
    event.type = 'StakingDistributeFeesEvent'
    event.save();

    saveFeesStats(sender, event.address, event.timestamp,  
        event.type, 
        ['stakingDistributeFeesBzrxRewardsVolume', 'stakingDistributeFeesBzrxRewardsTxCount',
         'stakingDistributeFeesStableCoinRewardsVolume', 'stakingDistributeFeesStableCoinRewardsTxCount'],
        [event.bzrxRewards, , ONE_BI, event.stableCoinRewards, ONE_BI]
    );

    log.debug("handleDistributeFees done", []);
}

export function handleWithdrawFees(networkEvent: WithdrawFees): void {
    log.info("handleWithdrawFees: Start processing event: {}", [networkEvent.logIndex.toString()]);
    let event = new StakingWithdrawFeesEvent(
        getEventId(networkEvent.transaction.hash, networkEvent.logIndex)
    );
    let tx = saveTransaction(networkEvent.transaction, networkEvent.block);
    let timestamp = networkEvent.block.timestamp.toI32();
    let sender = getUser(networkEvent.params.sender.toHex(), timestamp);
    event.user = networkEvent.transaction.from.toHex()
    event.transaction = tx.id;
    event.address = networkEvent.address.toHex();
    event.timestamp = timestamp;
    event.sender = sender.id;
    event.type = 'StakingWithdrawFeesEvent'
    event.save();

    log.debug("handleWithdrawFees done", []);
}
