# ai-boss-tray (プロトタイプ)

Macのメニューバーに常駐し、音声→タスク化→ダッシュボードをつなぐアプリ。

## 現状の実装状態

| 領域 | 状態 |
|---|---|
| トレイ常駐・メニュー | ✅ 骨格 |
| グローバルショートカット(⌃⌥T) | ✅ |
| タスクDB(JSON永続化) | ✅ |
| ポップアップUI(録音ボタン + 一覧) | ✅ スタブ |
| 実音声録音(MediaRecorder) | ❌ |
| 文字起こし(Whisper) | ❌ |
| Claudeに投げて構造化 | ❌ |
| Git/Teams/メール連携 | ❌ |

## 起動(開発環境)

```bash
cd apps/tray
npm install
npm run start
```

## ディレクトリ構造

```
apps/tray/
├─ src/main.ts       # Electronメインプロセス / トレイ / ショートカット
├─ src/preload.ts    # contextBridge で aiBoss API を公開
├─ src/tasks-db.ts   # JSON永続ストア
└─ ui/               # ポップアップUI(HTML/JS)
```

## 次の一手

1. `MediaRecorder` で録音ファイルを `app.getPath('userData')/recordings/` に保存
2. OpenAI Whisperまたはwhisper.cppで文字起こし
3. Claudeに投げて `{box, title, dueDate, assignee, dod}` を構造化
4. `task:add` で永続化
