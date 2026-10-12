(() => {
  const categories = ['自己分析', '企業分析', '選考対策'];
  const registerUrl = 'https://me-mories.jp/';
  const advice = {
    自己分析: `・あなたが今やるべきことは...「自己分析 」です！

・自己分析は特に下記が重要です！
＞過去のエピソードを様々な角度から深堀り，整理する
＞過去の経験を踏まえて自分のやりたいことや強みを整理する
＞上記は一人では限界あるためとにかく人と対話する

・TKFで「自己分析」を進めてみよう！
＞複数のメンターと1対1面談がし放題！
＞先輩だけでなく他の29卒とも交流できる！

・TKFを使いたい方は下記ボタンから登録！`,
    企業分析: `・あなたが今やるべきことは...「企業分析」です！

企業分析は特に下記が重要です！
＞業界・企業を比較し、それぞれの特徴や違いを整理する
＞「なぜ同業他社ではなく、この企業なのか」を言語化する
＞情報の分析や言語化は周囲の人と壁打ちして進めることが重要

・TKFで「企業分析」を進めてみよう！
＞志望業界の内定者のメンターと面談して、内定者の声を通じて企業理解を深めよう！
＞合同説明会や個社イベントを有効活用しよう！

・TKFを使いたい方は下記ボタンから登録！`,
    選考対策: `・あなたが今やるべきことは...「選考対策」です！

・選考対策は特に下記が重要です！
＞ES・Webテスト・GD・面接など、各選考に向けた準備を進める
＞選考後に「できたこと・できなかったこと」を振り返り、次の選考に活かす
＞一人で対策するだけでなく、他の人からフィードバックをもらいながら改善する

・TKFで「選考対策」を進めてみよう！
＞メンターとの1対1面談で、ES添削や面接練習ができる！
＞GD練習や選考対策イベントを活用して、実践経験を積もう！

・TKFを使いたい方は下記ボタンから登録！`,
    perfect: `・あなたの就活準備は...「満点」です！🎉

・自己分析・企業分析・選考対策をバランスよく進められています！
＞これまで取り組んできた内容を継続し、さらに精度を高める
＞自分一人では気づけない視点を得るため、さまざまな人と話してみる
＞周囲からフィードバックをもらいながら、自分の考えや選考対策をさらにブラッシュアップする

・TKFを使って、さらに就活を前に進めよう！
＞複数のメンターと面談して、さまざまな視点やアドバイスをもらおう！
＞他の就活生や内定者との交流を通して、新しい情報や考え方を吸収しよう！

・TKFを使いたい方は下記ボタンから登録！`,
  };

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function init(root) {
    const allQuestions = JSON.parse(root.dataset.questions || '[]');
    const selectedQuestions = categories.flatMap((category) => {
      const inCategory = allQuestions.filter(
        (question) => question.category === category
      );
      return shuffle(inCategory).slice(0, 3);
    });
    const questions = shuffle(selectedQuestions);

    if (questions.length !== 9) {
      root.textContent = '問題を読み込めませんでした。';
      return;
    }

    let current = 0;
    let answers = Array(questions.length).fill(null);

    function renderResult() {
      const scores = Object.fromEntries(categories.map((category) => [category, 0]));
      answers.forEach((answer, index) => {
        scores[questions[index].category] += answer + 1;
      });

      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      const perfect = answers.every((answer) => answer === 3);
      const lowestScore = Math.min(...Object.values(scores));
      const lowestCategories = categories.filter(
        (category) => scores[category] === lowestScore
      );

      root.innerHTML = `
        <div class="jhc-card jhc-result">
          <h2>診断結果</h2>
          <p class="jhc-score"></p>
          <ul class="jhc-category-scores"></ul>
          <section class="jhc-result-advice"></section>
          <a class="jhc-register" hidden>TKFに登録する</a>
          <button type="button" class="jhc-retry">もう一度診断する</button>
        </div>`;

      root.querySelector('.jhc-score').textContent =
        `合計 ${totalScore} / 36点`;
      const scoreList = root.querySelector('.jhc-category-scores');
      categories.forEach((category) => {
        const item = document.createElement('li');
        item.textContent = `${category}：${scores[category]} / 12点`;
        scoreList.appendChild(item);
      });

      const resultAdvice = root.querySelector('.jhc-result-advice');
      const resultText = perfect
        ? advice.perfect
        : lowestCategories.map((category) => advice[category]).join('\n\n');
      const paragraph = document.createElement('p');
      paragraph.className = 'jhc-advice';
      paragraph.textContent = resultText;
      resultAdvice.appendChild(paragraph);

      const registerLink = root.querySelector('.jhc-register');
      registerLink.href = registerUrl;
      registerLink.target = '_blank';
      registerLink.rel = 'noopener noreferrer';
      registerLink.hidden = false;

      root.querySelector('.jhc-retry').addEventListener('click', () => {
        current = 0;
        answers = Array(questions.length).fill(null);
        render();
      });
    }

    function render() {
      if (current === questions.length) {
        renderResult();
        return;
      }

      const question = questions[current];
      root.innerHTML = `
        <div class="jhc-card">
          <p class="jhc-progress"></p>
          <p class="jhc-category"></p>
          <h2 class="jhc-title"></h2>
          <div class="jhc-options"></div>
          <div class="jhc-actions">
            <button type="button" class="jhc-back">戻る</button>
            <button type="button" class="jhc-next">次へ</button>
          </div>
        </div>`;

      root.querySelector('.jhc-progress').textContent =
        `QUESTION ${current + 1} / ${questions.length}`;
      root.querySelector('.jhc-category').textContent = question.category;
      root.querySelector('.jhc-title').textContent = question.question;

      const options = root.querySelector('.jhc-options');
      question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jhc-option';
        button.textContent = `${['①', '②', '③', '④'][index]} ${choice}`;
        button.setAttribute('aria-pressed', String(answers[current] === index));
        button.addEventListener('click', () => {
          answers[current] = index;
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
      next.textContent = current === questions.length - 1 ? '結果を見る' : '次へ';
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
