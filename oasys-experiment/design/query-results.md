# GraphQLクエリ実行結果

## ブリッジデポジットの取得

### クエリ
```graphql
query {
  bridgeDeposits(
    first: 10,
    orderBy: timestamp,
    orderDirection: desc
  ) {
    id
    from
    to
    amount
    timestamp
    blockNumber
    transactionHash
  }
}
```

### エンドポイント
http://localhost:8000/subgraphs/name/oasys/bridge

### 実行コマンド
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "query": "query { bridgeDeposits(first: 10, orderBy: timestamp, orderDirection: desc) { id from to amount timestamp blockNumber transactionHash } }"
  }' \
  http://localhost:8000/subgraphs/name/oasys/bridge
```

### 実行結果（2024年1月14日）
```json
{
  "data": {
    "bridgeDeposits": []
  }
}
```

### 現在の設定
```yaml
source:
  abi: L1StandardBridge
  address: "0x4FfA6d5745C2E78361ae91a36312524284F3D812"
  startBlock: 0
```

### 確認項目
- [ ] データが正常に取得できること
- [ ] タイムスタンプの降順でソートされていること
- [ ] 必要なフィールドがすべて含まれていること

### 調査事項
1. イベントの同期状態の確認
2. コントラクトアドレスの検証
3. `startBlock`の適切な値の設定

### 注意事項
- 取得データは最新の10件
- `amount`の値はWei単位
- `timestamp`はUNIX時間

最終更新: 2024年1月14日 