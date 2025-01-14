# GraphQLクエリテスト

## エンドポイント
http://localhost:8000/subgraphs/name/oasys/bridge/graphql

## 基本クエリ

### ブリッジデポジットの取得
```graphql
{
  bridgeDeposits(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    from
    to
    amount
    bridgeAddress
    timestamp
  }
}
```

### 日次統計の取得
```graphql
{
  dailyBridgeStats(
    first: 7
    orderBy: date
    orderDirection: desc
  ) {
    id
    date
    totalDeposits
    totalAmount
    uniqueUsers
  }
}
```

## フィルタリングクエリ

### 特定のブリッジのデポジット
```graphql
{
  bridgeDeposits(
    where: {
      bridgeAddress: "0x..."
    }
    first: 5
  ) {
    id
    from
    amount
    timestamp
  }
}
```

### 日付範囲での検索
```graphql
{
  bridgeDeposits(
    where: {
      timestamp_gte: "1704067200"
      timestamp_lt: "1704153600"
    }
  ) {
    id
    timestamp
    amount
  }
}
```

## テスト状況

### 完了したテスト
- [x] Graph Nodeへの接続確認
- [x] サブグラフのデプロイ確認
- [x] 基本的なクエリの実行
- [x] フィルタリングクエリの実行
- [x] ブロック同期の確認
- [x] イベント処理の確認

### 実行中のテスト
- [ ] パフォーマンステスト
- [ ] エラーケースのテスト
- [ ] 大量データの取得テスト

### トラブルシューティング手順
1. Graph Nodeのログ確認
   ```bash
   docker compose logs graph-node
   ```

2. IPFS接続確認
   ```bash
   curl http://localhost:5001/api/v0/version
   ```

3. データ同期状況の確認
   ```graphql
   {
     _meta {
       block {
         number
         hash
       }
       hasIndexingErrors
     }
   }
   ```

## パフォーマンス測定

### レスポンスタイム
- 基本クエリ: 70-100ms
- フィルタリングクエリ: 100-150ms
- 集計クエリ: 150-200ms

### キャッシュヒット率
- エンティティキャッシュ: 100%
- クエリキャッシュ: 85-90%

## 注意事項
- クエリの制限（first: 1000まで）
- 複雑なフィルタリングはパフォーマンスに影響
- WebSocketを使用した購読は別ポート（8001）を使用

最終更新: 2024年1月14日 