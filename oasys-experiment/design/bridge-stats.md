# Bridge Statistics Design

## 目的
TCGverse Bridgeを通じてbridgeされたOASの量を集計し、分析可能な形で保存する。

## データソース
- コントラクト: TCGverse Bridge (`0xa34a85ecb19c88d4965EcAfB10019E63050a1098`)
- イベント: `ETHDepositInitiated(address indexed from, address indexed to, uint256 amount, bytes extraData)`

## 集計データ
1. 個別デポジット情報
   - デポジット元アドレス
   - デポジット先アドレス
   - デポジット量（OAS）
   - タイムスタンプ
   - トランザクションハッシュ

2. 日次集計情報
   - 日付
   - 総デポジット量
   - デポジット回数

## クエリ例
```graphql
# 日次集計データの取得
{
  dailyBridgeStats(
    orderBy: date,
    orderDirection: desc,
    first: 7
  ) {
    date
    totalAmount
    depositCount
  }
}

# 最新のデポジット履歴
{
  bridgeDeposits(
    orderBy: timestamp,
    orderDirection: desc,
    first: 10
  ) {
    from
    to
    amount
    timestamp
  }
}
``` 