import { AbstractStats } from "./AbstractStats";
import { gql } from "@apollo/client";
import { computed, flow, makeAutoObservable, observable } from "mobx";
import { buildChartData } from "./mappingHelper";
import { TokenStatsItem } from "./TokenStatsItem";
import { client } from "../services/ApoloClient";


export class TokenStats implements AbstractStats{
  token: string
  user: string

  static labels: any = {
    'accumulated.transferFromVolume': 'Total Transfer From',
    'transferFromVolume': 'Daily Transfer To',
    'accumulated.transferToVolume': 'Total Transfer To',
    'transferToVolume': 'Daily Transfer To',
    'accumulated.transferVolume': 'Total Transfer',
    'transferVolume': 'Daily  Transfer',
  }

    from: Date
    to: Date
    fields: any[];
    data: TokenStatsItem[] = [];
   
    get chartData() {
        let res = buildChartData(this.data, this.fields, this.getLabels());
        res.title = {
          display: true,
          text: this.token
      };
        return res;
      }


  constructor(from, to, fields, token:string, user:string) {
    this.from = from;
    this.to = to;
    this.fields = fields;
    this.token = token
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
            {tokenStats
              (where :{
                date_gte: ${this.from},
                date_lte: ${this.to},
                type: D,
                token: ${this.token?'"'+this.token+'"':null},
                user: ${this.user?'"'+this.user+'"':null}
              }, orderBy: date)
              {
                date
                transferToVolume
                transferFromVolume
                accumulated{
                  transferToVolume
                  transferFromVolume
                }
              }
            }    
            `
          })
          .then(result => {
            result.data.tokenStats.forEach(row => {
              let root = new TokenStatsItem(row);
              root['transferVolume'] = root['transferFromVolume'] + root['transferToVolume'];
              if(row.accumulated){
                let accumulated = new TokenStatsItem(row.accumulated)
                root.accumulated = accumulated;
                root.accumulated['transferVolume'] = root.accumulated['transferFromVolume'] + root.accumulated['transferToVolume'];
              }
            
              this.data.push(root);
            });
    
          });
    }
    
      getLabels():any{
        return TokenStats.labels;
      }

      *fetch() {
        this.loadDailyStatistic(this.from, this.to); 
      }

}