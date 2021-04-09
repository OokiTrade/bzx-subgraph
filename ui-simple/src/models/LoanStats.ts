import { AbstractStats } from "./AbstractStats";
import {  gql } from "@apollo/client";
import { LoanStatsItem } from "./LoanStatsItem";
import { computed, flow, makeAutoObservable, observable } from "mobx";
import { buildChartData } from "./mappingHelper";
import { client } from "../services/ApoloClient";


export class LoanStats implements AbstractStats{
  token: string
  collateralToken: string
  user: string

  static labels: any = {
    'accumulated.tradeBorrowedAmountVolume': 'Total Trade Borrowed Amount Volume',
    'accumulated.borrowNewPrincipalVolume': 'Total Borrow New Principal Volume',
    'accumulated.newCollateral': 'Total New Collateral Volume',
    'accumulated.tradePositionSizeVolume': 'Total TradePosition Size Volume',
    'tradeBorrowedAmountVolume': 'Daily Trade Borrowed Amount Volume',
    'borrowNewPrincipalVolume': 'Daily Borrow New Principal Volume',
    'newCollateral': 'Daily New Collateral Volume',
    'tradePositionSizeVolume': 'Daily TradePosition Size Volume',
  }

    from: Date
    to: Date
    fields: any[];
    data: LoanStatsItem[] = [];
   
    get chartData() {
        let res = buildChartData(this.data, this.fields, this.getLabels());
        
        return res;
      }


  constructor(from, to, fields:any, loanToken:string, collateralToken: string, user:string) {
    this.from = from;
    this.to = to;
    this.fields = fields;
    this.token = loanToken
    this.collateralToken = collateralToken
    
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
            {
              loanStats
              (where :{
                date_gte: ${this.from},
                date_lte: ${this.to},
                type: D,
                loanToken: ${this.token?'"'+this.token+'"':null},
                collateralToken: ${this.collateralToken?'"'+this.collateralToken+'"':null},
                user: ${this.user?'"'+this.user+'"':null}
              }, orderBy: date)
              {
                date
                tradeBorrowedAmountVolume
                borrowNewPrincipalVolume
                newCollateral
                tradePositionSizeVolume
                loanToken
                collateralToken
                accumulated{
                  tradeBorrowedAmountVolume
                  borrowNewPrincipalVolume
                  newCollateral
                  tradePositionSizeVolume
                }
              }
            }    
            `
          })
          .then(result => {
            result.data.loanStats.forEach(row => {
              let root = new LoanStatsItem(row);
             if(row.accumulated){
                let accumulated = new LoanStatsItem(row.accumulated)
                root.accumulated = accumulated;
              }
              let accumulated = new LoanStatsItem(row.accumulated)
              root.accumulated = accumulated;
              this.data.push(root);
            });
    
          });
    }
    
      getLabels():any{
        return LoanStats.labels;
      }

      *fetch() {
        this.loadDailyStatistic(this.from, this.to); 
      }

}