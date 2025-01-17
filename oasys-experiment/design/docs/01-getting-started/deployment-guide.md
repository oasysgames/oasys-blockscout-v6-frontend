# デプロイガイド

## デプロイ手順

### 1. 環境の起動

```bash
# Dockerコンテナの起動
docker compose up -d

# 起動状態の確認
docker compose ps
```

### 2. サブグラフのデプロイ

```bash
# 依存関係のインストール（初回のみ）
cd subgraph
yarn install

# 一括デプロイ（コード生成、ビルド、作成、デプロイを実行）
yarn deploy
```

### 3. 動作確認

#### エンドポイント
- GraphQL: http://localhost:8000/subgraphs/name/oasys/bridge/graphql
- WebSocket: ws://localhost:8001/ws
- Admin: http://localhost:8020

#### ヘルスチェック項目
- [x] Graph Nodeの起動状態
- [x] IPFSの接続
- [x] PostgreSQLの接続
- [x] ブロック同期の進行
- [x] イベント処理の状態

#### データ検証クエリ

1. イベントの取得
```graphql
{
  bridgeEvents(first: 5) {
    id
    verseId
    chainName
    eventType
    amount
    timestamp
  }
}
```

2. 日次統計の確認
```graphql
{
  dailyBridgeStats(first: 5) {
    id
    date
    verseId
    chainName
    eventType
    total_amount
    count
  }
}
```

## バージョン管理

### バージョニング規則
- セマンティックバージョニング（vX.Y.Z）を採用
- X: メジャーバージョン（互換性のない変更）
- Y: マイナーバージョン（後方互換性のある機能追加）
- Z: パッチバージョン（バグ修正）

### 開発時のバージョン管理

#### 固定バージョンの使用
- 開発環境では、同じバージョン番号を継続使用可能
- ただし、以下の点に注意：
  1. 同じバージョン番号での再デプロイは同期状態がリセット
  2. ブロックの同期が最初から再開
  3. 大量のブロックがある場合、同期完了に時間がかかる

#### 推奨プラクティス
1. スキーマやマッピングの変更テスト時：
   - 同じバージョン番号を使用して素早くイテレーション
   - 同期状態のリセットを許容

2. 本番環境への移行時：
   - セマンティックバージョニングに従って新しいバージョン番号を採用
   - 同期状態を維持するため、バージョンを単調増加

## トラブルシューティング

### ブロック同期の問題
1. ログの確認
```bash
docker compose logs -f graph-node
```

2. ネットワーク接続の確認
```bash
curl -X POST https://rpc.mainnet.oasys.games \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

3. RPC エンドポイントの状態確認

### イベント処理の問題
1. コントラクトアドレスの確認
2. ABIの検証
3. マッピング関数のデバッグ 