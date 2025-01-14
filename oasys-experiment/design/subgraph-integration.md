# Oasys Experiment Subgraph 統合設計

## 概要
Oasys ExperimentのブリッジトランザクションデータをThe Graph プロトコルを使用して取得・表示するための設計文書です。

## データモデル

### BridgeDeposit
ブリッジのデポジットトランザクションを記録するエンティティ

```graphql
type BridgeDeposit @entity {
  id: ID!                  # トランザクションハッシュ-ログインデックス
  from: Bytes!            # 送信元アドレス
  to: Bytes!              # 送信先アドレス
  amount: BigInt!         # 送金額
  timestamp: BigInt!      # タイムスタンプ
  blockNumber: BigInt!    # ブロック番号
  transactionHash: Bytes! # トランザクションハッシュ
}
```

### DailyBridgeStats
日次のブリッジ統計情報を記録するエンティティ

```graphql
type DailyBridgeStats @entity {
  id: ID!                # 日付のタイムスタンプ
  date: String!         # YYYY-MM-DD形式の日付
  totalAmount: BigInt!  # その日の総送金額
  depositCount: Int!    # その日のデポジット数
}
```

## イベントハンドリング

- `ETHDepositInitiated`イベントをリッスンし、デポジット情報を記録
- 日次統計情報の自動集計と更新

## フロントエンド統合要件

1. GraphQL エンドポイントの設定
   - 環境変数での管理
   - 適切なエラーハンドリング

2. 必要なクエリの実装
   - デポジット履歴の取得
   - 日次統計情報の取得
   - ページネーション対応

3. UI コンポーネント
   - デポジット履歴テーブル
   - 統計情報ダッシュボード
   - ローディング状態の表示

## 次のステップ

1. GraphQL クライアントの設定
2. 必要なクエリの実装
3. UI コンポーネントの作成
4. エラーハンドリングの実装
5. テストの作成 