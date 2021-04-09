import { AbstractStats } from "./AbstractStats";
import { gql } from "@apollo/client";
import { UserStatsItem } from "./UserStatsItem";
import { computed, flow, makeAutoObservable, observable } from "mobx";
import { buildChartData } from "./mappingHelper";
import { client } from "../services/ApoloClient";



export class UserStats implements AbstractStats{
    from: Date
    to: Date
    fields: any[];
    data: any = [];
    loading: boolean = false;
   
    get chartData() {
        return buildChartData(this.data, this.fields, this.getLabels());
      }


  constructor(from, to, fields) {
    this.from = from;
    this.to = to;
    this.fields = fields;
    makeAutoObservable(this, {
      data: true,
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
        {
          userStats(where: {
            date_gte: ${this.from},
            date_lte: ${this.to},
            type: D}, 
            orderBy: date
            first: ${limit},
            skip: ${offset}
            ){
            date
            type
            newUserCount
            accumulated {
              newUserCount
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
        this.loading = true;
        let callback = (result)=>{
          result.data.userStats.forEach(row => {

            let root = new UserStatsItem(row);
            if(row.accumulated){
              let accumulated = new UserStatsItem(row.accumulated)
              root.accumulated = accumulated;
            }
            this.data.push(root);
          });



          if(result.data.userStats.length === limit){
            offset = offset + limit;
            this.loadDailyStatisticPage(from, to, limit, offset, callback);
          }
          else{
            this.loading = false;
          }
        }
        this.loadDailyStatisticPage(from, to, 100, 0, callback);
      
    }

    static labels: any = {
        'newUserCount': 'Daily Unique Users',
        'accumulated.newUserCount': 'Daily Unique Users (accumulated)'
      }
    
      getLabels():any{
        return UserStats.labels;
      }

      *fetch() {
        this.loadDailyStatistic(this.from, this.to); 
      }

}