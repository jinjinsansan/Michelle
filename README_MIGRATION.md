# Assistants API 移行手順

Assistants API への移行を完了するには、以下の手順を実行してください。

## 1. 環境変数の設定

`.env.local` ファイルを開き、以下の行を追加（または更新）してください。
今回作成したAssistantのIDです。

```env
ASSISTANT_ID=asst_l2JEignTzzXF2a9PL6jgIsV9
```

## 2. データベースの更新

Supabaseのダッシュボード（SQL Editor）で、以下のSQLを実行して `sessions` テーブルにカラムを追加してください。
※これを実行しないとエラーになります。

```sql
alter table "public"."sessions" add column "openai_thread_id" text;
```

## 3. 完了確認

サーバーを再起動して、チャット機能が正常に動作することを確認してください。
- RAG（検索機能）がAssistants APIを通じて自動的に行われます。
- 履歴はOpenAIのスレッドで管理されます。

以上です。
