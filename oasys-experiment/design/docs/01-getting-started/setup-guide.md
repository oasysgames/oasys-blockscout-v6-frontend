# 環境構築ガイド

## 前提条件

- Docker と Docker Compose
- Node.js と Yarn
- @graphprotocol/graph-cli
- Python 3.8以上
- Node.js 16以上
- Graph CLI

## 環境構築手順

### 1. 依存関係のインストール

```bash
cd subgraph
yarn install
```

### 2. Docker環境の設定

`docker-compose.yaml`の設定例：

```yaml
services:
  graph-node:
    image: graphprotocol/graph-node:v0.33.0
    platform: linux/amd64  # M1/M2 Mac対応
    ports:
      - '8000:8000'  # GraphQL
      - '8001:8001'  # WebSocket
      - '8020:8020'  # Admin
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
    platform: linux/amd64
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

### 3. プラットフォーム対応

#### M1/M2 Mac (arm64)
1. Docker Composeファイルで`platform: linux/amd64`を指定
2. Rosetta 2による互換性変換を利用
3. パフォーマンスへの影響は最小限

### 4. リソース管理

1. メモリ制限の設定
   - Graph Node: 最小2GB推奨
   - PostgreSQL: 最小1GB推奨

2. OOMKiller対策
   - スワップ領域の確保
   - メモリ使用量の監視

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

### よくある問題と解決策

1. IPFS接続エラー
   - IPFSコンテナの状態確認
   - ポート開放確認

2. Graph Node接続エラー
   - 管理エンドポイントの確認
   - ログの確認

3. PostgreSQL接続エラー
   - データベース接続設定の確認
   - ポート競合の確認

## Python環境のセットアップ

### 1. 仮想環境の作成

```bash
# oasys-experimentディレクトリに移動
cd oasys-experiment

# 仮想環境の作成
python3 -m venv venv

# 仮想環境の有効化
source venv/bin/activate  # Unix/macOS
# または
.\venv\Scripts\activate   # Windows
```

### 2. 依存パッケージのインストール

```bash
# 仮想環境が有効化されていることを確認 (プロンプトに (venv) が表示される)
pip install -r query/requirements.txt
```

### 3. 仮想環境の管理

- 有効化: `source venv/bin/activate` (Unix/macOS) または `.\venv\Scripts\activate` (Windows)
- 無効化: `deactivate`
- 状態確認: プロンプトに `(venv)` が表示されているか確認

注意: 新しいターミナルセッションを開始した場合は、再度仮想環境を有効化する必要があります。

## Graph Node環境のセットアップ

(既存のセットアップ手順...)