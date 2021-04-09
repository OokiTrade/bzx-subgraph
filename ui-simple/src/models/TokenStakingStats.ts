import { AbstractStats } from "./AbstractStats";
import {  gql } from "@apollo/client";
import { UserStatsItem } from "./UserStatsItem";
import { computed, flow, makeAutoObservable, observable } from "mobx";
import { buildChartData } from "./mappingHelper";
import { StatsDataItem } from "./StatsDataItem";
import { TokenStakingStatsItem } from "./TokenStakingStatsItem";
import { client } from "../services/ApoloClient";


export class TokenStakingStats implements AbstractStats{
  tokenName: string
  tokenAddress: string
  user: string

  static labels: any = {
    'accumulated.stakeAmountVolume': 'Total Stak',
    'accumulated.unstakeAmountVolume': 'Total Unstak',
    'stakeAmountVolume': 'Daily Stak',
    'unstakeAmountVolume': 'Daily Unstak'
  }

    from: Date
    to: Date
    fields: any[];
    data: TokenStakingStatsItem[] = [];
   
    get chartData() {
        let res = buildChartData(this.data, this.fields, this.getLabels());
        res.title = {
          display: true,
          text: this.tokenName
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


  loadDailyStatisticPage(from: Date, to: Date, limit: number, offset: number, callback:any) {
    return client
      .query({
        query: gql`
            {tokenStakingStats
              (where :{
                date_gte: ${this.from},
                date_lte: ${this.to},
                type: D,
                token: ${this.tokenAddress?'"'+this.tokenAddress+'"':null},
                user: ${this.user?'"'+this.user+'"':null}
              }, 
                orderBy: date,
                first: ${limit},
                skip: ${offset}
                )
                
              {
                date
                stakeAmountVolume
                stakeTxCount
                unstakeAmountVolume
                stakeTxCount
                accumulated{
                  stakeAmountVolume
                  stakeTxCount
                  unstakeAmountVolume
                  stakeTxCount
                }
              }
            }
        `
      })
      .then(result=>{
        callback(result);
      });
}

    loadDailyStatistic(from: Date, to: Date) {
      let limit = 100;
      let offset = 0
      let callback = (result)=>{
        result.data.tokenStakingStats.forEach(row => {
          let root = new TokenStakingStatsItem(row);
          if(row.accumulated){
            let accumulated = new TokenStakingStatsItem(row.accumulated)
            root.accumulated = accumulated;
          }
          this.data.push(root);
        });

        if(result.data.tokenStakingStats.length === limit){
          offset = offset + limit;
          this.loadDailyStatisticPage(from, to, limit, offset, callback);
        }
        
      };

      this.loadDailyStatisticPage(from, to, 100, 0, callback);
    }
    
      getLabels():any{
        return TokenStakingStats.labels;
      }

      *fetch() {
        this.loadDailyStatistic(this.from, this.to); 
      }

}