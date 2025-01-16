# 単一L2ブリッジイベントの実装設計

## 概要
既存L2に対するデポジットとウィズドローイベントの追跡実装

## スキーマ設計

### BridgeEvent エンティティ
```graphql
type BridgeEvent @entity {
  id: ID!                    # イベントハッシュ_インデックス
  eventType: String!         # "DEPOSIT" or "WITHDRAW"
  from: Bytes!              
  to: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
  contract: Bytes!          # イベントが発生したコントラクトアドレス
  extraData: Bytes         # ウィズドローイベントの追加データ
}
```

### DailyBridgeStats エンティティ
```graphql
type DailyBridgeStats @entity {
  id: ID!                    # 日付_コントラクトアドレス_イベントタイプ
  date: String!
  contract: Bytes!
  eventType: String!         # "DEPOSIT" or "WITHDRAW"
  totalAmount: BigInt!
  eventCount: BigInt!
}
```

## subgraph.yaml の構造
```yaml
dataSources:
  # L1ブリッジコントラクト
  - kind: ethereum/contract
    name: L1Bridge
    network: mainnet
    source:
      address: "0x..."      # 既存のL1ブリッジアドレス
      abi: L1Bridge
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      entities: [BridgeEvent, DailyBridgeStats]
      eventHandlers:
        - event: ETHDepositInitiated(indexed address,indexed address,uint256)
          handler: handleETHDepositInitiated

  # L2ブリッジコントラクト
  - kind: ethereum/contract
    name: L2Bridge
    network: l2
    source:
      address: "0x..."      # 既存のL2ブリッジアドレス
      abi: L2Bridge
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      entities: [BridgeEvent, DailyBridgeStats]
      eventHandlers:
        - event: ETHBridgeFinalized(indexed address,indexed address,uint256,bytes)
          handler: handleETHBridgeFinalized
```

## マッピング関数の実装（src/mapping.ts）

```typescript
import { 
  ETHDepositInitiated,
  ETHBridgeFinalized
} from '../generated/Bridge/Bridge'
import { BridgeEvent, DailyBridgeStats } from '../generated/schema'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'

export function handleETHDepositInitiated(event: ETHDepositInitiated): void {
  // イベントIDの生成
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  // BridgeEventエンティティの作成
  let bridgeEvent = new BridgeEvent(id)
  bridgeEvent.eventType = "DEPOSIT"
  bridgeEvent.from = event.params.from
  bridgeEvent.to = event.params.to
  bridgeEvent.amount = event.params.amount
  bridgeEvent.timestamp = event.block.timestamp
  bridgeEvent.blockNumber = event.block.number
  bridgeEvent.transactionHash = event.transaction.hash
  bridgeEvent.contract = event.address
  bridgeEvent.save()

  // 日次統計の更新
  let dayId = event.block.timestamp.toI32() / 86400
  let dailyStatsId = dayId.toString() + "-" + event.address.toHexString() + "-DEPOSIT"
  
  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = dayId.toString()
    dailyStats.contract = event.address
    dailyStats.eventType = "DEPOSIT"
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.eventCount = BigInt.fromI32(0)
  }
  
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.eventCount = dailyStats.eventCount.plus(BigInt.fromI32(1))
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
  bridgeEvent.contract = event.address
  bridgeEvent.extraData = event.params.extraData
  bridgeEvent.save()

  // 日次統計の更新
  let dayId = event.block.timestamp.toI32() / 86400
  let dailyStatsId = dayId.toString() + "-" + event.address.toHexString() + "-WITHDRAW"
  
  let dailyStats = DailyBridgeStats.load(dailyStatsId)
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId)
    dailyStats.date = dayId.toString()
    dailyStats.contract = event.address
    dailyStats.eventType = "WITHDRAW"
    dailyStats.totalAmount = BigInt.fromI32(0)
    dailyStats.eventCount = BigInt.fromI32(0)
  }
  
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount)
  dailyStats.eventCount = dailyStats.eventCount.plus(BigInt.fromI32(1))
  dailyStats.save()
}
```

## クエリ例
```graphql
# 全イベント履歴の取得
{
  bridgeEvents(
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    eventType
    from
    to
    amount
    timestamp
    contract
    extraData
  }
}

# イベントタイプごとの日次統計
{
  dailyBridgeStats(
    where: {
      eventType: "DEPOSIT"
    }
    orderBy: date
    orderDirection: desc
  ) {
    date
    totalAmount
    eventCount
  }
}
```

## 実装手順
1. schema.graphqlの更新
   - BridgeEventエンティティの追加
   - DailyBridgeStatsエンティティの追加

2. subgraph.yamlの更新
   - L2ブリッジコントラクトの追加
   - ETHBridgeFinalizedイベントハンドラーの追加

3. マッピング関数の実装
   - handleETHDepositInitiatedの更新
   - handleETHBridgeFinalizedの実装

4. テスト
   - デポジットイベントの処理確認
   - ウィズドローイベントの処理確認
   - 日次統計の集計確認

## 注意事項
- extraDataの適切なハンドリング
- 日次統計の計算における時間帯の扱い
- イベントの重複チェック 