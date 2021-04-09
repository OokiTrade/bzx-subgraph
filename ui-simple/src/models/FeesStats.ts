import { AbstractStats } from "./AbstractStats";
import {  gql } from "@apollo/client";
import { UserStatsItem } from "./UserStatsItem";
import { computed, flow, makeAutoObservable, observable } from "mobx";
import { buildChartData } from "./mappingHelper";
import { TokenStakingStatsItem } from "./TokenStakingStatsItem";
import { FeesStatsItem } from "./FeesStatsItem";
import { client } from "../services/ApoloClient";
import { getPrices } from "../services/KyberService";

export class FeesStats implements AbstractStats{
  static labels: any = {
    'total':'Total Fees',
    'payLendingFeeVolume':'Landing Fee',
    'settleFeeRewardForInterestExpenseVolume': 'Settle Fee Reward For Interest',
    'payTradingFeeVolume': 'Trading Fee',
    'payBorrowingFeeVolume': 'Borrow Fee',
    'earnRewardVolume': 'Earn Reward',
    'withdrawLendingFeesSenderVolume': 'Withdraw Lending Fee',
    'withdrawTradingFeesSenderVolume': "Withdraw Trading Fee",
    'withdrawBorrowingFeesSenderVolume': "Withdraw Borrowing Fee",

    "accumulated.total": 'Total Fees (accumulated)',
    'accumulated.payLendingFeeVolume':'Landing Fee (accumulated)',
    'accumulated.settleFeeRewardForInterestExpenseVolume': 'Settle Fee Reward For Interest (accumulated)',
    'accumulated.payTradingFeeVolume': 'Trading Fee (accumulated)',
    'accumulated.payBorrowingFeeVolume': 'Borrow Fee (accumulated)',
    'accumulated.earnRewardVolume': 'Earn Reward (accumulated)',
    'accumulated.withdrawLendingFeesSenderVolume': 'Withdraw Lending Fee (accumulated)',
    'accumulated.withdrawTradingFeesSenderVolume': "Withdraw Trading Fee (accumulated)",
    'accumulated.withdrawBorrowingFeesSenderVolume': "Withdraw Borrowing Fee (accumulated)"

    
  }

  tokenName: string
  tokenAddress: string
  user: string

  

    from: Date
    to: Date
    fields: any[];
    data: TokenStakingStatsItem[] = [];
   
    get chartData() {
        let res = buildChartData(this.data, this.fields, this.getLabels());
        res.title = {
          display: true,
          text: this.tokenAddress
      };
        return res;
      }


  constructor(from, to, fields, tokenName:string, tokenAddress:string, user:string) {
    this.from = from;
    this.to = to;
    this.fields = fields;
    this.tokenAddress = tokenAddress
    this.tokenName = tokenName
    this.user = user;

    makeAutoObservable(this, {
      data: observable,
      from: observable,
      to: observable,
      fetch: flow,
      chartData: computed
    });

    this.fetch();
  }


    loadDailyStatistic(from: Date, to: Date) {
        client  
          .query({
            query: gql`
            {feesStats
              (where :{
                date_gte: ${this.from},
                date_lte: ${this.to},
                type: D,
                token: ${this.tokenAddress?'"'+this.tokenAddress+'"':null},
                user: ${this.user?'"'+this.user+'"':null}
              }, orderBy: date)
              {
                date
                token
                user
                payLendingFeeVolume
                settleFeeRewardForInterestExpenseVolume
                payTradingFeeVolume
                payBorrowingFeeVolume
                earnRewardVolume
                withdrawLendingFeesSenderVolume
                withdrawTradingFeesSenderVolume
                withdrawBorrowingFeesSenderVolume
                accumulated{
                  payLendingFeeVolume
                  settleFeeRewardForInterestExpenseVolume
                  payTradingFeeVolume
                  payBorrowingFeeVolume
                  earnRewardVolume
                  withdrawLendingFeesSenderVolume
                  withdrawTradingFeesSenderVolume
                  withdrawBorrowingFeesSenderVolume
                }
              }
            }    
            `
          })
          .then(result => {
            result.data.feesStats.forEach(row => {
              let root = new FeesStatsItem(row);
              root.total = root.getSum();

              if(row.accumulated){
                let accumulated = new FeesStatsItem(row.accumulated)
                root.accumulated = accumulated;
                root.accumulated.total = root.accumulated.getSum();
              }
              this.data.push(root);
            });
          });
    }

      getLabels():any{
        return FeesStats.labels;
      }

      *fetch() {
        this.loadDailyStatistic(this.from, this.to); 
      }

}