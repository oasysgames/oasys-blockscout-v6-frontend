# 複数ブリッジコントラクトのトラッキング設計

## 概要
複数のブリッジコントラクト（TCGverseBridgeとL2Bridge）からのデポジットを追跡するための設計変更について記載します。

## スキーマ設計の変更

### BridgeDeposit エンティティ
```graphql
type BridgeDeposit @entity {
  id: ID!
  from: Bytes!
  to: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
  contract: Bytes!    # 追加: デポジットが発生したコントラクトアドレス
  network: String!    # 追加: デポジット元のネットワーク（"L1" or "L2"）
}
```

### DailyBridgeStats エンティティ
```graphql
type DailyBridgeStats @entity {
  id: ID!              # 日付_コントラクトアドレス_ネットワーク
  date: String!
  contract: Bytes!     # 追加: 集計対象のコントラクトアドレス
  network: String!     # 追加: 集計対象のネットワーク
  totalAmount: BigInt!
  depositCount: BigInt!
}
```

## マッピング関数の変更

### handleETHDepositInitiated
- コントラクトアドレスとネットワーク情報（"L1"）を保存
- DailyBridgeStatsの集計時にコントラクトとネットワークで分類

### handleL2ETHDepositInitiated（新規追加）
- L2ブリッジからのデポジットイベントを処理
- コントラクトアドレスとネットワーク情報（"L2"）を保存
- DailyBridgeStatsの集計時にコントラクトとネットワークで分類

## クエリの拡張
```graphql
# デポジット履歴の取得（コントラクト/ネットワークでフィルタリング可能）
{
  bridgeDeposits(
    where: {
      contract: "0x...",
      network: "L1"
    }
  ) {
    id
    from
    to
    amount
    contract
    network
  }
}

# 日次統計の取得（コントラクト/ネットワークでフィルタリング可能）
{
  dailyBridgeStats(
    where: {
      contract: "0x...",
      network: "L2"
    }
  ) {
    date
    totalAmount
    depositCount
    contract
    network
  }
}
```

## 実装手順
1. schema.graphqlの更新
2. subgraph.yamlにL2ブリッジのデータソースを追加
3. マッピング関数の実装/更新
4. テストケースの追加
5. デプロイメントとテスト

## 注意事項
- 既存のデータとの互換性を維持するため、マイグレーション計画が必要
- コントラクトアドレスとネットワーク情報の正確な記録が重要
- クエリのパフォーマンスを考慮したインデックス設計 