import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ETHDepositInitiated } from "../generated/TCGverseBridgeV0/L1StandardBridge"
import { TransactionDeposited } from "../generated/SaakuruBridgeV1/OptimismPortal"
import { BridgeDeposit, DailyBridgeStats } from "../generated/schema"

export function handleETHDepositInitiated(event: ETHDepositInitiated): void {
  // Create unique ID for the deposit
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let deposit = new BridgeDeposit(id)

  deposit.from = event.params.from
  deposit.to = event.params.to
  deposit.amount = event.params.amount
  deposit.timestamp = event.block.timestamp
  deposit.blockNumber = event.block.number
  deposit.transactionHash = event.transaction.hash
  deposit.version = "V0"

  deposit.save()

  updateDailyStats(event.block.timestamp, event.params.amount)
}

export function handleTransactionDeposited(event: TransactionDeposited): void {
  // Create unique ID for the deposit
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let deposit = new BridgeDeposit(id)

  deposit.from = event.params.from
  deposit.to = event.params.to
  deposit.amount = event.params.value
  deposit.timestamp = event.block.timestamp
  deposit.blockNumber = event.block.number
  deposit.transactionHash = event.transaction.hash
  deposit.version = "V1"

  deposit.save()

  updateDailyStats(event.block.timestamp, event.params.value)
}

function updateDailyStats(timestamp: BigInt, amount: BigInt): void {
  let dayID = timestamp.toI32() / 86400
  let dayStartTimestamp = dayID * 86400
  let dailyStatsId = dayStartTimestamp.toString()

  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = new Date(dayStartTimestamp * 1000).toISOString().slice(0, 10)
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.depositCount = 0
  }

  dailyStats.totalAmount = dailyStats.totalAmount.plus(amount)
  dailyStats.depositCount = dailyStats.depositCount + 1
  dailyStats.save()
} 