# 複数L2ブリッジの追跡設計

## 概要
Oasysの複数のL2（Verse）からのブリッジイベントを追跡するための設計。

## L2（Verse）一覧

| Verse名 | RPC エンドポイント | ブリッジアドレス |
|---------|-------------------|-----------------|
| ChainVerse | https://rpc.chainverse.info/ | 0x24d133Df1d72089809945EC9550f72f8415AC780 |
| DefiVerse | https://rpc.defi-verse.org | 0x0cc5366BE800cf73daB2DBfDE031C255a6f1E3cC |
| GeekVerse | https://rpc.geekout-pte.com | 0x62Ec33Ea441d654008d5E631D11B6A3cb7034e31 |
| GesoVerse | https://rpc.verse.gesoten.com/ | 0x9F740B3E8E823E68294eEA69299908E3FdEe1Ea7 |
| HOMEVerse | https://rpc.mainnet.oasys.homeverse.games | 0x9245e19eB88de2534E03E764FB2a5f194e6d97AD |
| MCHVerse | https://rpc.oasys.mycryptoheroes.net | 0xA16517A9796bAc73eFA7d07269F9818b7978dc2A |
| SaakuruVerse | https://rpc.saakuru.network | 0x4FfA6d5745C2E78361ae91a36312524284F3D812 |
| TCGVerse | https://rpc.tcgverse.xyz | 0xa34a85ecb19c88d4965EcAfB10019E63050a1098 |
| XPLAVerse | https://rpc-xpla-verse.xpla.dev/ | 0x80d7aAB75B4144AF77E04C1A334e7236Be4771d0 |
| YooldoVerse | https://rpc.yooldo-verse.xyz | 0xf6944626a2EA29615e05f3AC9Ab2568e8E004e9D |

## スキーマ設計

### BridgeEvent エンティティ
```graphql
type BridgeEvent @entity {
  id: ID!                    # イベントハッシュ_インデックス
  eventType: String!         # "DEPOSIT" or "WITHDRAW"
  from: Bytes!              
  to: Bytes!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
  verseId: String!          # L2の識別子（例: "tcgverse"）
  verseChain: String!       # L2のチェーンID
  verseRpc: String!         # L2のRPCエンドポイント
  bridgeAddr: Bytes!        # L2のブリッジコントラクトアドレス
  extraData: Bytes         # ウィズドローイベントの追加データ
}
```

### DailyBridgeStats エンティティ
```graphql
type DailyBridgeStats @entity {
  id: ID!                    # 日付_verse_id_イベントタイプ
  date: String!             # YYYY-MM-DD
  verseId: String!          # L2の識別子
  eventType: String!         # "DEPOSIT" or "WITHDRAW"
  totalAmount: BigInt!
  eventCount: Int!
}
```

### VerseInfo エンティティ
```graphql
type VerseInfo @entity {
  id: ID!                    # L2の識別子
  name: String!             # L2の表示名
  chainId: String!          # チェーンID
  rpcEndpoint: String!      # RPCエンドポイント
  bridgeAddr: Bytes!        # ブリッジコントラクトアドレス
  isActive: Boolean!        # アクティブ状態
  createdAt: BigInt!        # 登録日時
  updatedAt: BigInt!        # 更新日時
}
```

## subgraph.yaml の構造
```yaml
dataSources:
  # 各L2のブリッジコントラクト
  - kind: ethereum/contract
    name: ChainVerseBridge
    network: mainnet
    source:
      address: "0x24d133Df1d72089809945EC9550f72f8415AC780"
      abi: BridgeABI
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      entities: [BridgeEvent, DailyBridgeStats, VerseInfo]
      eventHandlers:
        - event: ETHDepositInitiated(indexed address,indexed address,uint256,bytes)
          handler: handleETHDepositInitiated
        - event: ETHBridgeFinalized(indexed address,indexed address,uint256,bytes)
          handler: handleETHBridgeFinalized
        - event: ETHWithdrawalFinalized(indexed address,indexed address,uint256,bytes)
          handler: handleETHWithdrawalFinalized

  # 他のL2も同様に設定
```

## マッピング関数

### handleETHDepositInitiated
```typescript
export function handleETHDepositInitiated(event: ETHDepositInitiated): void {
  let verseInfo = getVerseInfoFromAddress(event.address);
  
  // BridgeEventエンティティの作成
  let bridgeEvent = new BridgeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  bridgeEvent.eventType = "DEPOSIT";
  bridgeEvent.from = event.params.from;
  bridgeEvent.to = event.params.to;
  bridgeEvent.amount = event.params.amount;
  bridgeEvent.timestamp = event.block.timestamp;
  bridgeEvent.blockNumber = event.block.number;
  bridgeEvent.transactionHash = event.transaction.hash;
  bridgeEvent.verseId = verseInfo.id;
  bridgeEvent.verseChain = verseInfo.chainId;
  bridgeEvent.verseRpc = verseInfo.rpcEndpoint;
  bridgeEvent.bridgeAddr = verseInfo.bridgeAddr;
  bridgeEvent.extraData = event.params.extraData;
  bridgeEvent.save();

  // 日次統計の更新
  let dayId = getDayId(event.block.timestamp);
  let dailyStatsId = dayId + "-" + verseInfo.id + "-DEPOSIT";
  
  let dailyStats = DailyBridgeStats.load(dailyStatsId);
  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dailyStatsId);
    dailyStats.date = dayId;
    dailyStats.verseId = verseInfo.id;
    dailyStats.eventType = "DEPOSIT";
    dailyStats.totalAmount = BigInt.fromI32(0);
    dailyStats.eventCount = 0;
  }
  
  dailyStats.totalAmount = dailyStats.totalAmount.plus(event.params.amount);
  dailyStats.eventCount++;
  dailyStats.save();
}
```

## クエリ例

### 特定のL2のイベント履歴
```graphql
{
  bridgeEvents(
    where: {
      verseId: "tcgverse",
      eventType: "DEPOSIT"
    }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    from
    to
    amount
    timestamp
    verseId
  }
}
```

### 全L2の日次統計
```graphql
{
  dailyBridgeStats(
    orderBy: date
    orderDirection: desc
  ) {
    date
    verseId
    eventType
    totalAmount
    eventCount
  }
}
```

### アクティブなL2一覧
```graphql
{
  verseInfos(
    where: {
      isActive: true
    }
  ) {
    id
    name
    rpcEndpoint
    bridgeAddr
  }
}
```

## 実装手順
1. schema.graphqlの更新
   - 新しいエンティティの追加
   - L2情報の追加

2. subgraph.yamlの更新
   - 各L2のデータソース追加
   - イベントハンドラの設定

3. マッピング関数の実装
   - L2情報の管理機能
   - イベント処理の実装
   - 統計情報の集計

4. デプロイとテスト
   - 各L2ごとのテスト
   - 統合テスト
   - パフォーマンス確認

## 注意事項
- 各L2の識別子は一意であること
- RPCエンドポイントの可用性確認
- ブリッジコントラクトアドレスの正確性
- イベントの重複処理の防止
- 大量データ処理時のパフォーマンス

最終更新: 2024年1月16日 