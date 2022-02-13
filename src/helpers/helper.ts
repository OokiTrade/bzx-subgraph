import { BigInt, Bytes, ValueKind, Entity, Value, ByteArray, crypto } from "@graphprotocol/graph-ts";
import { Transaction, Loan, User, UserStat } from '../types/schema'
import { ethereum, log } from "@graphprotocol/graph-ts";
import { EMPTY_STRING, ONE_BI, ZERO_BI } from "./constants";

export function isString(obj): boolean {
  return (Object.prototype.toString.call(obj) === '[object String]');
}


// export function initFromEthereumEvent (src: ethereum.Event, dst: AbstractEvent):void{
//   let tx = saveTransaction(src.transaction, src.block);
//   let timestamp = src.block.timestamp.toI32();
//   dst.timestamp = timestamp;
//   dst.transaction = tx.id;
//   dst.address = src.address.toHex();
// }


export function addValues(stats: Entity, keys: string[], values: BigInt[]): void {
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    let value = stats.get(key)!;
    if(values[i].toString()==='0') {
      log.debug("Skip adding 0 value", [])
      continue;
    }
    log.debug("Add value {} = {}", [key, values[i].toString()])
    const kind = value.kind;
    if(kind){
      if (kind === ValueKind.BIGDECIMAL) {
        stats.setBigDecimal(key, values[i].toBigDecimal().plus(value.toBigDecimal()));
      }
    else if (value.kind === ValueKind.BIGINT) {
      stats.setBigInt(key, values[i].plus(value.toBigInt()));
    }
      else if (kind === ValueKind.INT) {
        stats.setI32(key, values[i].plus(value.toBigInt()).toI32());
      }
      else if (kind === ValueKind.STRING) {
        stats.setString(key, values[i].toString());
      }
    }
  }
}



export function getEventId(hash: Bytes, index: BigInt): string {
  return hash.toHex() + '-' + index.toString();
}

export function saveTransaction(transaction: ethereum.Transaction, block: ethereum.Block): Transaction {
  log.info("saveTransaction: Start {}", [transaction.hash.toHex()]);
  let tx = Transaction.load(transaction.hash.toHex());
  if(!tx){
    tx = new Transaction(transaction.hash.toHex());
  }
  tx.blockNumber = block.number;
  tx.gasUsed = block.gasUsed;
  tx.gasPrice = transaction.gasPrice;
  tx.timestamp = block.timestamp.toI32();
  if(transaction.from){
    tx.from = transaction.from.toHex();
  }
  const to = transaction.to;
  if(to)
    tx.to = to.toHex();
  
  tx.save();
  log.debug("saveTransaction: Done {}", [transaction.hash.toHex()]);
  return tx as Transaction;
}

export function saveLoan(id: string, loanToken: string, collateralToken: string): Loan {
  log.info("saveLoan: Start {} {}/{}", [id, loanToken, collateralToken]);
  let loan = Loan.load(id);
  if (loan) return loan as Loan;
  loan = new Loan(id);
  loan.loanToken = loanToken;
  loan.collateralToken = collateralToken;
  loan.save();
  log.debug("saveLoan: Done {} {}/{}", [id, loanToken, collateralToken]);
  return loan as Loan;
}
export function getLoanById(id: string): Loan {
  return Loan.load(id) as Loan;
}


export function getUser(id: string, timestamp: i32): User {
  let user = User.load(id) as User|null;
  if (user) return user;

  //Create user
  user = new User(id);
  user.save();

  saveUserStats(timestamp,
    ['newUserCount'],
    [ONE_BI]
  );
  return user;

}

function getUserStatId(type: string, timeStamp: i32): string {
  return timeStamp.toString()+'#'+type;

}

function getNewUserStat(type: string, dayStartTimestamp: i32): UserStat {
  let id = getUserStatId(type, dayStartTimestamp);
  let statsData = new UserStat(id)

  if (dayStartTimestamp) statsData.date = dayStartTimestamp
  statsData.type = type;
  statsData.newUserCount = ZERO_BI;

  return statsData as UserStat;
}
function getStatById(type: string, eventTimeStamp: i32): UserStat {
  let dayStartTimestamp = eventTimeStamp / 86400;

  let id = getUserStatId(type, dayStartTimestamp);
  let statsData = UserStat.load(id.toString()) || getNewUserStat(type, dayStartTimestamp);
  return statsData as UserStat;
}

export function saveUserStats(eventTimeStamp: i32,
  keys: string[],
  values: BigInt[]
): void {
  log.debug("UserStat: Start saving statistic", []);
  let total = getStatById("T", 0);
  let accumulated = getStatById("A", eventTimeStamp);
  let daily = getStatById("D", eventTimeStamp);

  addValues(total, keys, values);
  addValues(daily, keys, values);
  total.save();
  accumulated.date = daily.date;
  accumulated.newUserCount = total.newUserCount;
  accumulated.save();  

    daily.accumulated = accumulated.id;
    daily.save();
  log.debug("UserStat: Done saving statistic", []);
};