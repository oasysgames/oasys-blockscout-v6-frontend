import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ETHDepositInitiated } from "../generated/TCGverseBridge/L1StandardBridge"
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

  deposit.save()

  // Update daily stats
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400 // Convert timestamp to days
  let dayStartTimestamp = dayID * 86400
  let dailyStatsId = dayStartTimestamp.toString()

  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = new Date(dayStartTimestamp * 1000).toISOString().slice(0, 10)
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.depositCount = 0
  }

  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.depositCount = dailyStats.depositCount + 1
  dailyStats.save()
} 