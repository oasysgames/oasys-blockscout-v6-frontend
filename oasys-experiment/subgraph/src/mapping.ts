import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ETHDepositInitiated
} from "../generated/SaakuruBridge/L1StandardBridge"
import { BridgeDeposit, DailyBridgeStats } from "../generated/schema"

function getVerseName(contractAddress: string): string {
  if (contractAddress == "0x4FfA6d5745C2E78361ae91a36312524284F3D812") {
    return "Saakuru"
  } else if (contractAddress == "0xa34a85ecb19c88d4965EcAfB10019E63050a1098") {
    return "TCGverse"
  }
  return "Unknown"
}

function getDailyStatsId(verse: string, timestamp: BigInt): string {
  let date = new Date(timestamp.toI64() * 1000)
  let year = date.getUTCFullYear().toString()
  let month = (date.getUTCMonth() + 1).toString().padStart(2, "0")
  let day = date.getUTCDate().toString().padStart(2, "0")
  return verse + "-" + year + "-" + month + "-" + day
}

export function handleETHDepositInitiated(event: ETHDepositInitiated): void {
  let verse = getVerseName(event.address.toHexString())
  let depositId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let dailyStatsId = getDailyStatsId(verse, event.block.timestamp)

  // Create or load daily stats
  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.verse = verse
    dailyStats.date = getDailyStatsId(verse, event.block.timestamp).split("-").slice(1).join("-")
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.depositCount = 0
  }

  // Update daily stats
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.depositCount = dailyStats.depositCount + 1
  dailyStats.save()

  // Create deposit event
  let deposit = new BridgeDeposit(depositId)
  deposit.verse = verse
  deposit.from = event.params.from
  deposit.to = event.params.to
  deposit.amount = event.params.amount
  deposit.timestamp = event.block.timestamp
  deposit.blockNumber = event.block.number
  deposit.transactionHash = event.transaction.hash
  deposit.dailyStats = dailyStatsId
  deposit.save()
} 