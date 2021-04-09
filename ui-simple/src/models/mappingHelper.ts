
export function buildChartData(data:any[], fields:any[], labels:any):any {
    const x = [];
    const y = {};
    const z = {};
    data.forEach(row => {
      Object.keys(row).forEach((key)=>{
            if(!y[key]) y[key] = [];
            y[key].push(row[key]);
            if(row.accumulated){
              if(!z[key]) z[key] = [];
              z[key].push(row.accumulated[key]);
            }
        }
      );
      if(row.name){
        x.push(row.name);
      }
      else{
        x.push(row.date.toLocaleDateString());
      }
    });
    
    const res = {
      labels: x,
      datasets: []
    }

    fields.forEach(field => {
      let dataY = (field.accumulated)?z[field.name]:y[field.name];
      let lablel = (field.accumulated)?labels['accumulated.'+field.name]:labels[field.name];
      res.datasets.push(
          {
            label:lablel,
            data: dataY,
            fill: false,
            backgroundColor: field.color,
          
          }
      );
    });
    return res;
}
