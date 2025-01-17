# 監視ガイド

## 定期確認項目

### 1. システム状態

```bash
# メモリ使用量
docker stats

# ディスク使用量
docker system df

# コンテナ状態
docker compose ps
```

### 2. サブグラフ状態

```bash
# ブロック同期状態
curl -X POST http://localhost:8030/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ indexingStatuses { subgraph synced health error } }"}'

# イベント処理状態
docker compose logs -f graph-node | grep "Event"
```

### 3. エラー監視

```bash
# エラーログの確認
docker compose logs -f graph-node | grep "ERROR"

# 警告の確認
docker compose logs -f graph-node | grep "WARN"
```

## アラート設定

### 1. リソース使用量
- メモリ使用率 > 80%
- ディスク使用率 > 90%
- CPU使用率 > 90%

### 2. サブグラフ状態
- ブロック同期遅延 > 100ブロック
- イベント処理エラー発生
- 同期状態が`false`

### 3. システム状態
- コンテナ停止
- ネットワークエラー
- データベース接続エラー

## メトリクス収集

### 1. システムメトリクス
- CPU使用率
- メモリ使用量
- ディスク使用量
- ネットワークI/O

### 2. アプリケーションメトリクス
- ブロック処理速度
- イベント処理数
- クエリ応答時間
- エラー発生率

### 3. ビジネスメトリクス
- 日次トランザクション数
- ブリッジ金額の合計
- ユニークユーザー数
- チェーン別の利用状況

## ログ管理

### 1. ログローテーション
```bash
# ログファイルの圧縮
find /var/log/graph-node -name "*.log" -mtime +7 -exec gzip {} \;

# 古いログの削除
find /var/log/graph-node -name "*.gz" -mtime +30 -delete
```

### 2. ログ分析
- エラーパターンの分析
- パフォーマンスボトルネックの特定
- 異常検知のためのベースライン確立

### 3. ログ保存
- 重要なログの長期保存
- コンプライアンス要件への対応
- インシデント分析用のデータ保持 