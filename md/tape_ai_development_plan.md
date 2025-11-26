# TapeAI 開発計画書

## Document Information
- **Version**: 1.0
- **Created**: 2025-11-26
- **Project Name**: TapeAI（テープAI）
- **Development Tool**: Claude Code

---

## 1. 開発概要

### 1.1 開発アプローチ

```
┌─────────────────────────────────────────────────────────────────┐
│                      開発アプローチ                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   【開発手法】                                                   │
│   ・アジャイル開発（2週間スプリント）                           │
│   ・Claude Codeによるペアプログラミング                         │
│   ・MVP First → 段階的機能追加                                  │
│                                                                 │
│   【開発順序】                                                   │
│   Phase 0: 環境構築・基盤                                       │
│      ↓                                                          │
│   Phase 1: MVP（認証 + AIチャット + 基本課金）                  │
│      ↓                                                          │
│   Phase 2: 拡張機能（診断 + 履歴管理）                          │
│      ↓                                                          │
│   Phase 3: 本番運用（最適化 + 監視）                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック確定

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js | 14.x (App Router) |
| 言語 | TypeScript | 5.x |
| UI | Tailwind CSS | 3.x |
| UIコンポーネント | shadcn/ui | latest |
| DB | Supabase | latest |
| ベクトルDB | pgvector | 0.5.x |
| LLM | Claude API | claude-sonnet-4-20250514 |
| 決済 | Stripe | latest |
| ホスティング | Vercel | - |
| CDN | Cloudflare | - |
| メール | Resend | latest |

---

## 2. フェーズ別開発計画

### Phase 0: 環境構築・基盤（1週間）

#### 目標
開発環境とプロジェクト基盤を構築する

#### タスク一覧

```
□ P0-1: プロジェクト初期化
  ├── Next.js 14 プロジェクト作成
  ├── TypeScript 設定
  ├── ESLint/Prettier 設定
  ├── .env.local 設定（テンプレート）
  └── README.md 作成

□ P0-2: UI基盤構築
  ├── Tailwind CSS 設定
  ├── shadcn/ui インストール
  ├── グローバルスタイル設定
  ├── フォント設定（Noto Sans JP）
  └── カラーテーマ定義

□ P0-3: Supabase 設定
  ├── プロジェクト作成
  ├── データベーススキーマ作成
  ├── pgvector 拡張有効化
  ├── RLS ポリシー設定
  └── Supabase クライアント設定

□ P0-4: 外部サービス設定
  ├── Vercel プロジェクト作成
  ├── Cloudflare ドメイン設定
  ├── Stripe アカウント設定
  ├── Anthropic API キー取得
  └── Resend 設定

□ P0-5: RAGナレッジ登録
  ├── ナレッジファイル分割スクリプト作成
  ├── Embedding生成スクリプト作成
  ├── Supabase pgvector へ登録
  └── 検索テスト
```

#### 成果物
- 動作するNext.jsプロジェクト
- Supabaseに接続可能
- RAGナレッジがベクトルDBに登録済み

---

### Phase 1: MVP開発（3週間）

#### Week 1: 認証 + 基本UI

```
□ P1-1: 認証機能
  ├── Supabase Auth 設定
  ├── サインアップページ
  ├── ログインページ
  ├── ログアウト機能
  ├── 認証状態管理（Context/Zustand）
  ├── 保護ルート設定
  └── ソーシャルログイン（Google）

□ P1-2: 共通レイアウト
  ├── ヘッダーコンポーネント
  ├── サイドバー/ナビゲーション
  ├── フッターコンポーネント
  ├── モバイルレスポンシブ対応
  └── ローディング/エラー状態

□ P1-3: ランディングページ
  ├── ヒーローセクション
  ├── 機能紹介セクション
  ├── 料金プランセクション
  ├── CTAセクション
  └── SEO設定（メタタグ）
```

#### Week 2: AIチャット機能

```
□ P1-4: チャットUI
  ├── チャット画面レイアウト
  ├── メッセージ入力コンポーネント
  ├── メッセージ表示コンポーネント
  ├── ストリーミング表示対応
  ├── 送信中状態表示
  └── 自動スクロール

□ P1-5: チャットAPI
  ├── /api/chat エンドポイント作成
  ├── RAG検索機能実装
  ├── Claude API呼び出し
  ├── ストリーミングレスポンス
  ├── トークン計算
  └── エラーハンドリング

□ P1-6: セッション管理
  ├── セッションDB設計実装
  ├── メッセージDB設計実装
  ├── セッション作成API
  ├── メッセージ保存API
  ├── セッション一覧API
  └── セッション詳細API

□ P1-7: カテゴリ別AI
  ├── システムプロンプト分岐
  ├── 恋愛相談モード
  ├── 人生相談モード
  ├── 人間関係相談モード
  └── ダッシュボード（メニュー選択）
```

#### Week 3: 課金機能

```
□ P1-8: Stripe連携
  ├── Stripe SDK設定
  ├── 商品/価格設定（Stripe Dashboard）
  ├── Checkout Session API
  ├── Webhook設定
  └── サブスク状態同期

□ P1-9: サブスクリプション管理
  ├── サブスクDB設計実装
  ├── プラン選択UI
  ├── 購入フロー
  ├── 解約フロー
  ├── 請求ポータルリンク
  └── サブスク状態表示

□ P1-10: 利用制限
  ├── 無料枠カウント
  ├── 制限チェックミドルウェア
  ├── 制限到達時UI
  └── アップグレード誘導

□ P1-11: MVP統合テスト
  ├── E2Eテスト（主要フロー）
  ├── バグ修正
  ├── パフォーマンス確認
  └── 本番デプロイ準備
```

#### MVP成果物
- ユーザー登録・ログインできる
- 3カテゴリでAIチャットできる
- RAGが機能している
- 無料枠と有料サブスクが機能

---

### Phase 2: 拡張機能（2週間）

#### Week 4: タイプ診断 + 履歴管理

```
□ P2-1: タイプ診断機能
  ├── 診断タイプ定義（JSON）
  ├── 質問データ作成
  ├── 診断UI（質問→回答フロー）
  ├── スコアリングロジック
  ├── 結果表示UI
  ├── 結果保存API
  └── 相談誘導UI

□ P2-2: 履歴管理
  ├── セッション一覧UI
  ├── セッション検索
  ├── セッション削除
  ├── 過去セッション再開
  └── 履歴エクスポート（CSV）

□ P2-3: プロフィール機能
  ├── プロフィール編集UI
  ├── アバターアップロード
  ├── ニックネーム変更
  └── アカウント削除機能
```

#### Week 5: ポイント課金 + UX改善

```
□ P2-4: ポイント課金
  ├── ポイントDB設計
  ├── ポイント購入UI
  ├── Stripe単発決済
  ├── ポイント残高表示
  ├── ポイント消費ロジック
  └── 残高不足時UI

□ P2-5: UX改善
  ├── オンボーディングフロー
  ├── ツールチップ/ヘルプ
  ├── 通知トースト
  ├── キーボードショートカット
  └── ダークモード対応

□ P2-6: 追加認証
  ├── LINE ログイン
  ├── Apple ログイン
  ├── パスワードリセット
  └── メール確認フロー
```

---

### Phase 3: 本番運用準備（1週間）

```
□ P3-1: パフォーマンス最適化
  ├── 画像最適化（Cloudflare Images）
  ├── バンドルサイズ削減
  ├── キャッシュ戦略
  ├── DB インデックス最適化
  └── Edge Functions活用

□ P3-2: セキュリティ強化
  ├── セキュリティヘッダー設定
  ├── レート制限実装
  ├── 入力バリデーション強化
  ├── SQLインジェクション対策確認
  └── XSS対策確認

□ P3-3: 監視・運用
  ├── Sentry 設定
  ├── Vercel Analytics 設定
  ├── エラーアラート設定
  ├── ヘルスチェック
  └── ログ設計

□ P3-4: ドキュメント・法務
  ├── 利用規約作成
  ├── プライバシーポリシー作成
  ├── 特定商取引法表記
  ├── APIドキュメント
  └── 運用マニュアル

□ P3-5: リリース
  ├── 本番環境デプロイ
  ├── DNS設定確認
  ├── SSL確認
  ├── 最終動作確認
  └── リリースアナウンス準備
```

---

## 3. 開発タイムライン

```
┌─────────────────────────────────────────────────────────────────┐
│                      開発タイムライン                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 0        Week 1        Week 2        Week 3               │
│  ├────────────┼────────────┼────────────┼────────────┤          │
│  │  Phase 0   │         Phase 1: MVP                │          │
│  │  環境構築  │  認証+UI   │  AIチャット │   課金    │          │
│  │            │            │             │           │          │
│                                                                 │
│  Week 4        Week 5        Week 6                             │
│  ├────────────┼────────────┼────────────┤                       │
│  │      Phase 2: 拡張      │  Phase 3   │                       │
│  │  診断+履歴 │ ポイント+UX │ 本番準備   │                       │
│  │            │            │            │                       │
│                                                                 │
│  ────────────────────────────────────────────────────────────  │
│                                                                 │
│  マイルストーン:                                                 │
│  ・Week 0末: 開発環境完成、RAG動作確認                          │
│  ・Week 3末: MVP完成、内部テスト開始                            │
│  ・Week 5末: 拡張機能完成                                       │
│  ・Week 6末: 本番リリース                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. ディレクトリ構造

```
tape-ai/
├── .env.local                    # 環境変数（ローカル）
├── .env.example                  # 環境変数テンプレート
├── next.config.js                # Next.js設定
├── tailwind.config.js            # Tailwind設定
├── tsconfig.json                 # TypeScript設定
├── package.json
│
├── public/
│   ├── images/
│   └── fonts/
│
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ランディングページ
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/               # 認証グループ
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (app)/                # アプリグループ（要認証）
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── chat/
│   │   │   │   ├── [category]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── history/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   ├── diagnosis/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [type]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── result/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx
│   │   │   ├── points/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── api/                  # API Routes
│   │       ├── auth/
│   │       │   └── [...supabase]/
│   │       │       └── route.ts
│   │       ├── chat/
│   │       │   └── route.ts
│   │       ├── sessions/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── diagnosis/
│   │       │   ├── types/
│   │       │   │   └── route.ts
│   │       │   └── [type]/
│   │       │       └── route.ts
│   │       ├── subscription/
│   │       │   └── route.ts
│   │       ├── points/
│   │       │   ├── route.ts
│   │       │   └── purchase/
│   │       │       └── route.ts
│   │       ├── user/
│   │       │   └── profile/
│   │       │       └── route.ts
│   │       └── webhook/
│   │           └── stripe/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui コンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/               # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── chat/                 # チャットコンポーネント
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageItem.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── StreamingMessage.tsx
│   │   │
│   │   ├── diagnosis/            # 診断コンポーネント
│   │   │   ├── DiagnosisCard.tsx
│   │   │   ├── QuestionForm.tsx
│   │   │   └── ResultDisplay.tsx
│   │   │
│   │   ├── subscription/         # 課金コンポーネント
│   │   │   ├── PlanCard.tsx
│   │   │   ├── PointsDisplay.tsx
│   │   │   └── UsageBar.tsx
│   │   │
│   │   └── common/               # 共通コンポーネント
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── Avatar.tsx
│   │       └── Modal.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # ブラウザ用クライアント
│   │   │   ├── server.ts         # サーバー用クライアント
│   │   │   └── admin.ts          # Admin用クライアント
│   │   │
│   │   ├── anthropic/
│   │   │   ├── client.ts         # Claude APIクライアント
│   │   │   └── prompts.ts        # システムプロンプト定義
│   │   │
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── config.ts
│   │   │
│   │   ├── rag/
│   │   │   ├── search.ts         # ベクトル検索
│   │   │   └── embed.ts          # Embedding生成
│   │   │
│   │   └── utils/
│   │       ├── tokens.ts         # トークン計算
│   │       ├── date.ts
│   │       └── validation.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useSubscription.ts
│   │   └── usePoints.ts
│   │
│   ├── store/                    # Zustand Store
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── database.ts           # Supabase型定義
│   │   ├── chat.ts
│   │   ├── diagnosis.ts
│   │   └── subscription.ts
│   │
│   └── constants/
│       ├── plans.ts              # 料金プラン定義
│       ├── diagnosis.ts          # 診断定義
│       └── categories.ts         # カテゴリ定義
│
├── supabase/
│   ├── migrations/               # DBマイグレーション
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_pgvector.sql
│   │   └── ...
│   └── seed.sql                  # 初期データ
│
├── scripts/
│   ├── setup-knowledge.ts        # ナレッジ登録スクリプト
│   └── generate-embeddings.ts    # Embedding生成スクリプト
│
└── knowledge/
    └── tape_psychology.md        # ナレッジソース
```

---

## 5. Claude Code 開発ガイド

### 5.1 開発開始時のプロンプト例

```
# プロジェクト開始
「TapeAIというNext.js 14のプロジェクトを作成してください。
App Router、TypeScript、Tailwind CSS、shadcn/uiを使用します。
要件定義書はtape_ai_requirements.mdにあります。」

# Phase 0 開始
「Phase 0の環境構築を始めます。
まずNext.js 14プロジェクトを作成し、
TypeScript、Tailwind CSS、shadcn/uiをセットアップしてください。」

# Supabase設定
「Supabaseのデータベーススキーマを作成してください。
要件定義書のER図に基づいて、
users, sessions, messages, subscriptions, user_points, diagnoses, knowledge
テーブルを作成するマイグレーションファイルを生成してください。」

# RAG実装
「RAG機能を実装してください。
1. tape_psychology_knowledge.mdを読み込む
2. チャンクに分割する（1000文字、200文字オーバーラップ）
3. OpenAI Embeddingでベクトル化
4. Supabase pgvectorに保存
5. 類似検索関数を実装」

# チャットAPI実装
「/api/chat のエンドポイントを実装してください。
1. ユーザー認証チェック
2. RAGで関連ナレッジを検索
3. カテゴリに応じたシステムプロンプト選択
4. Claude APIでストリーミング応答
5. メッセージをDBに保存
6. トークン数を計算して返却」
```

### 5.2 トラブルシューティング

```
# ビルドエラー時
「以下のエラーが発生しています。修正してください。
[エラーメッセージをペースト]」

# 型エラー時
「TypeScriptの型エラーを修正してください。
Supabaseの型定義を supabase gen types で生成し、
types/database.tsに配置してください。」

# パフォーマンス問題時
「チャットの応答が遅いです。
以下を確認・改善してください：
1. RAG検索の速度
2. ストリーミングの実装
3. 不要なレンダリング」
```

---

## 6. 環境変数

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# OpenAI (Embedding用)
OPENAI_API_KEY=sk-xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (Email)
RESEND_API_KEY=re_xxxxx
```

---

## 7. 主要コード例

### 7.1 RAG検索

```typescript
// src/lib/rag/search.ts
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI();

export async function searchKnowledge(query: string, topK: number = 5) {
  // クエリをベクトル化
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Supabaseで類似検索
  const supabase = createClient();
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: topK,
  });

  if (error) throw error;
  return data;
}
```

### 7.2 チャットAPI

```typescript
// src/app/api/chat/route.ts
import { anthropic } from '@/lib/anthropic/client';
import { searchKnowledge } from '@/lib/rag/search';
import { getSystemPrompt } from '@/lib/anthropic/prompts';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createClient();
  
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { message, category, sessionId } = await request.json();

  // RAG検索
  const knowledge = await searchKnowledge(message);
  const context = knowledge.map(k => k.content).join('\n\n');

  // システムプロンプト取得
  const systemPrompt = getSystemPrompt(category, context);

  // ストリーミング応答
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  });

  // Server-Sent Events形式で返却
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const text = event.delta.text;
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        );
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
}
```

### 7.3 システムプロンプト

```typescript
// src/lib/anthropic/prompts.ts

const BASE_PROMPT = `
あなたはテープ式心理学に基づいた心理カウンセラーです。

## あなたの役割
あなたは「鏡」です。アドバイザーではありません。
クライアントが自分自身の心と向き合い、自ら気づき、自ら解放できるよう支援します。

## 根本的な信念
- 答えは100%クライアント本人が知っている
- カウンセラーは何もできない、何もしていない、無力である
- ネガティブは自分で選んでいる

## すべきこと
- 聴く
- 「何を感じている？」と問いかける
- 感情を言葉にして返す
- 待つ

## してはいけないこと
- アドバイス
- 決めつけ
- 救済者になる
- 判断する
`;

const CATEGORY_PROMPTS = {
  love: `
## 恋愛相談モード
恋愛の悩みに特化して対応します。
失恋、片思い、復縁、関係の悩みなど。
恋愛における無価値観、見捨てられ不安、依存関係に注目してください。
`,
  life: `
## 人生相談モード
人生の大きな悩みに対応します。
将来不安、生きる意味、キャリアなど。
「生きる意味は探さなくていい」「今日生きててよかったと思えればいい」を伝えてください。
`,
  relationship: `
## 人間関係相談モード
対人関係の悩みに対応します。
職場、家族、友人関係など。
境界線の大切さを伝えてください。
`,
};

export function getSystemPrompt(category: string, ragContext: string): string {
  const categoryPrompt = CATEGORY_PROMPTS[category] || '';
  
  return `
${BASE_PROMPT}

${categoryPrompt}

## 参考知識（テープ式心理学より）
${ragContext}

上記の知識を参考に、鏡として対話してください。
ただし、知識をそのまま説明するのではなく、対話の中で自然に活用してください。
`;
}
```

---

## 8. リリースチェックリスト

### MVP リリース前

```
□ 機能チェック
  □ 新規登録・ログインできる
  □ 3カテゴリでチャットできる
  □ RAGが正しく機能している
  □ 応答が自然（テープ式心理学らしい）
  □ 無料枠が機能する
  □ サブスク購入できる
  □ 履歴が保存される

□ 品質チェック
  □ 主要ブラウザで動作確認（Chrome, Safari, Firefox）
  □ モバイル表示確認
  □ ページ読み込み速度 < 3秒
  □ エラー時の表示が適切

□ セキュリティ
  □ 認証が正しく機能
  □ 他人のデータにアクセスできない
  □ HTTPSが有効
  □ API キーが露出していない

□ 法務
  □ 利用規約ページ
  □ プライバシーポリシーページ
  □ 特定商取引法表記

□ 運用
  □ エラー監視設定（Sentry）
  □ アナリティクス設定
  □ バックアップ確認
```

---

## 9. 次のアクション

### 今すぐ始める場合

```
1. このファイルを保存
2. Claude Code を開く
3. 以下のプロンプトで開始：

「TapeAIプロジェクトを開始します。
tape_ai_requirements.md と tape_ai_development_plan.md を参照してください。
まず Phase 0 の P0-1: プロジェクト初期化 から始めます。
Next.js 14 プロジェクトを作成してください。」
```

### 準備が必要なもの

```
□ Supabase アカウント作成
□ Anthropic API キー取得
□ OpenAI API キー取得（Embedding用）
□ Stripe アカウント作成
□ Vercel アカウント作成
□ ドメイン取得（任意）
```

---

*Document Version: 1.0*
*Created: 2025-11-26*
