#!/usr/bin/env python3
import json
import subprocess
import sys

def fetch_deposits():
    cmd = '''
    curl -X POST -H "Content-Type: application/json" \
      -d '{"query": "query { bridgeDeposits(first: 1000) { id } }"}' \
      http://localhost:8000/subgraphs/name/oasys/bridge
    '''
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout

def main():
    try:
        response = fetch_deposits()
        data = json.loads(response)
        deposits = data['data']['bridgeDeposits']
        count = len(deposits)
        print(f"デポジット総数: {count}")
    except Exception as e:
        print(f"エラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 