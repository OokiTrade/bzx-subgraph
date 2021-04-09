export abstract class StatsDataItem{
    date: Date
    unstakeAmountVolume: bigint
    stakeAmountVolume: bigint
    constructor(row: any){
      let date = new Date(row.date * 86400 * 1000);
      Object.keys(row).forEach((key)=>{
          this[key] = new Number(row[key]);
        }
      );
      this.date = date;
    }
  }