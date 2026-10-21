# Jobhunting Compass

WordPress 上で動作する「就活現在地診断」プラグインです。自己分析・企業分析・選考対策の準備状況を診断し、回答結果に応じた次のアクションを案内します。

## 主な機能

- 自己分析・企業分析・選考対策の各分野から、毎回ランダムに3問ずつ出題します（全9問）。
- 各質問は4段階で回答し、①〜④を1〜4点として集計します。
- 結果画面に合計点と分野別の点数を表示し、最も点数が低い分野に合わせた案内を1つ表示します。
- 最低点が自己分析・企業分析の同点なら自己分析、企業分析・選考対策の同点なら選考対策を案内します。
- 自己分析・選考対策の同点と3分野同点は、日本時間の10月〜3月末は選考対策、4月〜9月末は自己分析を案内します。
- すべての質問で④を選んだ場合は、満点向けの案内を表示します。
- 結果画面の登録ボタンから [me-mories.jp](https://me-mories.jp/) へ移動できます。
- 回答を戻って変更できます。「もう一度診断する」で回答をリセットし、次の開始時に再抽選します。
- TKFの紺・オレンジを使ったカードと黄色いキャラクターのイラストで構成し、開始画面の説明を最小限にしています。
- 診断内の見出しはテーマの背景・罫線・装飾を解除し、白いカード上で文字を読めるようにしています。

## ローカルでの確認

WordPressを起動せず、同じ質問データ・CSS・JavaScriptで画面を確認できます。Node.js 24とPython 3で確認しています。

```bash
node tools/build-preview.cjs
python -m http.server 8776 --bind 127.0.0.1
```

ブラウザで `http://127.0.0.1:8776/preview.html` を開いてください。生成した `preview.html` はGit管理対象外です。プレビューの外側の背景は確認用であり、WordPressではページのテーマが適用されます。

```bash
node --check assets/quiz.js
node --test --test-isolation=none tests/diagnostic.test.cjs
```

質問・選択肢と結果文は「【HP魔改造班】 就活現在地診断.xlsx」の「28卒」A2:C16と「結果の文章」A3:B6に照合済みです。Excelの結果文は全文を保持しています。数値による点数帯はExcelに定義されていないため、上記の最低点の分野・同点・満点の規則を使用します。「29卒以降」シートには質問の記載がありません。

初版の検証内容と画面例は [verification/TESTING.md](verification/TESTING.md)、季節別の同点処理と見出し修正の検証は [verification/SEASONAL-FIX.md](verification/SEASONAL-FIX.md) にまとめています。

## 技術スタック

| 技術 | 用途 |
| --- | --- |
| PHP | WordPress との連携、質問データの出力 |
| JavaScript | 出題、回答処理、採点、結果表示 |
| CSS | 診断画面のスタイル |
| GitHub | ソースコード管理 |
| GitHub Actions | 構文チェックとデプロイ通知 |
| Git Updater | WordPress プラグインの GitHub からの更新 |

## リポジトリとファイル構成

- GitHub: [sorakondo/jobhunting-compass](https://github.com/sorakondo/jobhunting-compass)
- プラグイン本体とショートコード登録: `jobhunting-compass.php`
- 質問データ: `includes/questions.php`
- 出題・回答・採点: `assets/quiz.js`
- 画面スタイル: `assets/quiz.css`
- デプロイワークフロー: `.github/workflows/deploy.yml`

## WordPress への設置

プラグインを WordPress に導入して有効化した後、診断を表示したい固定ページに次のショートコードを設置します。

```text
[jobhunting_compass]
```

CSS と JavaScript は、このショートコードを含むページで読み込まれます。

## デプロイ

`main` ブランチへの push、または GitHub Actions からの手動実行で `.github/workflows/deploy.yml` が起動します。

1. リポジトリをチェックアウトします。
2. すべての PHP ファイルを `php -l` で構文チェックします。
3. `assets` 内の JavaScript ファイルを `node --check` で構文チェックします。
4. Git Updater の REST API を呼び出し、WordPress 側に `main` ブランチの対象コミットの更新を要求します。
5. API の応答で `success` が `true` であることを確認します。

Git Updater の更新 API は次の URL です。

```text
https://tkf-school.com/wp-json/git-updater/v1/update/
```

GitHub Actions の Repository Secret に `GIT_UPDATER_KEY` を登録してください。このキーは API 呼び出しの認証に使用されます。認証キーやパスワードをソースコードに書いたり、コミットしたりしないでください。Git Updater を使って更新するため、通常のデプロイにサーバーへの SSH 接続は不要です。

ワークフローは PHP・JavaScript の構文と更新 API の応答を確認します。診断画面が実際の WordPress 上で正しく表示・動作することまでは確認しないため、デプロイ後はサイト上でも表示を確認してください。

## 開発・更新

変更を `main` ブランチに push すると、自動で構文チェックとデプロイ処理が実行されます。

```bash
git add .
git commit -m "変更内容"
git push origin main
```

GitHub の [Actions](https://github.com/sorakondo/jobhunting-compass/actions) タブで実行状況を確認できます。GitHub CLI を利用する場合は、実行中のワークフローを次のコマンドで追跡できます。

```bash
gh run watch
```

## 運用上の注意

- `main` ブランチへの push で本番サイトへの更新処理が始まります。push 前に変更内容を確認してください。
- プラグインのバージョンを変更する場合は、`jobhunting-compass.php` のヘッダーにある `Version` も更新してください。
- Git Updater の設定と API キーは、それぞれ WordPress 管理画面と GitHub Actions の Secret で管理してください。
- このリポジトリは Public です。API キー、パスワード、個人情報などの機密情報をコミットしないでください。
- WordPress 管理画面の設定やデータベース内のデータは GitHub では管理されません。必要に応じて別途バックアップしてください。
- Actions の成功は構文チェックと更新 API の応答を示します。画面上の動作確認とは別に行ってください。

## 関連リンク

- [WordPress サイト](https://tkf-school.com/)
- [GitHub リポジトリ](https://github.com/sorakondo/jobhunting-compass)
- [GitHub Actions](https://github.com/sorakondo/jobhunting-compass/actions)
- [Git Updater](https://git-updater.com/)
