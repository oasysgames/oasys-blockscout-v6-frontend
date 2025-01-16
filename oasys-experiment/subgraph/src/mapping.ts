import {
  ETHDepositInitiated,
  ETHBridgeFinalized,
  ETHWithdrawalFinalized
} from "../generated/TCGverseBridge/TCGverseBridge"
import { BridgeEvent, DailyBridgeStats } from "../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"

function getDayId(timestamp: BigInt): string {
  let date = new Date(timestamp.toI64() * 1000)
  let year = date.getUTCFullYear()
  let month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  let day = date.getUTCDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function handleETHDepositInitiated(event: ETHDepositInitiated): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  let bridgeEvent = new BridgeEvent(id)
  bridgeEvent.eventType = "DEPOSIT"
  bridgeEvent.from = event.params.from
  bridgeEvent.to = event.params.to
  bridgeEvent.amount = event.params.amount
  bridgeEvent.timestamp = event.block.timestamp
  bridgeEvent.blockNumber = event.block.number
  bridgeEvent.transactionHash = event.transaction.hash
  bridgeEvent.extraData = event.params.extraData
  bridgeEvent.save()

  // 日次統計の更新
  let dayId = getDayId(event.block.timestamp)
  let dailyStatsId = dayId + "-DEPOSIT"
  
  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = dayId
    dailyStats.eventType = "DEPOSIT"
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.eventCount = 0
  }
  
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.eventCount = dailyStats.eventCount + 1
  dailyStats.save()
}

export function handleETHBridgeFinalized(event: ETHBridgeFinalized): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  let bridgeEvent = new BridgeEvent(id)
  bridgeEvent.eventType = "WITHDRAW"
  bridgeEvent.from = event.params.from
  bridgeEvent.to = event.params.to
  bridgeEvent.amount = event.params.amount
  bridgeEvent.timestamp = event.block.timestamp
  bridgeEvent.blockNumber = event.block.number
  bridgeEvent.transactionHash = event.transaction.hash
  bridgeEvent.extraData = event.params.extraData
  bridgeEvent.save()

  // 日次統計の更新
  let dayId = getDayId(event.block.timestamp)
  let dailyStatsId = dayId + "-WITHDRAW"
  
  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = dayId
    dailyStats.eventType = "WITHDRAW"
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.eventCount = 0
  }
  
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.eventCount = dailyStats.eventCount + 1
  dailyStats.save()
}

export function handleETHWithdrawalFinalized(event: ETHWithdrawalFinalized): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  let bridgeEvent = new BridgeEvent(id)
  bridgeEvent.eventType = "WITHDRAW"
  bridgeEvent.from = event.params.from
  bridgeEvent.to = event.params.to
  bridgeEvent.amount = event.params.amount
  bridgeEvent.timestamp = event.block.timestamp
  bridgeEvent.blockNumber = event.block.number
  bridgeEvent.transactionHash = event.transaction.hash
  bridgeEvent.extraData = event.params.extraData
  bridgeEvent.save()

  // 日次統計の更新
  let dayId = getDayId(event.block.timestamp)
  let dailyStatsId = dayId + "-WITHDRAW"
  
  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = dayId
    dailyStats.eventType = "WITHDRAW"
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.eventCount = 0
  }
  
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.eventCount = dailyStats.eventCount + 1
  dailyStats.save()
}