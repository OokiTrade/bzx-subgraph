import * as React from "react";
import { Link } from "react-router-dom";
import { LoanStats } from "../../models/LoanStats";
import { TokenStakingStats } from "../../models/TokenStakingStats";
import { UserStats } from "../../models/UserStats";
import { FeesStats } from "../../models/FeesStats";
import { timeBasedOptions } from "../charts-options";
import { Bar } from "@reactchartjs/react-chart.js";
import { observer } from "mobx-react";

let now = new Date();
let to = Math.ceil(now.getTime() / (86400 * 1000));
now.setDate(now.getDate() - 100)
let from = Math.ceil(now.getTime() / (86400 * 1000));

const userStats = new UserStats(from, to, [
  { name: "newUserCount", accumulated: true, color: 'rgb(127, 111, 249)' }
]
);



const loanStats =
{
  "0x6b175474e89094c44da98b954eedeac495271d0f": new LoanStats(from, to, [
    { name: "tradeBorrowedAmountVolume", accumulated: true, color: 'rgb(175, 249, 111)' },
    { name: "borrowNewPrincipalVolume", accumulated: true, color: 'rgb(127, 111, 249)' },
    { name: "newCollateral", accumulated: true, color: 'rgb(249, 175, 111)' },
    { name: "tradePositionSizeVolume", accumulated: true, color: 'rgb(111, 127, 249)' }
  ],
    '0x6b175474e89094c44da98b954eedeac495271d0f', '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', null),
};

const tokenStakingStats =
{
  "0x56d811088235f11c8920698a204a5010a788f4b3": new TokenStakingStats(from, to, [
    { name: "stakeAmountVolume", accumulated: true, color: 'rgb(175, 249, 111)' },
    { name: "unstakeAmountVolume", accumulated: true, color: 'rgb(127, 111, 249)' }
  ],

    'BZRX', '0x56d811088235f11c8920698a204a5010a788f4b3', null),

  "0xe26a220a341eaca116bda64cf9d5638a935ae629": new TokenStakingStats(from, to, [
    { name: "stakeAmountVolume", accumulated: true, color: 'rgb(175, 249, 111)' },
    { name: "unstakeAmountVolume", accumulated: true, color: 'rgb(127, 111, 249)' }
  ],
    'LPT', '0xe26a220a341eaca116bda64cf9d5638a935ae629', null),

  "0xb72b31907c1c95f3650b64b2469e08edacee5e8f": new TokenStakingStats(from, to, [
    { name: "stakeAmountVolume", accumulated: true, color: 'rgb(175, 249, 111)' },
    { name: "unstakeAmountVolume", accumulated: true, color: 'rgb(127, 111, 249)' }
  ],
    'vBZRX', '0xb72b31907c1c95f3650b64b2469e08edacee5e8f', null),

};

const StatsChart = observer(({ stats, type }) => (
  <div>
    <Bar height={100} type='bar' data={stats.chartData} options={timeBasedOptions} />:
  </div>
));

export const Charts = () =>
  <div>
    <h2>Chart examples</h2>
    <br />
    <div>
      <h2></h2>
      {userStats.loading}
      <StatsChart stats={userStats} type='bar' />


      {
        Object.keys(loanStats).map(key => {
          return <div key={key}>
            <h2>Daily Loan Stats {key}</h2>
            <StatsChart stats={loanStats[key]} type='bar' />
          </div>
        })
      }
      {
        Object.keys(tokenStakingStats).map(key => {
          return <div key={key}>
            <h2>Daily Staking Stats {key}</h2>
            <StatsChart stats={tokenStakingStats[key]} type='bar' />
          </div>
        })
      }
    </div>

  </div>
