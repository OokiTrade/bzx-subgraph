import { BigInt, Bytes, BigDecimal } from "@graphprotocol/graph-ts";
import { TokenStat, FeesStat, LoanStat, Transaction, Loan, StakingStat, TokenStakingStat, User, UserStat } from '../types/schema'
import { ethereum, log } from "@graphprotocol/graph-ts";

export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BI = BigInt.fromString('1')
export let ZERO_BI = BigInt.fromString('0')
export let  ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let  EMPTY_STRING = "";


export let EMPTY_TOKENSTAT_FUNC = (data: TokenStat, values: BigInt[]): void =>{};
export let EMPTY_FEESSTAT_FUNC = (data: FeesStat, values: BigInt[]): void =>{};
export let EMPTY_LOANSTAT_FUNC = (data: LoanStat, values: BigInt[]): void =>{};
export let EMPTY_USERTAT_FUNC = (data: UserStat, accumulatedUserCount: BigInt): void =>{};


export function getEventId(hash: Bytes, index: BigInt): string {
  return hash.toHex() + '-' + index.toString();
}

export function saveTransaction(transaction:ethereum.Transaction, block: ethereum.Block): Transaction {
  log.info("saveTransaction: Start {}", [transaction.hash.toHex()]);
  let tx = Transaction.load(transaction.hash.toHex()) || new Transaction(transaction.hash.toHex());
  tx.blockNumber = block.number;
  tx.gasUsed = transaction.gasUsed;
  tx.gasPrice = transaction.gasPrice;
  tx.timestamp = block.timestamp.toI32();
  tx.from = transaction.from.toHex();
  tx.to = transaction.to.toHex();
  tx.save();
  log.debug("saveTransaction: Done {}", [transaction.hash.toHex()]);
  return tx as Transaction;
}

export function saveLoan(id: string, loanToken: string, collateralToken: string, user: User, lender: User): Loan {
  log.info("saveLoan: Start {} {}/{}", [id, loanToken, collateralToken]);
  let loan = Loan.load(id);
  if(loan) return loan as Loan;
  loan = new Loan(id);
  loan.loanToken = loanToken;
  loan.collateralToken = collateralToken;
  loan.user = user.id;
  loan.lender = lender.id;
  loan.save();
  log.debug("saveLoan: Done {} {}/{}", [id, loanToken, collateralToken]);
  return loan as Loan;
}
export function getLoanById(id: string): Loan {
  return Loan.load(id) as Loan;
}


export function getUser(id: string, timestamp: i32): User {
  let user = User.load(id) as User;
  if(user) return user;
 
  //Create user
  user = new User(id);  
  user.save();

  let update = (data: UserStat, accumulatedUserCount: BigInt): void =>{
    data.newUserCount = data.newUserCount.plus(ONE_BI);
    data.accumulatedUserCount = (accumulatedUserCount)?accumulatedUserCount:ZERO_BI;
  };
 
  //Add user to overall and daily statistic
  let totalStat = saveUserStats("T", user, null, null, update, EMPTY_USERTAT_FUNC);
  if(timestamp){
    saveUserStats("D", user, timestamp, totalStat?totalStat.newUserCount:null, update, EMPTY_USERTAT_FUNC);
  }

  return user;

}


export function saveTokenStats(type: string, from: User, token: string, eventTimeStamp: i32, 
  values: BigInt[], 
      func1: (data: TokenStat, values: BigInt[]) => void, 
      func2: (data: TokenStat, values: BigInt[]) => void
    ): void{

    //Supports only day statistict at the moment
    if(type != 'D') return;
    let dayStartTimestamp = eventTimeStamp / 86400;
    let id = type+''+dayStartTimestamp.toString() + '-' + token;
    if(from){
      log.info("saveTokenStats: Start saving {} account statistic", [type]);
      id = id + '-' + from.id
    }
    else{
      log.info("saveTokenStats: Start saving {} overal statistic", [type]);
    }
   
    let statsData = TokenStat.load(id.toString());

    if (statsData === null) {
      statsData = new TokenStat(id.toString())
      statsData.date = dayStartTimestamp;
      statsData.token = token;
      if(from)
        statsData.from = from.id;

      statsData.type = type;
      statsData.transferFromVolume = ZERO_BD
      statsData.transferToVolume = ZERO_BD
      statsData.approvalOwnerVolume = ZERO_BD
      statsData.approvalSpenderVolume = ZERO_BD
      statsData.mintTokenVolume = ZERO_BD
      statsData.mintAssetVolume = ZERO_BD
      statsData.burnAssetVolume = ZERO_BD
      statsData.burnTokenVolume = ZERO_BD
      statsData.flashBorrowVolume = ZERO_BD
      statsData.transferFromTxCount = ZERO_BI
      statsData.transferToTxCount = ZERO_BI
      statsData.approvalOwnerTxCount = ZERO_BI
      statsData.approvalSpenderTxCount = ZERO_BI
      statsData.mintTxCount = ZERO_BI
      statsData.burnTxCount = ZERO_BI
      statsData.flashBorrowTxCount = ZERO_BI
    }
    statsData.lastEventTimeStamp = eventTimeStamp;
    
    func1(statsData as TokenStat, values);
    if(func2)
      func2(statsData as TokenStat, values);
    statsData.save();
    log.debug("saveTokenStats: Done saving statistic", []);
};

export function saveFeesStats(type: string, from: User, token: string, eventTimeStamp: i32, 
      values: BigInt[], 
      func1: (data: FeesStat, values: BigInt[]) => void, 
      func2: (data: FeesStat, values: BigInt[]) => void
  ): void {  

    //Supports only day statistict at the moment
    if(type != 'D') return;
    let dayStartTimestamp = eventTimeStamp / 86400;
    let id = type+''+dayStartTimestamp.toString() + '-' + token
    if(from){
      log.info("saveFeesStats: Start saving {} account statistic", [type]);
      id = id + '-'+from.id;
    }
    else{
      log.info("saveFeesStats: Start saving {} overal statistic", [type]);
    }

    let statsData = FeesStat.load(id.toString());

    if (statsData === null) {
      statsData = new FeesStat(id.toString())
      statsData.date = dayStartTimestamp
      statsData.token = token;

      if(from)
        statsData.from = from.id;

      statsData.type = type;

      statsData.payLendingFeeVolume = ZERO_BD;
      statsData.payLendingFeeTxCount = ZERO_BI;
      statsData.settleFeeRewardForInterestExpenseVolume = ZERO_BD;
      statsData.settleFeeRewardForInterestExpenseTxCount = ZERO_BI;
      statsData.payTradingFeeVolume = ZERO_BD;
      statsData.payTradingFeeTxCount = ZERO_BI;
      statsData.payBorrowingFeeVolume = ZERO_BD;
      statsData.payBorrowingFeeTxCount = ZERO_BI;
      statsData.withdrawLendingFeesReceiverVolume = ZERO_BD;
      statsData.withdrawLendingFeesReceiverTxCount = ZERO_BI;

      statsData.withdrawLendingFeesSenderVolume = ZERO_BD;
      statsData.withdrawLendingFeesSenderTxCount = ZERO_BI;

      statsData.withdrawTradingFeesReceiverVolume = ZERO_BD;
      statsData.withdrawTradingFeesReceiverTxCount = ZERO_BI;

      statsData.withdrawTradingFeesSenderVolume = ZERO_BD;
      statsData.withdrawTradingFeesSenderTxCount = ZERO_BI;

      statsData.withdrawBorrowingFeesReceiverVolume = ZERO_BD;
      statsData.withdrawBorrowingFeesReceiverTxCount = ZERO_BI;

      statsData.withdrawBorrowingFeesSenderVolume = ZERO_BD;
      statsData.withdrawBorrowingFeesSenderTxCount = ZERO_BI;

      statsData.earnRewardTxCount = ZERO_BI;
      statsData.earnRewardVolume = ZERO_BD;

    }
    statsData.lastEventTimeStamp = eventTimeStamp;
    
    func1(statsData as FeesStat, values);
    if(func2) 
      func2(statsData as FeesStat, values);
    
    statsData.save();

    log.debug("saveFeesStats: Done saving statistic", []);
};


export function saveLoanStats(type: string, from: User, loanToken: string, collateralToken: string, eventTimeStamp: i32, 
      values: BigInt[], 
      func1: (data: LoanStat, values: BigInt[]) => void, 
      func2: (data: LoanStat, values: BigInt[]) => void
  ): void {  

    //Supports only day statistict at the moment
    if(type != 'D') return;
    let dayStartTimestamp = eventTimeStamp / 86400;
    let id = type+''+dayStartTimestamp.toString() + '-' + loanToken + '-' + collateralToken;
    if(from){
      log.info("saveLoanStats: Start saving {} account statistic", [type]);
      id = id + '-'+from.id;
    }
    else{
      log.info("saveLoanStats: Start saving {} overal statistic", [type]);
    }

   let statsData = LoanStat.load(id.toString());

    if (statsData === null) {
      statsData = new LoanStat(id.toString())
      statsData.date = dayStartTimestamp
      statsData.loanToken = loanToken;
      statsData.collateralToken = collateralToken;
      statsData.closeWithDepositRepayAmountUserVolume= ZERO_BD;
      statsData.closeWithDepositRepayAmountCloserVolume= ZERO_BD;
      statsData.closeWithDepositCloserTxCount= ZERO_BI;
      statsData.closeWithDepositUserTxCount= ZERO_BI;
      statsData.closeWithSwapPositionCloseSizeCloserVolume= ZERO_BD;
      statsData.closeWithSwapLoanCloseAmountCloserVolume= ZERO_BD;
      statsData.closeWithSwapPositionCloseSizeUserVolume= ZERO_BD;
      statsData.closeWithSwapLoanCloseAmountUserVolume= ZERO_BD;
      statsData.closeWithSwapUserTxCount= ZERO_BI;
      statsData.closeWithSwapCloserTxCount= ZERO_BI;

      statsData.liquidateRepayAmountLiquidatorVolume= ZERO_BD;
      statsData.liquidateRepayAmountUserVolume= ZERO_BD;
      statsData.liquidateLiquidatorTxCount= ZERO_BI;
      statsData.liquidateUserTxCount= ZERO_BI;

      statsData.rolloverCollateralAmountUsedCallerVolume= ZERO_BD;
      statsData.rolloverInterestAmountAddedCallerVolume= ZERO_BD;
      statsData.rolloverCollateralAmountUsedUserVolume= ZERO_BD;
      statsData.rolloverInterestAmountAddedUserVolume= ZERO_BD;
      statsData.rolloverCallerTxCount= ZERO_BI;
      statsData.rolloverUserTxCount= ZERO_BI;

      statsData.loanDepositVolume= ZERO_BD;
      statsData.loanDepositTxCount= ZERO_BI;
      statsData.borrowNewPrincipalVolume= ZERO_BD;
      statsData.newCollateral= ZERO_BD;
      statsData.borrowTxCount= ZERO_BI;
      statsData.tradePositionSizeVolume= ZERO_BD;
      statsData.tradeBorrowedAmountVolume= ZERO_BD;
      statsData.tradeTxCount= ZERO_BI;
      statsData.depositCollateralDepositAmountVolume= ZERO_BD;
      statsData.depositCollateralTxCount= ZERO_BI;
      statsData.withdrawCollateralWithdrawAmountVolume= ZERO_BD;
      statsData.withdrawCollateralTxCount= ZERO_BI;
      statsData.extendLoanDurationDepositAmountVolume= ZERO_BD;
      statsData.extendLoanDurationCollateralUsedAmountVolume= ZERO_BD;
      statsData.extendLoanDurationTxCount= ZERO_BI;
      statsData.reduceLoanDurationWithdrawAmountVolume= ZERO_BD;
      statsData.reduceLoanDurationTxCount= ZERO_BI;
      statsData.claimRewardAmountVolume= ZERO_BD;
      statsData.claimRewardTxCount= ZERO_BI;
      statsData.type = type;
      if(from)
        statsData.from = from.id;
    }

    statsData.lastEventTimeStamp = eventTimeStamp;

    func1(statsData as LoanStat, values);
  
    if(func2)
      func2(statsData as LoanStat, values);
  
      statsData.save();
    log.debug("saveFeesStats: Done saving statistic", []);
};

export function saveStakingStats(type: string, from: User, eventTimeStamp: i32, 
  values: BigInt[],
  func: (data: StakingStat, values: BigInt[]) => void): void {  

    //Supports only day statistict at the moment
    if(type != 'D') return;
    let dayStartTimestamp = eventTimeStamp / 86400;
    let id = type+''+dayStartTimestamp.toString();
    if(from){
      log.info("saveStakingStats: Start saving {} account statistic", [type]);
      id = id + '-' +from.id;
    }
    else{
      log.info("saveStakingStats: Start saving {} overal statistic", [type]);
    }

    let statsData = StakingStat.load(id.toString());

    if (statsData === null) {
      statsData = new StakingStat(id.toString())
      statsData.date = dayStartTimestamp;
      if(from)
        statsData.from = from.id;

      statsData.type = type;
      statsData.addRewardsBzrxAmountVolume = ZERO_BD;
      statsData.addRewardsStableCoinAmountVolume = ZERO_BD;
      statsData.addRewardsTxCount = ZERO_BI;
      statsData.claimBzrxAmountVolume = ZERO_BD;
      statsData.claimStableCoinAmountVolume = ZERO_BD;
      statsData.claimTxCount = ZERO_BI;
      statsData.convertFeesBzrxOutputVolume = ZERO_BD;
      statsData.convertFeesStableCoinOutputVolume = ZERO_BD;
      statsData.convertFeesTxCount = ZERO_BI;
      statsData.distributeFeesBzrxRewardsVolume = ZERO_BD;
      statsData.distributeFeesStableCoinRewardsVolume = ZERO_BD;
      statsData.distributeFeesTxCount = ZERO_BI;
    }
    statsData.lastEventTimeStamp = eventTimeStamp;
    func(statsData as StakingStat, values);
    statsData.save();

    log.debug("saveStakingStats: Done saving statistic", []);
};


export function saveTokenStakingStats(type: string, from: User, token: string, eventTimeStamp: i32, 
  values: BigInt[],
  func: (data: TokenStakingStat, values: BigInt[]) => void): void {  

    //Supports only day statistict at the moment
    if(type != 'D') return;
    let dayStartTimestamp = eventTimeStamp / 86400;
    let id = type+''+dayStartTimestamp.toString() + '-' + token;
    if(from){
      log.info("saveTokenStakingStats: Start saving {} account statistic", [type]);
      id = id +'-'+from.id;
    }
    else{
      log.info("saveTokenStakingStats: Start saving {} overal statistic", [type]);
    }

    let statsData = TokenStakingStat.load(id.toString());

    if (statsData === null) {
      statsData = new TokenStakingStat(id.toString())
      statsData.date = dayStartTimestamp
      statsData.token = token;
      if(from)
        statsData.from = from.id;
      statsData.type = type;

      statsData.stakeAmountVolume = ZERO_BD;
      statsData.stakeTxCount = ZERO_BI;
      statsData.unstakeAmountVolume = ZERO_BD;
      statsData.unstakeTxCount = ZERO_BI;
    }
    statsData.lastEventTimeStamp = eventTimeStamp;
    func(statsData as TokenStakingStat, values);
    statsData.save();

    log.debug("saveTokenStakingStats: Done saving statistic", []);
};

export function saveUserStats(type: string, user: User, eventTimeStamp: i32,
    accumulatedUserCount: BigInt,
    func1: (data: UserStat, accumulatedUserCount: BigInt) => void,
    func2: (data: UserStat, accumulatedUserCount: BigInt) => void,
  ): UserStat {  
    
    if(!user){
      log.warning("saveUserStats: User arggument is missing. Skip saving user stats",[]);
      return null;
    }

    log.info("saveUserStats: Start saving {} overal statistic", [type]);
    let id = type;
    let dayStartTimestamp = null;

    if(type === 'D' && eventTimeStamp != null){
      dayStartTimestamp = eventTimeStamp / 86400;
      id = id +'-'+dayStartTimestamp.toString();
    }
    else if(type === 'T'){}
    else{
      log.warning("saveUserStats: Unknown type {} or missing timestamp. Skip saving user stats",[type]);
      return null;
    }
    
    let statsData = UserStat.load(id.toString());

    if (statsData === null) {
      statsData = new UserStat(id.toString())
      if(dayStartTimestamp) statsData.date = dayStartTimestamp
      statsData.type = type;
      statsData.newUserCount = ZERO_BI;
      statsData.accumulatedUserCount = ZERO_BI;
    }
    func1(statsData as UserStat, accumulatedUserCount);
    if(func2)
      func2(statsData as UserStat, accumulatedUserCount);

    statsData.save();

    log.debug("saveUserStats: Done saving statistic", []);

    return statsData as UserStat;
};