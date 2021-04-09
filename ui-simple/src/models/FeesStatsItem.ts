import { StatsDataItem } from "./StatsDataItem";

export class FeesStatsItem extends StatsDataItem{
    accumulated:FeesStatsItem
    total: bigint
    payLendingFeeVolume:bigint
    settleFeeRewardForInterestExpenseVolume:bigint
    payTradingFeeVolume:bigint
    payBorrowingFeeVolume:bigint
    earnRewardVolume:bigint
    withdrawLendingFeesSenderVolume:bigint
    withdrawTradingFeesSenderVolume:bigint
    withdrawBorrowingFeesSenderVolume:bigint


     getSum = () => {
      return this.payLendingFeeVolume 
              + this.settleFeeRewardForInterestExpenseVolume
               + this.payTradingFeeVolume 
              + this.payBorrowingFeeVolume + this.earnRewardVolume + this.withdrawLendingFeesSenderVolume
              + this.withdrawTradingFeesSenderVolume + this.withdrawBorrowingFeesSenderVolume
    }
  }