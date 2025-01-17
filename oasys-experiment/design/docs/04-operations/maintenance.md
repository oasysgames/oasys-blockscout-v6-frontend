# メンテナンスガイド

## 定期メンテナンス

### 1. バックアップ

#### データベースバックアップ
```bash
# PostgreSQLデータのバックアップ
docker compose exec postgres pg_dump -U graph-node graph-node > backup.sql

# バックアップの圧縮
gzip backup.sql
```

#### 設定ファイルバックアップ
```bash
# サブグラフ定義のバックアップ
cp -r subgraph backup/
```

### 2. クリーンアップ

#### Dockerリソース
```bash
# 未使用イメージの削除
docker image prune -a

# 未使用ボリュームの削除
docker volume prune

# システムクリーンアップ
docker system prune
```

#### ログファイル
```bash
# 古いログの削除
find /var/log/graph-node -name "*.log" -mtime +30 -delete
```

### 3. アップデート

#### コンポーネントのアップデート
1. Graph Node
```bash
# 既存コンテナの停止
docker compose down

# 新バージョンのプル
docker compose pull

# 再起動
docker compose up -d
```

2. IPFS
```bash
# IPFSのアップデート
docker compose pull ipfs
docker compose up -d ipfs
```

3. PostgreSQL
```bash
# PostgreSQLのアップデート
docker compose pull postgres
docker compose up -d postgres
```

## 障害対応

### 1. Graph Node障害

#### 症状
- ブロック同期停止
- クエリ応答なし
- エラーログの増加

#### 対応手順
1. ログ確認
```bash
docker compose logs -f graph-node
```

2. メモリ使用量確認
```bash
docker stats
```

3. 再起動
```bash
docker compose restart graph-node
```

### 2. データベース障害

#### 症状
- 接続エラー
- クエリタイムアウト
- ディスク容量不足

#### 対応手順
1. 状態確認
```bash
docker compose exec postgres psql -U graph-node -c "SELECT version();"
```

2. 接続テスト
```bash
docker compose exec postgres pg_isready
```

3. バキューム実行
```bash
docker compose exec postgres vacuumdb -U graph-node --all --analyze
```

### 3. IPFS障害

#### 症状
- ファイル追加エラー
- 取得遅延
- 接続タイムアウト

#### 対応手順
1. 状態確認
```bash
curl -X POST http://localhost:5001/api/v0/version
```

2. 再起動
```bash
docker compose restart ipfs
```

## パフォーマンスチューニング

### 1. Graph Node

#### メモリ設定
```yaml
services:
  graph-node:
    environment:
      GRAPH_NODE_MEMORY: "2G"
      RUST_BACKTRACE: "1"
```

#### キャッシュ設定
```yaml
    environment:
      GRAPH_ENTITY_CACHE_SIZE: "1000"
      GRAPH_QUERY_CACHE_SIZE: "1000"
```

### 2. PostgreSQL

#### 設定最適化
```yaml
services:
  postgres:
    command: 
      - "postgres"
      - "-c"
      - "max_connections=100"
      - "-c"
      - "shared_buffers=2GB"
      - "-c"
      - "effective_cache_size=6GB"
      - "-c"
      - "maintenance_work_mem=512MB"
      - "-c"
      - "checkpoint_completion_target=0.9"
      - "-c"
      - "wal_buffers=16MB"
      - "-c"
      - "default_statistics_target=100"
      - "-c"
      - "random_page_cost=1.1"
      - "-c"
      - "effective_io_concurrency=200"
``` 