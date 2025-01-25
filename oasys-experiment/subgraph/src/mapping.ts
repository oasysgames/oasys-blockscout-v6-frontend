import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  ETHDepositInitiated,
  ETHWithdrawalFinalized
} from "../generated/L1StandardBridge/L1StandardBridge"
import { TransactionDeposited } from "../generated/Portal/Portal"
import { BridgeTransaction } from "../generated/schema"

export function handleETHDeposit(event: ETHDepositInitiated): void {
  let entity = new BridgeTransaction(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.amount = event.params.amount
  entity.data = event.params.data
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.type = "deposit"
  entity.save()
}

export function handleETHWithdrawal(event: ETHWithdrawalFinalized): void {
  let entity = new BridgeTransaction(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.amount = event.params.amount
  entity.data = event.params.data
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.type = "withdrawal"
  entity.save()
}

export function handleTransactionDeposited(event: TransactionDeposited): void {
  let entity = new BridgeTransaction(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.amount = event.params.value
  entity.data = event.params.data
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.type = "deposit"
  entity.save()
} 