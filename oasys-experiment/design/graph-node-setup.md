## Graph Node セットアップ記録

### 現状
- graph-nodeが正常に動作していることを確認
- ブロックのスキャンとイベントの処理が行われている
- subgraphの作成が完了

### 使用しているポート
- GraphQL API (クエリ): http://localhost:8000
- GraphQL Playground: http://localhost:8000/graphql
- 管理エンドポイント: http://localhost:8020
- IPFS: http://localhost:5001

### 次回の作業に向けて
1. subgraphのデプロイが必要
   ```bash
   graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 oasys/bridge
   ```

2. デプロイ後の確認事項
   - GraphQL Playgroundでのクエリテスト
   - イベントの同期状況の確認
   - エンティティの確認

### 注意点
- graph-nodeの起動には以下のサービスが必要:
  - PostgreSQL
  - IPFS
  - Ethereum RPC endpoint

### 現在のsubgraph情報
- 名前: oasys/bridge
- 監視しているイベント: ETHDepositInitiated
- エンティティ:
  - BridgeDeposit
  - DailyBridgeStats

### トラブルシューティング
- コンテナの状態確認: `docker-compose ps`
- ログの確認: `docker-compose logs graph-node`
- IPFS接続確認: `curl http://localhost:5001/api/v0/version` 