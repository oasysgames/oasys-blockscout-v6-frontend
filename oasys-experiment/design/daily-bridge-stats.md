# 日次ブリッジ統計（DailyBridgeStats）仕様

## データベーススキーマ

```sql
create table daily_bridge_stats
(
    vid          bigserial
        primary key,
    block_range  int4range not null,
    id           text      not null,
    date         text      not null,
    event_type   text      not null,
    total_amount numeric   not null,
    event_count  integer   not null
);
```

## 集計ロジック

### 基本仕様
- 日付ごとに集計（YYYY-MM-DD形式）
- イベントタイプ（DEPOSIT/WITHDRAW）ごとに別レコード
- `total_amount`は同じ日の同じイベントタイプの合計
- DEPOSITとWITHDRAWは別々のレコードで管理（相殺しない）

### 集計例

以下のイベントが発生した場合：
```
2025-01-15 01:00:00 deposit  100 
2025-01-16 01:00:00 deposit  100 
2025-01-16 02:00:00 deposit  100 
2025-01-16 03:00:00 withdraw 100 
```

集計結果：
```
# 2025-01-15のレコード
{
    "id": "2025-01-15-DEPOSIT",
    "date": "2025-01-15",
    "event_type": "DEPOSIT",
    "total_amount": 100,  // 1回のdeposit
    "event_count": 1
}

# 2025-01-16のレコード（2つ作成される）
{
    "id": "2025-01-16-DEPOSIT",
    "date": "2025-01-16",
    "event_type": "DEPOSIT",
    "total_amount": 200,  // 2回のdeposit (100 + 100)
    "event_count": 2
}
{
    "id": "2025-01-16-WITHDRAW",
    "date": "2025-01-16",
    "event_type": "WITHDRAW",
    "total_amount": 100,  // 1回のwithdraw
    "event_count": 1
}
```

## インデックス

パフォーマンス最適化のため、以下のインデックスが作成されます：

```sql
create index daily_bridge_stats_id_block_range_excl
    on daily_bridge_stats using gist (id, block_range);

create index brin_daily_bridge_stats
    on daily_bridge_stats using brin (lower(block_range) int4_minmax_multi_ops, 
                                    COALESCE(upper(block_range), 2147483647) int4_minmax_multi_ops, 
                                    vid int8_minmax_multi_ops);

create index daily_bridge_stats_block_range_closed
    on daily_bridge_stats (COALESCE(upper(block_range), 2147483647))
    where (COALESCE(upper(block_range), 2147483647) < 2147483647);

create index attr_1_0_daily_bridge_stats_id
    on daily_bridge_stats (id);

create index attr_1_1_daily_bridge_stats_date
    on daily_bridge_stats ("left"(date, 256));

create index attr_1_2_daily_bridge_stats_event_type
    on daily_bridge_stats ("left"(event_type, 256));

create index attr_1_3_daily_bridge_stats_total_amount
    on daily_bridge_stats (total_amount);

create index attr_1_4_daily_bridge_stats_event_count
    on daily_bridge_stats (event_count);
```

## 実装詳細

集計処理は`mapping.ts`で以下のように実装されています：

1. イベント発生時に日付（YYYY-MM-DD）を生成
2. イベントタイプと日付から一意のIDを生成（例：`2025-01-15-DEPOSIT`）
3. 該当する日付のレコードが存在しない場合は新規作成
4. イベントの`amount`を`totalAmount`に加算
5. `eventCount`をインクリメント
6. 更新したレコードを保存

最終更新: 2024年1月16日 