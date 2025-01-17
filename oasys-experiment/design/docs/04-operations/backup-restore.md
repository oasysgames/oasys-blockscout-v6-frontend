# バックアップ・リストアガイド

## バックアップ

### 1. データベースバックアップ

#### 完全バックアップ
```bash
# バックアップの作成
docker compose exec postgres pg_dump -U graph-node graph-node > backup_$(date +%Y%m%d).sql

# バックアップの圧縮
gzip backup_$(date +%Y%m%d).sql
```

#### 差分バックアップ
```bash
# WALアーカイブの取得
docker compose exec postgres pg_basebackup -D /backup -Ft -z -P
```

### 2. 設定バックアップ

#### サブグラフ定義
```bash
# マニフェストとマッピングのバックアップ
tar -czf subgraph_$(date +%Y%m%d).tar.gz subgraph/

# スキーマ定義のバックアップ
cp subgraph/schema.graphql backup/schema_$(date +%Y%m%d).graphql
```

#### Docker設定
```bash
# Docker Compose設定のバックアップ
cp docker-compose.yaml backup/docker-compose_$(date +%Y%m%d).yaml

# 環境変数のバックアップ
cp .env backup/env_$(date +%Y%m%d)
```

### 3. バックアップ管理

#### ローテーション
```bash
# 30日以上前のバックアップを削除
find backup/ -name "backup_*.sql.gz" -mtime +30 -delete
find backup/ -name "subgraph_*.tar.gz" -mtime +30 -delete
```

#### 圧縮
```bash
# バックアップの圧縮
find backup/ -name "*.sql" -exec gzip {} \;
```

## リストア

### 1. データベースリストア

#### 完全リストア
```bash
# コンテナの停止
docker compose down

# データベースの初期化
docker volume rm oasys-experiment_postgres-data

# コンテナの起動
docker compose up -d postgres

# リストアの実行
gunzip -c backup_20240117.sql.gz | docker compose exec -T postgres psql -U graph-node graph-node
```

#### 差分リストア
```bash
# WALアーカイブからのリストア
docker compose exec postgres pg_restore -d graph-node /backup/base.tar.gz
```

### 2. 設定リストア

#### サブグラフ定義
```bash
# マニフェストとマッピングのリストア
tar -xzf subgraph_20240117.tar.gz

# スキーマ定義のリストア
cp backup/schema_20240117.graphql subgraph/schema.graphql
```

#### Docker設定
```bash
# Docker Compose設定のリストア
cp backup/docker-compose_20240117.yaml docker-compose.yaml

# 環境変数のリストア
cp backup/env_20240117 .env
```

### 3. 検証

#### データベース検証
```bash
# テーブル一覧の確認
docker compose exec postgres psql -U graph-node -c "\dt"

# レコード数の確認
docker compose exec postgres psql -U graph-node -c "SELECT count(*) FROM bridge_events;"
```

#### サブグラフ検証
```bash
# サブグラフのデプロイ
yarn deploy

# 同期状態の確認
curl -X POST http://localhost:8030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ indexingStatuses { subgraph synced health error } }"}'
```

## 災害復旧

### 1. 復旧手順

1. バックアップの確認
2. システムの停止
3. データベースのリストア
4. 設定のリストア
5. システムの起動
6. 検証の実行

### 2. 復旧時間目標

- RTO (Recovery Time Objective): 2時間以内
- RPO (Recovery Point Objective): 24時間以内

### 3. 検証項目

- データベースの整合性
- サブグラフの同期状態
- クエリの応答性能
- システムリソースの使用状況 