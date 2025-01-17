# ブリッジイベントのトラッキング設計

## 概要
- L1とL2（10個）のブリッジコントラクト間のETH移動を追跡
- デポジットイベント（ETHDepositInitiated）とウィズドローイベント（ETHBridgeFinalized）の両方を記録
- 各L2ごとの統計情報を集計

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
  network: String!          # イベントが発生したネットワーク（"L1" or "L2_1" to "L2_10"）
  extraData: Bytes         # ウィズドローイベントの追加データ
}
```

### DailyBridgeStats エンティティ
```graphql
type DailyBridgeStats @entity {
  id: ID!                    # 日付_コントラクトアドレス_ネットワーク_イベントタイプ
  date: String!
  contract: Bytes!
  network: String!
  eventType: String!         # "DEPOSIT" or "WITHDRAW"
  totalAmount: BigInt!
  eventCount: BigInt!
}
```

### L2BridgeContract エンティティ
```graphql
type L2BridgeContract @entity {
  id: ID!                    # コントラクトアドレス
  network: String!           # "L2_1" to "L2_10"
  totalDeposits: BigInt!
  totalWithdraws: BigInt!
  lastEventTimestamp: BigInt!
}
```

## マッピング関数

### handleETHDepositInitiated
- デポジットイベントの処理
- BridgeEventエンティティの作成（eventType: "DEPOSIT"）
- DailyBridgeStatsの更新
- L2BridgeContractの更新

### handleETHBridgeFinalized
- ウィズドローイベントの処理
- BridgeEventエンティティの作成（eventType: "WITHDRAW"）
- extraDataの保存
- DailyBridgeStatsの更新
- L2BridgeContractの更新

## subgraph.yaml の構造
```yaml
dataSources:
  # L1ブリッジコントラクト
  - kind: ethereum/contract
    name: L1Bridge
    network: mainnet
    source:
      address: "0x..."
      abi: L1Bridge
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      entities: [BridgeEvent, DailyBridgeStats, L2BridgeContract]
      eventHandlers:
        - event: ETHDepositInitiated(indexed address,indexed address,uint256)
          handler: handleETHDepositInitiated

  # L2ブリッジコントラクト（10個）
  - kind: ethereum/contract
    name: L2Bridge1
    network: l2_1
    source:
      address: "0x..."
      abi: L2Bridge
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      entities: [BridgeEvent, DailyBridgeStats, L2BridgeContract]
      eventHandlers:
        - event: ETHBridgeFinalized(indexed address,indexed address,uint256,bytes)
          handler: handleETHBridgeFinalized

  # L2Bridge2 から L2Bridge10 まで同様に設定
```

## クエリ例
```graphql
# イベント履歴の取得
{
  bridgeEvents(
    where: {
      network: "L2_1",
      eventType: "WITHDRAW"
    }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    eventType
    from
    to
    amount
    network
    extraData
  }
}

# L2ブリッジの統計
{
  l2BridgeContracts {
    id
    network
    totalDeposits
    totalWithdraws
    lastEventTimestamp
  }
}

# 日次統計
{
  dailyBridgeStats(
    where: {
      network_in: ["L2_1", "L2_2"],
      eventType: "DEPOSIT"
    }
  ) {
    date
    network
    totalAmount
    eventCount
  }
}
```

## 実装手順
1. schema.graphqlの更新
   - 新しいエンティティの追加
   - インデックスの設定

2. subgraph.yamlの更新
   - L1ブリッジの設定
   - 10個のL2ブリッジの設定
   - 適切なネットワーク設定

3. マッピング関数の実装
   - handleETHDepositInitiatedの更新
   - handleETHBridgeFinalizedの実装
   - 統計情報の集計ロジック

4. テスト
   - 各L2ブリッジごとのテストケース
   - デポジット/ウィズドローイベントの処理確認
   - 統計情報の集計確認

## 注意事項
- 各L2ネットワークの識別子を明確に管理
- extraDataの適切なハンドリング
- 大量のイベントに対するパフォーマンス最適化
- クエリの効率化のためのインデックス設計 