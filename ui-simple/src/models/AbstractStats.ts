
export interface AbstractStats{

    chartData: any;
    
    getLabels():any;

    loadDailyStatistic(from: Date, to: Date):void;

}