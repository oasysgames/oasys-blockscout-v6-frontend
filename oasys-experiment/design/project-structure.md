# プロジェクト構造

## ディレクトリ構成

```
oasys-experiment/
├── design/           # 設計ドキュメント
├── subgraph/         # サブグラフ定義
│   ├── src/         # マッピング関数
│   ├── schema.graphql # スキーマ定義
│   └── subgraph.yaml # マニフェスト
├── docker/          # Docker関連ファイル
│   └── graph-node/  # Graph Node設定
└── scripts/         # ユーティリティスクリプト
```

## 主要ファイル

### 設計ドキュメント
- `development-status.md`: 開発状況
- `implementation.md`: 実装詳細
- `project-structure.md`: プロジェクト構造
- `subgraph-setup.md`: サブグラフセットアップ
- `testing-queries.md`: テストクエリ集

### 設定ファイル
- `docker-compose.yaml`: Docker構成
- `subgraph.yaml`: サブグラフ定義
- `schema.graphql`: GraphQLスキーマ

### ソースコード
- マッピング関数
  - `src/mapping.ts`: イベント処理ロジック
  - `src/utils.ts`: ユーティリティ関数
- テストコード
  - `tests/mapping.test.ts`: ユニットテスト

## 依存関係

### 開発環境
- Node.js >= 16
- Yarn >= 1.22
- Docker >= 20.10
- Docker Compose >= 2.0

### 主要パッケージ
- @graphprotocol/graph-cli
- @graphprotocol/graph-ts
- typescript
- jest

### インフラストラクチャ
- Graph Node v0.33.0
- IPFS v0.10.0
- PostgreSQL

## 設定項目

### Docker Compose
- ポート設定
  - Graph Node: 8000-8001, 8020, 8030, 8040
  - IPFS: 5001
  - PostgreSQL: 5432
- ボリューム
  - PostgreSQLデータ
  - IPFSデータ

### サブグラフ
- データソース
  - ネットワーク: oasys
  - 開始ブロック: 4700000
- エンティティ
  - BridgeDeposit
  - DailyBridgeStats

## 開発フロー

### セットアップ
1. リポジトリのクローン
2. 依存パッケージのインストール
3. 環境変数の設定
4. Dockerコンテナの起動

### ビルドとデプロイ
1. サブグラフのビルド
2. IPFSへのデプロイ
3. Graph Nodeへの登録
4. 同期状態の確認

### テストとデバッグ
1. ユニットテストの実行
2. GraphQL Playgroundでの動作確認
3. ログの確認とトラブルシューティング

最終更新: 2024年1月14日 