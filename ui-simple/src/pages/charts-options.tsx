export const timeBasedOptions = {
    chart: {
      height: 430
    },
    scales: {
      yAxes: [
        {
          stacked: true,
          ticks: {
            beginAtZero: true,
          },
        },
      ],
      xAxes: [
        {
        
          maximum: 365,
   
          stacked: true,
          type: 'time',
              time: {
                  unit: 'day'
              }
        },
      ],
    },
  };

  export const stakingChartoptions = {
    chart: {
      height: 430
    }
  }