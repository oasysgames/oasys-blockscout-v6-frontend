#!/usr/bin/env python3

from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from datetime import datetime
import json

# GraphQLクライアントの設定
transport = RequestsHTTPTransport(
    url='http://localhost:8000/subgraphs/name/oasys/bridge',
    verify=True,
    retries=3,
)
client = Client(transport=transport, fetch_schema_from_transport=True)

########################
# (A) 単一IDを取得する例
########################

# 1. IDを作成するための関数
def build_daily_bridge_stats_id(date_str: str, bridge_address: str, event_type: str) -> str:
    """
    例:
      date_str      = "2025-01-24"
      bridge_address= "0x0cc5366be800cf73dab2dbfde031c255a6f1e3cc"
      event_type    = "DEPOSIT"
    
    結果: "2025-01-24-0x0cc5366be800cf73dab2dbfde031c255a6f1e3cc-DEPOSIT"
    """
    return f"{date_str}-{bridge_address}-{event_type}"

# 2. 単一レコードを取得する Query
detail_query = gql("""
    query GetDailyStats($id: ID!) {
      dailyBridgeStats(id: $id) {
        id
        chainName
        date
        eventType
        total_amount
        accumulated_amount
        count
      }
    }
""")

def get_stats_for_one_id(stats_id: str):
    """
    単一IDに対応する dailyBridgeStats を取得する
    """
    result = client.execute(detail_query, variable_values={'id': stats_id})
    return result.get("dailyBridgeStats", None)

########################
# (B) 一覧を取得して日付で絞り込む例
########################

# 3. 一覧取得用クエリ (サブグラフ側で 'dailyBridgeStatsList' 的なフィールドが必要)
list_query = gql("""
    query GetDailyStatsList {
      # サブグラフが、引数なしで一覧を返す実装になっている場合のみ有効
      dailyBridgeStatsList {
        id
        chainName
        date
        eventType
        total_amount
        accumulated_amount
        count
      }
    }
""")

def get_latest_daily_stats(target_date=None):
    """
    指定された日付（デフォルトは今日）の dailyBridgeStats 一覧を取得し、
    該当日付だけを返す。
    
    ※注意: このクエリには 'dailyBridgeStatsList' が存在するスキーマが必須
    """
    if target_date is None:
        target_date = datetime.now().strftime('%Y-%m-%d')

    # 一覧を取得
    data = client.execute(list_query)
    items = data["dailyBridgeStatsList"]  # ここが返ってくるキーはスキーマ次第

    # 指定された日付に合うものだけフィルタ
    stats_by_chain = {}
    for stat in items:
        if stat["date"] != target_date:
            continue
        
        chain = stat["chainName"]
        event_type = stat["eventType"]

        if chain not in stats_by_chain:
            stats_by_chain[chain] = {
                'DEPOSIT': None,
                'WITHDRAW': None
            }

        stats_by_chain[chain][event_type] = {
            'total_amount': stat['total_amount'],
            'accumulated_amount': stat['accumulated_amount'],
            'count': stat['count']
        }
    return stats_by_chain

########################
# (C) 実行部
########################

def format_amount(amount_str):
    """
    Wei単位の文字列をETH単位の浮動小数点数に変換
    """
    return float(amount_str) / 1e18

def main():
    """
    例として、(A) か (B) のどちらかを実行する
    """
    # (A) 単一IDの取得例:
    print("=== 単一IDで取得 ===")
    date_str = "2025-01-24"
    addr = "0x0cc5366be800cf73dab2dbfde031c255a6f1e3cc"
    evt = "DEPOSIT"
    single_id = build_daily_bridge_stats_id(date_str, addr, evt)
    record = get_stats_for_one_id(single_id)
    print(f"ID = {single_id}")
    if record:
        print(f"Chain: {record['chainName']}")
        print(f"Date : {record['date']}")
        print(f"Event: {record['eventType']}")
        print(f"Count: {record['count']}")
        print(f"Total: {format_amount(record['total_amount']):.2f} ETH")
        print(f"Accum: {format_amount(record['accumulated_amount']):.2f} ETH")
    else:
        print("Not found or error")

    # (B) 一覧からフィルタする例:
    #  → このままでは dailyBridgeStatsList フィールドがサブグラフにないとエラー
    print("\n=== 一覧からフィルタ ===")
    today = datetime.now().strftime('%Y-%m-%d')
    stats = get_latest_daily_stats(today)
    for chain, events in stats.items():
        print(f"Chain: {chain}")
        deposit = events['DEPOSIT']
        withdraw = events['WITHDRAW']

        if deposit:
            print(f"  Deposits:")
            print(f"    Count: {deposit['count']}")
            print(f"    Total Amount: {format_amount(deposit['total_amount']):.2f} ETH")
            print(f"    Accumulated: {format_amount(deposit['accumulated_amount']):.2f} ETH")

        if withdraw:
            print(f"  Withdraws:")
            print(f"    Count: {withdraw['count']}")
            print(f"    Total Amount: {format_amount(withdraw['total_amount']):.2f} ETH")
            print(f"    Accumulated: {format_amount(withdraw['accumulated_amount']):.2f} ETH")

        print()

if __name__ == "__main__":
    main()