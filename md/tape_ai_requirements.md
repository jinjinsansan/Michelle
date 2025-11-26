# TapeAI 要件定義書

## Document Information
- **Version**: 1.0
- **Created**: 2025-11-26
- **Project Name**: TapeAI（テープAI）
- **Tagline**: 「恋愛・人生・人間関係の悩み、AIに相談してみませんか？」

---

## 1. プロジェクト概要

### 1.1 コンセプト

```
┌─────────────────────────────────────────────────────────────────┐
│                        TapeAI のコンセプト                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【表向き】                      【実態】                       │
│   ・恋愛相談AI                   ・テープ式心理学ベース          │
│   ・人生相談AI                   ・本格的な心理カウンセリング    │
│   ・人間関係相談AI               ・「鏡」として機能              │
│   ・気軽にアクセス可能           ・深い気づきを促す              │
│                                                                 │
│   「なんかこのAI、他のAIと違う...」を体験させる                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 ビジョン
気軽な入り口から入ったユーザーが、知らず知らずのうちに自分自身と向き合い、「今日生きててよかった」と思えるようになるサービス。

### 1.3 ターゲットユーザー

| セグメント | 特徴 | 入り口 | 期待する変化 |
|-----------|------|--------|-------------|
| 恋愛で悩む人 | 20-30代、失恋・片思い・関係の悩み | 恋愛相談 | 本当の感情に気づく |
| 人生に迷う人 | 20-40代、キャリア・生き方・将来不安 | 人生相談 | 自分の軸を見つける |
| 人間関係で苦しむ人 | 全年代、職場・家族・友人関係 | 人間関係相談 | 境界線を引けるようになる |
| 自分を知りたい人 | 全年代、自己理解欲求 | タイプ診断 | 深い相談へ進む |

### 1.4 競合との差別化

| 項目 | 一般的なAIチャット | TapeAI |
|------|-------------------|--------|
| 応答スタイル | アドバイス型 | 鏡型（問いかけ中心） |
| 理論基盤 | なし / 一般的 | テープ式心理学（87トピック） |
| ゴール | 問題解決 | 気づき・自己理解 |
| 深さ | 表面的 | 根本（ガムテープ）に迫る |
| ユーザー体験 | 「答えをもらった」 | 「自分で気づいた」 |

---

## 2. サービス構成

### 2.1 メニュー構成

```
┌─────────────────────────────────────────────────────────────────┐
│                         TapeAI メニュー                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │  ① 恋愛相談 │   │  ② 人生相談 │   │③人間関係相談│          │
│   │             │   │             │   │             │          │
│   │ 💕 恋の悩み │   │ 🌟 生き方   │   │ 👥 対人関係 │          │
│   │ 失恋・片思い│   │ キャリア    │   │ 職場・家族  │          │
│   │ 関係の問題  │   │ 将来の不安  │   │ 友人関係    │          │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘          │
│          │                 │                 │                  │
│          └────────────────┼────────────────┘                  │
│                           ▼                                     │
│              ┌─────────────────────────┐                        │
│              │   テープ式心理学AI      │                        │
│              │   （RAG + システムプロンプト）                   │
│              └─────────────────────────┘                        │
│                           ▲                                     │
│          ┌────────────────┴────────────────┐                    │
│          │                                 │                    │
│   ┌──────┴──────┐                   ┌──────┴──────┐             │
│   │④タイプ診断  │                   │  ⑤ 占い    │             │
│   │             │                   │  (予定)    │             │
│   │ 🔍 自己分析 │                   │  🔮        │             │
│   │ 質問→診断   │                   │            │             │
│   │ →相談誘導   │                   │            │             │
│   └─────────────┘                   └─────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 各メニュー詳細

#### ① 恋愛相談
```yaml
name: 恋愛相談
icon: 💕
tagline: "恋の悩み、聞かせてください"
description: |
  失恋、片思い、復縁、浮気、結婚...
  恋愛の悩みをAIがじっくり聴きます。
  
ai_persona: |
  優しく受容的な恋愛相談のプロ。
  ただし、アドバイスではなく「本当はどう感じている？」と問いかける。
  
focus_topics:
  - 恋愛における無価値観
  - 見捨てられ不安
  - 依存関係
  - 境界線の問題
  - 過去の恋愛パターン（ガムテープ）
```

#### ② 人生相談
```yaml
name: 人生相談
icon: 🌟
tagline: "あなたの人生、一緒に考えます"
description: |
  将来が不安、やりたいことが分からない、
  生きる意味が見つからない...
  人生の大きな悩みに寄り添います。
  
ai_persona: |
  穏やかで深い人生の先輩。
  「生きる意味は探さなくていい」「今日生きててよかったと思えればいい」
  
focus_topics:
  - 生きる意味の探求
  - 将来への恐怖
  - 0百思考
  - 自己価値感
  - 今を生きる
```

#### ③ 人間関係相談
```yaml
name: 人間関係相談
icon: 👥
tagline: "人との関係、楽になりませんか？"
description: |
  職場の上司、家族、友人...
  人間関係のストレスを解消しましょう。
  
ai_persona: |
  冷静で客観的、でも温かい相談相手。
  境界線の大切さを伝える。
  
focus_topics:
  - 境界線の設定
  - 対人恐怖（テープ式では存在しない概念）
  - 共依存・反依存
  - 機能不全家庭の影響
  - ノージャッジ
```

#### ④ タイプ別診断
```yaml
name: タイプ別診断
icon: 🔍
tagline: "あなたはどんなタイプ？"
description: |
  いくつかの質問に答えるだけで、
  あなたの傾向が分かります。
  
purpose: |
  - 自己理解のきっかけ
  - 相談メニューへの誘導（ファネル）
  - ユーザーエンゲージメント向上
  
diagnosis_types:
  - 恋愛傾向診断
  - ストレス対処タイプ診断
  - コミュニケーションスタイル診断
  - 思考パターン診断（0百思考傾向など）
  
flow:
  1. 質問に回答（10-15問）
  2. 診断結果表示
  3. 「この傾向について相談してみませんか？」→ ①②③へ誘導
```

#### ⑤ 占い（予定）
```yaml
name: 占い
icon: 🔮
status: 予定
description: |
  エンターテイメント要素として追加予定。
  ただし、マジカルシンキングに陥らないよう設計。
```

---

## 3. 機能要件

### 3.1 機能一覧

#### 認証・ユーザー管理

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| AUTH-01 | メール認証 | メール/パスワードでの登録・ログイン | P0 |
| AUTH-02 | ソーシャルログイン | Google, LINE, Apple | P1 |
| AUTH-03 | プロフィール設定 | ニックネーム、アバター、基本情報 | P0 |
| AUTH-04 | アカウント削除 | GDPR対応、データ完全削除 | P0 |

#### AIチャット機能

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| CHAT-01 | リアルタイムチャット | ストリーミング応答 | P0 |
| CHAT-02 | RAG検索 | テープ式心理学ナレッジから関連情報取得 | P0 |
| CHAT-03 | コンテキスト維持 | 会話の文脈を保持 | P0 |
| CHAT-04 | メニュー別AI | 恋愛/人生/人間関係で微調整されたAI | P0 |
| CHAT-05 | セッション保存 | 会話履歴の保存 | P0 |
| CHAT-06 | セッション再開 | 過去の会話から継続 | P1 |
| CHAT-07 | 気づきメモ | 会話中の気づきを保存 | P2 |

#### タイプ診断機能

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| DIAG-01 | 質問表示 | 診断質問を順次表示 | P1 |
| DIAG-02 | 回答集計 | スコアリング | P1 |
| DIAG-03 | 結果表示 | 診断結果とタイプ説明 | P1 |
| DIAG-04 | 相談誘導 | 診断結果から相談メニューへ誘導 | P1 |
| DIAG-05 | 結果保存 | 診断履歴の保存 | P2 |

#### 課金機能

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| PAY-01 | 無料枠 | 月N回まで無料 | P0 |
| PAY-02 | サブスクリプション | 月額プラン | P0 |
| PAY-03 | ポイント購入 | 従量課金オプション | P1 |
| PAY-04 | 利用量表示 | 残りトーク数/ポイント表示 | P0 |
| PAY-05 | 決済連携 | Stripe連携 | P0 |

#### その他

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| OTHER-01 | 利用規約・プライバシーポリシー | 法的文書 | P0 |
| OTHER-02 | お問い合わせ | サポートフォーム | P1 |
| OTHER-03 | FAQ | よくある質問 | P2 |
| OTHER-04 | 通知 | メール通知、プッシュ通知 | P2 |

### 3.2 画面一覧

```
/                       # ランディングページ
/login                  # ログイン
/register               # 新規登録
/dashboard              # ダッシュボード（メニュー選択）
/chat/love              # 恋愛相談チャット
/chat/life              # 人生相談チャット
/chat/relationship      # 人間関係相談チャット
/chat/history           # チャット履歴一覧
/chat/history/:id       # 過去のチャット詳細
/diagnosis              # タイプ診断一覧
/diagnosis/:type        # 診断実行
/diagnosis/result/:id   # 診断結果
/profile                # プロフィール設定
/subscription           # サブスクリプション管理
/points                 # ポイント購入
/settings               # 設定
```

---

## 4. 課金モデル

### 4.1 プラン構成

```
┌─────────────────────────────────────────────────────────────────┐
│                         課金プラン                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【無料プラン】          【ライトプラン】      【プレミアム】   │
│   ¥0/月                  ¥980/月              ¥1,980/月        │
│                                                                 │
│   ・月5回まで相談        ・月30回まで相談      ・無制限相談     │
│   ・タイプ診断           ・タイプ診断          ・タイプ診断     │
│   ・履歴7日間保存        ・履歴30日間保存      ・履歴無制限     │
│                          ・気づきメモ          ・気づきメモ     │
│                                                ・優先応答       │
│                                                ・専用サポート   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【ポイント購入】（サブスク併用可）                             │
│                                                                 │
│   100pt = ¥500   （1回の相談 ≒ 10-20pt）                        │
│   300pt = ¥1,200  (20%お得)                                     │
│   500pt = ¥1,800  (28%お得)                                     │
│                                                                 │
│   ※ポイントは無料枠を超えた場合に消費                           │
│   ※サブスクユーザーは追加ポイントとして利用可能                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 ポイント消費ロジック

```yaml
point_consumption:
  base_rate: 1pt / 1000 tokens (目安)
  
  calculation:
    - 入力トークン: 0.5pt / 1000 tokens
    - 出力トークン: 1.5pt / 1000 tokens
    - RAG検索: 0.5pt / 検索
    
  estimation:
    - 短い相談（5往復）: 約10pt
    - 普通の相談（15往復）: 約30pt
    - 長い相談（30往復）: 約60pt
    
  display:
    - 相談開始前に目安表示
    - リアルタイムで残ポイント表示
    - 残り少ない場合は警告
```

---

## 5. 非機能要件

### 5.1 パフォーマンス

| 項目 | 要件 |
|------|------|
| 初回応答時間 | 3秒以内（ストリーミング開始） |
| ページロード | 2秒以内 |
| 同時接続数 | 1,000ユーザー |
| 可用性 | 99.5% |

### 5.2 セキュリティ

| 項目 | 要件 |
|------|------|
| 通信暗号化 | TLS 1.3 |
| 認証 | JWT + Refresh Token |
| データ暗号化 | 会話データはAES-256で暗号化 |
| 個人情報 | GDPR準拠、データ削除対応 |
| レート制限 | API呼び出し制限 |

### 5.3 スケーラビリティ

| 項目 | 要件 |
|------|------|
| 水平スケール | Vercel Edge Functions対応 |
| DB | Supabase（自動スケール） |
| CDN | Cloudflare |

---

## 6. 技術スタック

### 6.1 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────────┐
│                        TapeAI アーキテクチャ                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【フロントエンド】           【バックエンド】                  │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │    Next.js 14   │         │  Next.js API    │              │
│   │    App Router   │────────▶│  Routes         │              │
│   │    TypeScript   │         │  (Vercel)       │              │
│   │    Tailwind CSS │         └────────┬────────┘              │
│   │    shadcn/ui    │                  │                        │
│   └─────────────────┘                  │                        │
│          │                             │                        │
│          │                             ▼                        │
│          │                   ┌─────────────────┐                │
│   ┌──────▼──────┐            │    Supabase     │                │
│   │  Cloudflare │            │  ┌───────────┐  │                │
│   │     CDN     │            │  │ PostgreSQL│  │                │
│   │   + Images  │            │  │ + pgvector│  │                │
│   └─────────────┘            │  └───────────┘  │                │
│                              │  ┌───────────┐  │                │
│                              │  │   Auth    │  │                │
│                              │  └───────────┘  │                │
│                              │  ┌───────────┐  │                │
│                              │  │  Storage  │  │                │
│                              │  └───────────┘  │                │
│                              └────────┬────────┘                │
│                                       │                         │
│                                       ▼                         │
│                              ┌─────────────────┐                │
│                              │   Claude API    │                │
│                              │  (Anthropic)    │                │
│                              └─────────────────┘                │
│                                                                 │
│   【決済】                    【その他】                         │
│   ┌─────────────────┐        ┌─────────────────┐               │
│   │     Stripe      │        │    Resend       │               │
│   │   Subscription  │        │   (Email)       │               │
│   │     + Checkout  │        └─────────────────┘               │
│   └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 技術選定

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フレームワーク | Next.js 14 (App Router) | SSR/ISR、API Routes、Vercel最適化 |
| 言語 | TypeScript | 型安全、DX向上 |
| スタイリング | Tailwind CSS + shadcn/ui | 高速開発、一貫性 |
| ホスティング | Vercel | Next.js最適化、Edge Functions |
| データベース | Supabase (PostgreSQL) | 認証統合、リアルタイム、pgvector |
| ベクトルDB | Supabase pgvector | RAG用、Supabaseに統合 |
| 認証 | Supabase Auth | ソーシャルログイン、セッション管理 |
| LLM | Claude API (Anthropic) | 高品質、長文対応 |
| 決済 | Stripe | サブスク、国際対応 |
| CDN | Cloudflare | キャッシュ、セキュリティ |
| メール | Resend | トランザクションメール |
| 監視 | Vercel Analytics + Sentry | パフォーマンス、エラー追跡 |

### 6.3 RAGアーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAG パイプライン                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【事前準備：ナレッジ登録】                                     │
│                                                                 │
│   tape_psychology_knowledge.md                                  │
│              │                                                  │
│              ▼                                                  │
│   ┌─────────────────┐                                           │
│   │  テキスト分割   │  chunk_size: 1000                         │
│   │  (Chunking)     │  overlap: 200                             │
│   └────────┬────────┘                                           │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐                                           │
│   │   Embedding     │  OpenAI text-embedding-3-small            │
│   │   (ベクトル化)  │  or Voyage AI                             │
│   └────────┬────────┘                                           │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐                                           │
│   │   Supabase      │                                           │
│   │   pgvector      │  ベクトル + メタデータ保存                │
│   └─────────────────┘                                           │
│                                                                 │
│   ────────────────────────────────────────────────────────────  │
│                                                                 │
│   【実行時：RAG検索】                                            │
│                                                                 │
│   ユーザー入力                                                   │
│   「彼氏に振られて辛い」                                         │
│              │                                                  │
│              ▼                                                  │
│   ┌─────────────────┐                                           │
│   │   Embedding     │                                           │
│   │   (クエリ)      │                                           │
│   └────────┬────────┘                                           │
│            │                                                    │
│            ▼                                                    │
│   ┌─────────────────┐     ┌─────────────────────────────────┐  │
│   │  類似度検索     │────▶│ 関連チャンク取得                 │  │
│   │  (Top-K = 5)    │     │ ・リフレーミング                 │  │
│   └─────────────────┘     │ ・寂しさの感情                   │  │
│                           │ ・意味付けの変換                 │  │
│                           └──────────────┬──────────────────┘  │
│                                          │                      │
│                                          ▼                      │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │                      Claude API                           │ │
│   │  ┌────────────────────────────────────────────────────┐  │ │
│   │  │ System: テープ式心理学AIカウンセラー               │  │ │
│   │  │ Context: [RAGで取得したナレッジ]                   │  │ │
│   │  │ User: 彼氏に振られて辛い                           │  │ │
│   │  └────────────────────────────────────────────────────┘  │ │
│   └──────────────────────────────────────────────────────────┘ │
│                           │                                     │
│                           ▼                                     │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │ AI応答:                                                   │ │
│   │ 「振られて辛いんですね...本当はどんな気持ちですか？」    │ │
│   └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. データモデル

### 7.1 ER図

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │   sessions      │     │    messages     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │──┐  │ id (PK)         │──┐  │ id (PK)         │
│ email           │  │  │ user_id (FK)    │  │  │ session_id (FK) │
│ nickname        │  └─▶│ category        │  └─▶│ role            │
│ avatar_url      │     │ title           │     │ content         │
│ created_at      │     │ created_at      │     │ tokens_used     │
│ updated_at      │     │ updated_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         │              ┌─────────────────┐     ┌─────────────────┐
         │              │  subscriptions  │     │    payments     │
         │              ├─────────────────┤     ├─────────────────┤
         └─────────────▶│ id (PK)         │     │ id (PK)         │
                        │ user_id (FK)    │     │ user_id (FK)    │
                        │ plan            │     │ amount          │
                        │ status          │     │ type            │
                        │ stripe_sub_id   │     │ stripe_pay_id   │
                        │ current_period_*│     │ created_at      │
                        └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   user_points   │     │   diagnoses     │     │   knowledge     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ user_id (FK)    │     │ user_id (FK)    │     │ content         │
│ balance         │     │ type            │     │ embedding       │
│ updated_at      │     │ answers (JSON)  │     │ metadata (JSON) │
└─────────────────┘     │ result (JSON)   │     │ created_at      │
                        │ created_at      │     └─────────────────┘
                        └─────────────────┘
```

### 7.2 テーブル定義

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セッションテーブル（チャット会話）
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL, -- 'love', 'life', 'relationship'
  title VARCHAR(100),
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メッセージテーブル
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サブスクリプションテーブル
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL, -- 'free', 'light', 'premium'
  status VARCHAR(20) NOT NULL, -- 'active', 'canceled', 'past_due'
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ポイント残高テーブル
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 診断結果テーブル
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  answers JSONB NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ナレッジベース（RAG用）
CREATE TABLE knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ベクトル検索用インデックス
CREATE INDEX ON knowledge USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

---

## 8. API設計

### 8.1 エンドポイント一覧

#### 認証 API
```
POST   /api/auth/register      # 新規登録
POST   /api/auth/login         # ログイン
POST   /api/auth/logout        # ログアウト
GET    /api/auth/me            # 現在のユーザー取得
```

#### チャット API
```
POST   /api/chat               # メッセージ送信（ストリーミング）
GET    /api/sessions           # セッション一覧取得
GET    /api/sessions/:id       # セッション詳細取得
DELETE /api/sessions/:id       # セッション削除
```

#### 診断 API
```
GET    /api/diagnosis/types    # 診断タイプ一覧
GET    /api/diagnosis/:type    # 診断質問取得
POST   /api/diagnosis/:type    # 診断実行
GET    /api/diagnosis/history  # 診断履歴取得
```

#### 課金 API
```
GET    /api/subscription       # サブスク状態取得
POST   /api/subscription       # サブスク開始
DELETE /api/subscription       # サブスク解約
POST   /api/points/purchase    # ポイント購入
GET    /api/points/balance     # ポイント残高取得
POST   /api/webhook/stripe     # Stripe Webhook
```

#### ユーザー API
```
GET    /api/user/profile       # プロフィール取得
PUT    /api/user/profile       # プロフィール更新
DELETE /api/user/account       # アカウント削除
```

### 8.2 チャットAPI詳細

```typescript
// POST /api/chat
// Request
{
  session_id?: string;          // 既存セッションの場合
  category: 'love' | 'life' | 'relationship';
  message: string;
}

// Response (Server-Sent Events)
// ストリーミングで返却
data: {"type": "start", "session_id": "xxx"}
data: {"type": "chunk", "content": "振られて"}
data: {"type": "chunk", "content": "辛いん"}
data: {"type": "chunk", "content": "ですね"}
data: {"type": "done", "tokens_used": 150, "points_consumed": 2}
```

---

## 9. セキュリティ要件

### 9.1 認証・認可

```yaml
authentication:
  method: JWT + Refresh Token
  provider: Supabase Auth
  session_duration: 1 hour (access), 7 days (refresh)
  
authorization:
  - 自分のデータのみアクセス可能
  - 課金状態に応じた機能制限
  - レート制限（API呼び出し）
```

### 9.2 データ保護

```yaml
data_protection:
  encryption:
    - 通信: TLS 1.3
    - 保存: Supabase標準暗号化
    - 会話内容: 追加でAES-256暗号化（検討）
    
  privacy:
    - GDPR準拠
    - データ削除機能
    - エクスポート機能（検討）
    
  retention:
    - 無料プラン: 7日間
    - 有料プラン: プランに応じて
```

### 9.3 AIセーフティ

```yaml
ai_safety:
  content_filtering:
    - 自傷・自殺関連の検出
    - 危機対応フローへの誘導
    - 専門機関の案内
    
  rate_limiting:
    - 無料: 5回/月
    - 有料: プランに応じて
    - 全体: 100リクエスト/分（DDoS対策）
    
  monitoring:
    - 危険な会話のフラグ付け
    - 定期的なレビュー
```

---

## 10. 運用要件

### 10.1 監視

```yaml
monitoring:
  performance:
    - Vercel Analytics
    - Core Web Vitals
    
  errors:
    - Sentry
    - エラーアラート（Slack通知）
    
  business:
    - ユーザー数
    - 会話数
    - 課金状況
    - 離脱率
```

### 10.2 バックアップ

```yaml
backup:
  database:
    - Supabase自動バックアップ（毎日）
    - Point-in-time recovery（7日間）
    
  code:
    - GitHub
    - Vercel自動デプロイ
```

---

## 11. 今後の拡張予定

### Phase 2以降の機能

```yaml
future_features:
  - 占い機能（⑤）
  - 感情日記
  - AIによるインサイトレポート
  - グループセッション（検討）
  - 専門家とのマッチング（検討）
  - LINE公式アカウント連携
  - モバイルアプリ（React Native）
```

---

## 付録A: 用語集

| 用語 | 説明 |
|------|------|
| TapeAI | 本サービスの名称 |
| セッション | 1回のチャット会話 |
| RAG | Retrieval-Augmented Generation |
| ガムテープ | テープ式心理学の用語、ネガティブな思い込み |

---

*Document Version: 1.0*
*Created: 2025-11-26*
