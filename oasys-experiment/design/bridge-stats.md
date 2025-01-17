# ブリッジ統計仕様

## データベーススキーマ

### BridgeEvent
```sql
create table bridge_events
(
    vid          bigserial
        primary key,
    block_range  int4range not null,
    id           text      not null,
    event_type   text      not null,    -- "DEPOSIT" or "WITHDRAW"
    from_address text      not null,
    to_address   text      not null,
    amount       numeric   not null,
    timestamp    numeric   not null,
    block_number numeric   not null,
    tx_hash      text      not null,
    verse_id     text      not null,    -- L2のアドレス
    chain_name   text      not null,    -- L2の名前（例: "TCGVerse", "SaakuruVerse"など）
    extra_data   text              -- ウィズドローイベントの追加データ
);
```

### DailyBridgeStats
```sql
create table daily_bridge_stats
(
    vid          bigserial
        primary key,
    block_range  int4range not null,
    id           text      not null,    -- 日付_verse_id_イベントタイプ
    date         text      not null,    -- YYYY-MM-DD
    verse_id     text      not null,    -- L2のアドレス
    chain_name   text      not null,    -- L2の名前
    event_type   text      not null,    -- "DEPOSIT" or "WITHDRAW"
    total_amount numeric   not null,
    event_count  integer   not null
);
```

### VerseInfo
```sql
create table verse_info
(
    vid          bigserial
        primary key,
    id           text      not null,    -- L2の識別子
    name         text      not null,    -- L2の表示名
    chain_id     text      not null,    -- チェーンID
    rpc_endpoint text      not null,    -- RPCエンドポイント
    bridge_addr  text      not null,    -- ブリッジコントラクトアドレス
    is_active    boolean   not null,    -- アクティブ状態
    created_at   timestamp not null,    -- 登録日時
    updated_at   timestamp not null     -- 更新日時
);
```

## L2情報

```typescript
const VERSE_INFO = [
  {
    id: "chainverse",
    name: "ChainVerse",
    rpcEndpoint: "https://rpc.chainverse.info/",
    bridgeAddr: "0x24d133Df1d72089809945EC9550f72f8415AC780"
  },
  {
    id: "defiverse",
    name: "DefiVerse",
    rpcEndpoint: "https://rpc.defi-verse.org",
    bridgeAddr: "0x0cc5366BE800cf73daB2DBfDE031C255a6f1E3cC"
  },
  {
    id: "geekverse",
    name: "GeekVerse",
    rpcEndpoint: "https://rpc.geekout-pte.com",
    bridgeAddr: "0x62Ec33Ea441d654008d5E631D11B6A3cb7034e31"
  },
  {
    id: "gesoverse",
    name: "GesoVerse",
    rpcEndpoint: "https://rpc.verse.gesoten.com/",
    bridgeAddr: "0x9F740B3E8E823E68294eEA69299908E3FdEe1Ea7"
  },
  {
    id: "homeverse",
    name: "HOMEVerse",
    rpcEndpoint: "https://rpc.mainnet.oasys.homeverse.games",
    bridgeAddr: "0x9245e19eB88de2534E03E764FB2a5f194e6d97AD"
  },
  {
    id: "mchverse",
    name: "MCHVerse",
    rpcEndpoint: "https://rpc.oasys.mycryptoheroes.net",
    bridgeAddr: "0xA16517A9796bAc73eFA7d07269F9818b7978dc2A"
  },
  {
    id: "saakuruverse",
    name: "SaakuruVerse",
    rpcEndpoint: "https://rpc.saakuru.network",
    bridgeAddr: "0x4FfA6d5745C2E78361ae91a36312524284F3D812"
  },
  {
    id: "tcgverse",
    name: "TCGVerse",
    rpcEndpoint: "https://rpc.tcgverse.xyz",
    bridgeAddr: "0xa34a85ecb19c88d4965EcAfB10019E63050a1098"
  },
  {
    id: "xplaverse",
    name: "XPLAVerse",
    rpcEndpoint: "https://rpc-xpla-verse.xpla.dev/",
    bridgeAddr: "0x80d7aAB75B4144AF77E04C1A334e7236Be4771d0"
  },
  {
    id: "yooldoverse",
    name: "YooldoVerse",
    rpcEndpoint: "https://rpc.yooldo-verse.xyz",
    bridgeAddr: "0xf6944626a2EA29615e05f3AC9Ab2568e8E004e9D"
  }
];
```

## 集計ロジック

### 基本仕様
- 日付ごとに集計（YYYY-MM-DD形式）
- イベントタイプ（DEPOSIT/WITHDRAW）ごとに別レコード
- L2（Verse）ごとに別レコード
- `total_amount`は同じ日の同じイベントタイプ、同じL2の合計
- DEPOSITとWITHDRAWは別々のレコードで管理（相殺しない）

### 集計例

以下のイベントが発生した場合（TCGVerseの例）：
```
2025-01-15 01:00:00 TCGVerse deposit  100 
2025-01-16 01:00:00 TCGVerse deposit  100 
2025-01-16 02:00:00 TCGVerse deposit  100 
2025-01-16 03:00:00 TCGVerse withdraw 100 
```

集計結果：
```
# 2025-01-15のレコード
{
    "id": "2025-01-15-tcgverse-DEPOSIT",
    "date": "2025-01-15",
    "verse_id": "0xa34a85ecb19c88d4965EcAfB10019E63050a1098",
    "chain_name": "TCGVerse",
    "event_type": "DEPOSIT",
    "total_amount": 100,  // 1回のdeposit
    "event_count": 1
}

# 2025-01-16のレコード（2つ作成される）
{
    "id": "2025-01-16-tcgverse-DEPOSIT",
    "date": "2025-01-16",
    "verse_id": "0xa34a85ecb19c88d4965EcAfB10019E63050a1098",
    "chain_name": "TCGVerse",
    "event_type": "DEPOSIT",
    "total_amount": 200,  // 2回のdeposit (100 + 100)
    "event_count": 2
}
{
    "id": "2025-01-16-tcgverse-WITHDRAW",
    "date": "2025-01-16",
    "verse_id": "0xa34a85ecb19c88d4965EcAfB10019E63050a1098",
    "chain_name": "TCGVerse",
    "event_type": "WITHDRAW",
    "total_amount": 100,  // 1回のwithdraw
    "event_count": 1
}
```

## インデックス

[既存のインデックス定義に加えて]

```sql
-- イベントのL2情報に関するインデックス
create index bridge_events_verse_id on bridge_events (verse_id);
create index bridge_events_chain_name on bridge_events (chain_name);

-- 統計のL2情報に関するインデックス
create index daily_bridge_stats_verse_id on daily_bridge_stats (verse_id);
create index daily_bridge_stats_chain_name on daily_bridge_stats (chain_name);
```

## 実装詳細

集計処理は`mapping.ts`で以下のように実装されています：

1. イベント発生時にL2アドレスからchain nameを特定
2. 日付（YYYY-MM-DD）を生成
3. L2アドレス、イベントタイプ、日付から一意のIDを生成（例：`2025-01-15-tcgverse-DEPOSIT`）
4. 該当する日付のレコードが存在しない場合は新規作成
5. イベントの`amount`を`totalAmount`に加算
6. `eventCount`をインクリメント
7. 更新したレコードを保存

最終更新: 2024年1月17日 