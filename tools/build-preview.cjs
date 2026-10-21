// Render the shortcode's data wrapper for local preview without WordPress.
// Only the repository's known PHP question-array syntax is accepted.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../includes/questions.php'), 'utf8');
const questionPattern = /\[\s*'category'\s*=>\s*'([^']+)'\s*,\s*'question'\s*=>\s*'([^']+)'\s*,\s*'choices'\s*=>\s*\[([\s\S]*?)\]\s*,?\s*\]/g;
const questions = [...source.matchAll(questionPattern)].map(match => ({
  category: match[1],
  question: match[2],
  choices: [...match[3].matchAll(/'((?:\\.|[^'\\])*)'/g)]
    .map(choice => choice[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\')),
}));
if (questions.length !== 15 || questions.some(question => question.choices.length !== 4)) {
  throw new Error('PHPの質問定義を読み込めませんでした。');
}
const escapeAttribute = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;');
const withTheme = process.argv.includes('--theme');
const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>就活現在地診断 | TKF school</title><link rel="icon" href="data:,"><link rel="stylesheet" href="assets/quiz.css">${withTheme ? '<link rel="stylesheet" href="tools/theme-heading-fixture.css">' : ''}<style>body{margin:0;padding:16px;background:#f6f7fa}</style><script src="assets/quiz.js" defer></script></head>
<body><main class="post_content">${withTheme ? '<h2 class="theme-outside-heading">テーマ側の見出し（検証用）</h2>' : ''}<div class="jhc-app" data-questions="${escapeAttribute(JSON.stringify(questions))}" data-illustration="assets/career-notebook.svg"></div></main></body></html>\n`;
if (require.main === module) {
  const output = withTheme ? 'preview-theme.html' : 'preview.html';
  fs.writeFileSync(path.join(__dirname, '..', output), html);
  console.log(output + ' を生成しました。');
}
module.exports = questions;
