# Oasys Bridge Stats サブグラフ実装ノート

## 概要
- Oasysのメインネット上のL1StandardBridgeコントラクトからETHDepositInitiatedイベントを追跡
- 各バース（SaakuruとTCGverse）のデポジット統計を集計
- The Graphを使用してイベントのインデックスと集計を実装

## 実装の主要コンポーネント

### スキーマ設計
- `BridgeDeposit`: 個々のデポジットイベントを記録
  - id, verse, from, to, amount, timestamp等の基本情報を保持
  - DailyBridgeStatsとの関連付けにより、日次統計との紐付けが可能

- `DailyBridgeStats`: 日次のデポジット統計
  - id（verse名と日付の組み合わせ）
  - verse, date, totalAmount, depositCount
  - BridgeDepositsとの逆方向の関連付け

### データソース設定
- SaakuruBridge (0x4FfA6d5745C2E78361ae91a36312524284F3D812)
- TCGverseBridge (0xa34a85ecb19c88d4965EcAfB10019E63050a1098)
- 両方ともL1StandardBridgeのABIを使用
- startBlockは0から開始（全履歴をインデックス）

### イベントハンドリング
- `handleETHDepositInitiated`関数で以下を実装:
  - バース名の特定
  - デポジットエンティティの作成
  - 日次統計の更新（新規作成または既存の更新）

## 開発環境セットアップ

### Dockerコンテナ構成
- graph-node: The Graphノード（v0.33.0）
  - ポート: 8000(HTTP), 8001, 8020, 8030, 8040
  - Oasysメインネットに接続（https://rpc.mainnet.oasys.games）

- IPFS: ファイル保存用（v0.10.0）
  - ポート: 5001

- PostgreSQL: データストア
  - ポート: 25432
  - データベース: graph-node

### プラットフォーム互換性の注意点
- M1/M2 Mac（arm64）で実行する場合、Dockerイメージ（amd64）との互換性警告が表示される
- 警告は表示されるが、実行自体は問題なく可能

## クエリエンドポイント
- HTTP: http://localhost:8000/subgraphs/name/oasys-bridge-stats/graphql
- 主要なクエリ例:
  ```graphql
  # 日次統計取得
  {
    dailyBridgeStats(first: 10, orderBy: date, orderDirection: desc) {
      id
      verse
      date
      totalAmount
      depositCount
    }
  }

  # 個別デポジット取得
  {
    bridgeDeposits(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      verse
      from
      to
      amount
      timestamp
    }
  }
  ```

## 次回への引き継ぎ事項

### 改善検討事項
1. スタートブロックの最適化
   - 現在は0からインデックスを開始
   - コントラクトのデプロイブロック番号からの開始を検討

2. エラーハンドリングの強化
   - イベント処理時の例外処理
   - 不正なデータの検出とスキップ

3. パフォーマンス最適化
   - インデックス速度の改善
   - クエリ応答時間の最適化

4. モニタリングの追加
   - インデックス進捗の監視
   - エラー率の追跡
   - システムリソース使用状況の監視

### 運用上の注意点
1. プラットフォーム互換性
   - ARM64プラットフォームでの実行時の警告について説明を追加
   - 必要に応じて、ARM64対応イメージの検討

2. バックアップ戦略
   - PostgreSQLデータのバックアップ方法
   - IPFSデータの永続化と管理

3. スケーリング計画
   - データ量増加時の対応
   - 複数ノードでの運用検討 