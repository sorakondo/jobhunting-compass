

(() => {
  const stages = [
    {
      title: 'スタートライン',
      advice: '就活の基本的な用語や流れから確認しましょう。',
    },
    {
      title: '準備・探索ステージ',
      advice: '企業研究や自己分析をさらに深めましょう。',
    },
    {
      title: '実践ステージ',
      advice: 'ESや面接の準備を具体的に進めましょう。',
    },
    {
      title: '就活マスターステージ',
      advice: '基礎知識は十分です。実践経験を積みましょう。',
    },
  ];

  function init(root) {
    const questions = JSON.parse(root.dataset.questions || '[]');

    if (!questions.length) {
      root.textContent = '問題を読み込めませんでした。';
      return;
    }

    let current = 0;
    let answers = Array(questions.length).fill(null);

    function render() {
      if (current === questions.length) {
        const score = answers.reduce(
          (sum, answer, i) =>
            sum + Number(answer === questions[i].answer),
          0
        );

        const ratio = score / questions.length;
        const level =
          ratio < 0.4 ? 0 :
          ratio < 0.7 ? 1 :
          ratio < 0.9 ? 2 : 3;

        root.innerHTML = `
          <div class="jhc-card">
            <h2>診断結果</h2>
            <p class="jhc-score"></p>
            <h3 class="jhc-level"></h3>
            <p class="jhc-advice"></p>
            <button type="button" class="jhc-retry">
              もう一度診断する
            </button>
          </div>`;

        root.querySelector('.jhc-score').textContent =
          `${score} / ${questions.length}問正解`;
        root.querySelector('.jhc-level').textContent =
          stages[level].title;
        root.querySelector('.jhc-advice').textContent =
          stages[level].advice;

        root.querySelector('.jhc-retry')
          .addEventListener('click', () => {
            current = 0;
            answers = Array(questions.length).fill(null);
            render();
          });
        return;
      }

      const question = questions[current];

      root.innerHTML = `
        <div class="jhc-card">
          <p class="jhc-progress"></p>
          <h2 class="jhc-title"></h2>
          <div class="jhc-options"></div>
          <div class="jhc-actions">
            <button type="button" class="jhc-back">戻る</button>
            <button type="button" class="jhc-next">次へ</button>
          </div>
        </div>`;

      root.querySelector('.jhc-progress').textContent =
        `QUESTION ${current + 1} / ${questions.length}`;

      root.querySelector('.jhc-title').textContent =
        question.question;

      const options = root.querySelector('.jhc-options');

      question.choices.forEach((choice, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jhc-option';
        button.textContent =
          `${String.fromCharCode(65 + i)}. ${choice}`;

        button.setAttribute(
          'aria-pressed',
          String(answers[current] === i)
        );

        button.addEventListener('click', () => {
          answers[current] = i;
          render();
        });

        options.appendChild(button);
      });

      const back = root.querySelector('.jhc-back');
      back.hidden = current === 0;
      back.addEventListener('click', () => {
        current--;
        render();
      });

      const next = root.querySelector('.jhc-next');
      next.textContent =
        current === questions.length - 1
          ? '結果を見る' : '次へ';

      next.disabled = answers[current] === null;

      next.addEventListener('click', () => {
        current++;
        render();
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.jhc-app').forEach(init);
  });
})();
