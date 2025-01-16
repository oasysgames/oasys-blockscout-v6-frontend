# サブグラフデプロイメント手順

## 環境セットアップ


### プラットフォーム互換性
- M1/M2 Mac (arm64)での実行時は、`platform: linux/amd64`の指定が必要
- Rosetta 2による互換性変換を利用
- パフォーマンスへの影響は最小限

## デプロイメント手順

1. 環境の起動
```bash
docker compose up -d
```

2. サブグラフのセットアップとデプロイ
```bash
# 依存関係のインストール
cd subgraph
yarn

# コード生成とビルド
yarn codegen
yarn build

# ローカルサブグラフの作成
yarn create-local

# サブグラフのデプロイ
yarn deploy-local
# バージョンラベルの入力を求められるので、手動で入力してください（例: v0.0.1）
```

## 動作確認

### エンドポイント
- GraphQL: http://localhost:8000/subgraphs/name/oasys/bridge/graphql
- WebSocket: ws://localhost:8001/ws
- Admin: http://localhost:8020

### ヘルスチェック項目
- [x] Graph Nodeの起動状態
- [x] IPFSの接続
- [x] PostgreSQLの接続
- [x] ブロック同期の進行
- [x] イベント処理の状態

## トラブルシューティング

### OOMKiller対策
1. メモリ使用量の監視
2. 必要に応じてメモリ制限の調整
3. スワップ領域の確保

### プラットフォーム互換性の問題
1. Docker Composeファイルでのプラットフォーム指定
2. イメージのプル時にプラットフォームを確認
3. ログの確認でエラーの特定

### ブロック同期の問題
1. ログの確認
2. ネットワーク接続の確認
3. RPC エンドポイントの状態確認

最終更新: 2024年1月14日 