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
    DistributeFeesEvent
} from '../types/schema'

import { getEventId, saveTransaction, getUser } from '../helpers/helper'
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { ONE_BI } from '../helpers/constants';
import { saveStats as saveTokenStakingStats } from '../helpers/tokenStakingStatsHelper';
import { saveStats as saveStakingStats } from '../helpers/stakingStatsHelper';


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

    saveTokenStakingStats(user, event.token, event.timestamp,
        'Stake',
        ['stakeAmountVolume', 'stakeTxCount'],
        [event.amount, ONE_BI]
    );

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

    saveTokenStakingStats(user, event.token, event.timestamp,
        'Unstake',
        ['unstakeAmountVolume', 'unstakeTxCount'],
        [event.amount, ONE_BI]
    );

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


    saveStakingStats(sender, event.timestamp,
        'AddRewards',
        ['addRewardsBzrxAmountVolume', 'addRewardsStableCoinAmountVolume', 'addRewardsTxCount'],
        [event.bzrxAmount, event.stableCoinAmount, ONE_BI]
    );

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

    saveStakingStats(user, event.timestamp,
        'Claim',
        ['claimBzrxAmountVolume', 'claimStableCoinAmountVolume', 'claimTxCount'],
        [event.bzrxAmount, event.stableCoinAmount, ONE_BI]
    );

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

    saveStakingStats(sender, event.timestamp,
        'ConvertFees',
        ['convertFeesBzrxOutputVolume', 'convertFeesStableCoinOutputVolume', 'convertFeesTxCount'],
        [event.bzrxOutput, event.stableCoinOutput, ONE_BI]
    );

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

    saveStakingStats(sender, event.timestamp,
        'DistributeFees',
        ['distributeFeesBzrxRewardsVolume', 'distributeFeesStableCoinRewardsVolume', 'distributeFeesTxCount'],
        [event.bzrxRewards, event.stableCoinRewards, ONE_BI]
    );

    log.debug("handleCDistributeFeesFees done", []);
}
