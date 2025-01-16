#!/usr/bin/env python3
import json
import subprocess
from datetime import datetime

def format_date(day_id):
    """エポック日からYYYY-MM-DD形式に変換"""
    timestamp = int(day_id) * 86400
    return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')

def fetch_data(query):
    cmd = f'''
    curl -X POST -H "Content-Type: application/json" \
      -d '{{"query": "{query}"}}' \
      http://localhost:8000/subgraphs/name/oasys/bridge
    '''
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return json.loads(result.stdout)

def check_events():
    query = """
    {
      bridgeEvents(first: 10, orderBy: timestamp, orderDirection: desc) {
        id
        eventType
        from
        to
        amount
        timestamp
        blockNumber
      }
    }
    """
    data = fetch_data(query)
    events = data['data']['bridgeEvents']
    
    print("\n=== 最新のブリッジイベント ===")
    for event in events:
        timestamp = datetime.fromtimestamp(int(event['timestamp']))
        amount = int(event['amount']) / 1e18  # WeiからETHに変換
        print(f"Type: {event['eventType']}")
        print(f"From: {event['from']}")
        print(f"To: {event['to']}")
        print(f"Amount: {amount} ETH")
        print(f"Time: {timestamp}")
        print(f"Block: {event['blockNumber']}")
        print("---")

def check_stats():
    query = """
    {
      dailyBridgeStats(orderBy: date, orderDirection: desc) {
        id
        date
        eventType
        totalAmount
        eventCount
      }
    }
    """
    data = fetch_data(query)
    stats = data['data']['dailyBridgeStats']
    
    print("\n=== 日次統計 ===")
    for stat in stats:
        formatted_date = format_date(stat['date'])
        total_amount = int(stat['totalAmount']) / 1e18  # WeiからETHに変換
        print(f"Date: {formatted_date}")
        print(f"Type: {stat['eventType']}")
        print(f"Total Amount: {total_amount} ETH")
        print(f"Event Count: {stat['eventCount']}")
        print("---")

def main():
    try:
        check_events()
        check_stats()
    except Exception as e:
        print(f"エラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 