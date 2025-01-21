# Oasys Bridge Subgraph

Oasysネットワークのブリッジ関連イベントを追跡・分析するためのSubgraph実装

## ドキュメント構造

```
docs/
├── 01-getting-started/     # 初期セットアップと基本情報
│   ├── overview.md         # プロジェクト概要
│   ├── setup-guide.md      # 環境構築手順
│   └── deployment-guide.md # デプロイ手順
│
├── 02-specifications/      # 仕様・設計情報
│   ├── data-model.md       # データモデル定義
│   ├── event-tracking.md   # イベント追跡仕様
│   └── api-spec.yaml       # API仕様
│
├── 03-development/         # 開発者向け情報
│   ├── coding-guidelines.md # コーディング規約
│   ├── testing-guide.md    # テスト方針
│   └── troubleshooting.md  # トラブルシューティング
│
└── 04-operations/          # 運用情報
    ├── monitoring.md       # 監視方針
    ├── maintenance.md      # メンテナンス手順
    └── backup-restore.md   # バックアップ・リストア
```

## 開発フロー

1. 仕様確認・設計
   - `docs/02-specifications/`で最新の仕様を確認
   - 変更が必要な場合は仕様書を更新

2. 環境セットアップ
   - `docs/01-getting-started/setup-guide.md`に従って開発環境を構築
   - Python仮想環境のセットアップと依存パッケージのインストール

3. 実装・テスト
   - `docs/03-development/`のガイドラインに従って実装
   - テスト方針に基づいて検証

4. デプロイ・確認
   - `docs/01-getting-started/deployment-guide.md`に従ってデプロイ
   - `docs/04-operations/`の手順で動作確認

5. 運用・監視
   - `docs/04-operations/`の方針に従って運用

## バージョン管理

- セマンティックバージョニングを採用
- 詳細は`CHANGELOG.md`を参照

## 技術スタック

- Graph Node: v0.33.0
- IPFS: v0.10.0
- PostgreSQL: 最新版
- その他依存関係: `dependencies.yaml`を参照 