import { BigInt } from "@graphprotocol/graph-ts"
import {
  ETHDepositInitiated as ETHDepositInitiatedEvent
} from "../generated/TCGverseBridge/TCGverseBridge"
import { BridgeDeposit, DailyBridgeStats } from "../generated/schema"

export function handleETHDepositInitiated(event: ETHDepositInitiatedEvent): void {
  // BridgeDepositエンティティの作成
  let depositId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let deposit = new BridgeDeposit(depositId)

  deposit.from = event.params.from
  deposit.to = event.params.to
  deposit.amount = event.params.amount
  deposit.timestamp = event.block.timestamp
  deposit.blockNumber = event.block.number
  deposit.transactionHash = event.transaction.hash

  deposit.save()

  // 日付の取得（UTC）
  let timestamp = event.block.timestamp.toI32()
  let date = new Date(timestamp * 1000)
  let month = (date.getUTCMonth() + 1).toString()
  let day = date.getUTCDate().toString()
  let dateString = date.getUTCFullYear().toString() + "-" +
    (month.length == 1 ? "0" + month : month) + "-" +
    (day.length == 1 ? "0" + day : day)

  // DailyBridgeStatsの更新
  let statsId = dateString
  let stats = DailyBridgeStats.load(statsId)
  if (stats == null) {
    stats = new DailyBridgeStats(statsId)
    stats.date = dateString
    stats.totalAmount = BigInt.fromI32(0)
    stats.depositCount = 0
  }

  stats.totalAmount = stats.totalAmount.plus(event.params.amount)
  stats.depositCount = stats.depositCount + 1
  stats.save()
} 