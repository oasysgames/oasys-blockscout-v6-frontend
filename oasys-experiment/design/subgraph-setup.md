# サブグラフセットアップ

## 環境構築

### 前提条件
- Docker と Docker Compose
- Node.js と Yarn
- @graphprotocol/graph-cli

### Docker Compose設定
```yaml
services:
  graph-node:
    image: graphprotocol/graph-node:v0.33.0
    platform: linux/amd64  # M1/M2 Mac対応
    ports:
      - '8000:8000'
      - '8001:8001'
      - '8020:8020'
      - '8030:8030'
      - '8040:8040'
    environment:
      postgres_host: postgres
      postgres_user: graph-node
      postgres_pass: let-me-in
      postgres_db: graph-node
      ipfs: 'ipfs:5001'
      ethereum: 'mainnet:https://rpc.mainnet.oasys.games'
      RUST_LOG: info

  ipfs:
    image: ipfs/go-ipfs:v0.10.0
    platform: linux/amd64  # M1/M2 Mac対応
    ports:
      - '5001:5001'

  postgres:
    image: postgres
    ports:
      - '25432:5432'
    environment:
      POSTGRES_USER: graph-node
      POSTGRES_PASSWORD: let-me-in
      POSTGRES_DB: graph-node
```

## デプロイ手順

### 1. 環境起動
```bash
# コンテナ起動
docker compose up -d

# 起動確認
docker compose ps
```

### 2. サブグラフ作成
```bash
# サブグラフ作成
graph create --node http://localhost:8020/ oasys/bridge

# デプロイ
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 oasys/bridge
```

### 3. 動作確認
- GraphQL: http://localhost:8000/subgraphs/name/oasys/bridge/graphql
- Admin: http://localhost:8020
- IPFS: http://localhost:5001

## プラットフォーム対応

### M1/M2 Mac (arm64)
1. プラットフォーム指定
   ```yaml
   platform: linux/amd64
   ```
2. Rosetta 2による互換性確保
3. パフォーマンス影響の最小化

### リソース管理
1. メモリ制限の設定
2. OOMKiller対策
3. スワップ領域の確保

## トラブルシューティング

### 起動時の問題
1. コンテナの状態確認
   ```bash
   docker compose ps
   ```
2. ログの確認
   ```bash
   docker compose logs graph-node
   ```
3. ネットワーク接続確認
   ```bash
   curl http://localhost:5001/api/v0/version
   ```

### デプロイ時の問題
1. IPFS接続エラー
   - IPFSコンテナの状態確認
   - ポート開放確認
2. Graph Node接続エラー
   - 管理エンドポイントの確認
   - ログの確認
3. サブグラフ作成エラー
   - 既存サブグラフの確認
   - マニフェストファイルの検証

### 同期の問題
1. ブロック同期遅延
   - RPCエンドポイントの状態確認
   - ネットワーク接続の確認
2. イベント処理エラー
   - コントラクトアドレスの確認
   - ABIの検証
3. データベースエラー
   - PostgreSQL接続確認
   - ディスク容量確認

## 監視とメンテナンス

### 定期確認項目
- ブロック同期状態
- メモリ使用量
- ディスク使用量
- エラーログ

### バックアップ
- PostgreSQLデータ
- サブグラフ定義
- 設定ファイル

### アップデート手順
1. 既存コンテナの停止
2. 新バージョンのプル
3. 設定の更新
4. 再起動と動作確認

最終更新: 2024年1月14日 