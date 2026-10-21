(() => {
  const categories = ['自己分析', '企業分析', '選考対策'];
  const registerUrl = 'https://me-mories.jp/';
  const japanMonth = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric' });
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
これまでの取り組みを継続しながら、周囲からのフィードバックを取り入れ、自分の考えや選考対策をさらにブラッシュアップしていきましょう！

・TKFを使って、さらに就活を前に進めよう！
＞複数のメンターと面談して、さまざまな視点やアドバイスをもらおう！
＞他の就活生や内定者との交流を通して、新しい情報や考え方を吸収しよう！

・TKFを使いたい方は下記ボタンから登録！`,
  };

  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function selectQuestions(allQuestions, random = Math.random) {
    const selected = categories.flatMap(category => {
      const pool = allQuestions.filter(question => question.category === category);
      if (pool.length < 3 || pool.some(question => !question.question ||
        !Array.isArray(question.choices) || question.choices.length !== 4)) {
        throw new Error('質問データを確認してください。');
      }
      return shuffle(pool, random).slice(0, 3);
    });
    return shuffle(selected, random);
  }

  function createSession(allQuestions, random = Math.random) {
    const questions = selectQuestions(allQuestions, random);
    return { questions, current: 0, answers: Array(questions.length).fill(null) };
  }

  function calculateResult(questions, answers) {
    if (questions.length !== 9 || answers.length !== 9 ||
      Array.from(answers).some(answer => !Number.isInteger(answer) || answer < 0 || answer > 3) ||
      categories.some(category => questions.filter(question => question.category === category).length !== 3)) {
      throw new Error('9問すべてへの回答が必要です。');
    }
    const scores = Object.fromEntries(categories.map(category => [category, 0]));
    answers.forEach((answer, index) => { scores[questions[index].category] += answer + 1; });
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const lowestScore = Math.min(...Object.values(scores));
    return {
      scores, totalScore,
      perfect: answers.every(answer => answer === 3),
      lowestCategories: categories.filter(category => scores[category] === lowestScore),
    };
  }

  function getRecommendedCategory(result, date = new Date()) {
    if (result.perfect) return null;
    const lowest = result.lowestCategories;
    if (lowest.length === 1) return lowest[0];
    if (!lowest.includes('選考対策')) return '自己分析';
    if (!lowest.includes('自己分析')) return '選考対策';
    const month = Number(japanMonth.format(date));
    return month >= 10 || month <= 3 ? '選考対策' : '自己分析';
  }

  function getAdvice(result, date = new Date()) {
    return [result.perfect ? advice.perfect : advice[getRecommendedCategory(result, date)]];
  }

  let instanceCount = 0;
  function init(root) {
    const allQuestions = JSON.parse(root.dataset.questions || '[]');
    // Validate the question pool before offering a diagnostic.
    selectQuestions(allQuestions);
    let session = null;
    const instance = 'jhc-' + (++instanceCount);
    root.innerHTML = [
      '<section class="jhc-card jhc-start" aria-labelledby="' + instance + '-start">',
        '<p class="jhc-wordmark"><strong>TKF</strong> school</p>',
        '<div class="jhc-hero"><div><h2 id="' + instance + '-start" class="jhc-start-title" tabindex="-1">就活の<br>現在地診断</h2>',
        '<p class="jhc-meta">全9問 · 約3分</p></div><img class="jhc-notebook" alt="" width="220" height="220"></div>',
        '<button class="jhc-start-button jhc-primary" type="button">診断を始める <span aria-hidden="true">→</span></button>',
        '<ul class="jhc-topics"><li>自己分析</li><li>企業分析</li><li>選考対策</li></ul>',
      '</section>',
      '<section class="jhc-card jhc-question" aria-labelledby="' + instance + '-question" hidden>',
        '<div class="jhc-progress-row"><p class="jhc-progress"></p><p class="jhc-progress-count"></p></div>',
        '<div class="jhc-progress-bar" role="progressbar" aria-label="回答の進捗" aria-valuemin="0" aria-valuemax="9" aria-valuenow="0"><span class="jhc-progress-fill"></span></div>',
        '<p class="jhc-category"></p><h2 id="' + instance + '-question" class="jhc-title" tabindex="-1"></h2>',
        '<div class="jhc-options" role="group" aria-labelledby="' + instance + '-question"></div>',
        '<div class="jhc-actions"><button type="button" class="jhc-back jhc-secondary">戻る</button><button type="button" class="jhc-next jhc-primary" disabled>次へ</button></div>',
      '</section>',
      '<section class="jhc-card jhc-result" aria-labelledby="' + instance + '-result" hidden>',
        '<h2 id="' + instance + '-result" class="jhc-result-title" tabindex="-1">診断結果</h2>',
        '<p class="jhc-score"></p><div class="jhc-category-scores"></div>',
        '<div class="jhc-result-advice"></div>',
        '<a class="jhc-register jhc-primary">TKFに登録する <span aria-hidden="true">↗</span><span class="jhc-sr-only">（新しいタブで開きます）</span></a>',
        '<button type="button" class="jhc-retry">もう一度診断する</button>',
      '</section>',
      '<p class="jhc-status jhc-sr-only" role="status" aria-live="polite" aria-atomic="true"></p>',
    ].join('');
    const find = selector => root.querySelector(selector);
    const illustration = find('.jhc-notebook');
    if (root.dataset.illustration) illustration.src = root.dataset.illustration;
    else illustration.hidden = true;
    const register = find('.jhc-register');
    register.href = registerUrl;
    register.target = '_blank';
    register.rel = 'noopener noreferrer';
    const status = find('.jhc-status');

    function showScreen(name, focusHeading = true) {
      ['start', 'question', 'result'].forEach(screen => {
        find('.jhc-' + screen).hidden = screen !== name;
      });
      if (focusHeading) {
        const heading = find('.jhc-' + name + ' h2');
        heading.focus({ preventScroll: true });
        root.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    }

    function updateAnswer() {
      const answer = session.answers[session.current];
      find('.jhc-options').querySelectorAll('button').forEach((button, index) => {
        const selected = answer === index;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('selected', selected);
      });
      find('.jhc-next').disabled = answer === null;
      const completed = session.answers.filter(value => value !== null).length;
      find('.jhc-progress-count').textContent = completed + ' / 9 回答済み';
      find('.jhc-progress-bar').setAttribute('aria-valuenow', String(completed));
      find('.jhc-progress-bar').setAttribute('aria-valuetext', '9問中' + completed + '問回答済み');
      find('.jhc-progress-fill').style.width = completed / 9 * 100 + '%';
    }

    function renderQuestion() {
      const question = session.questions[session.current];
      find('.jhc-progress').textContent = (session.current + 1) + '問目 / 9問';
      find('.jhc-category').textContent = question.category;
      find('.jhc-title').textContent = question.question;
      const options = find('.jhc-options');
      options.replaceChildren();
      question.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'jhc-option';
        const number = document.createElement('span');
        number.className = 'jhc-option-number';
        number.setAttribute('aria-hidden', 'true');
        number.textContent = String(index + 1);
        const label = document.createElement('span');
        label.className = 'jhc-option-label';
        label.textContent = choice;
        button.append(number, label);
        button.addEventListener('click', () => {
          session.answers[session.current] = index;
          updateAnswer();
          status.textContent = (index + 1) + '番を選択しました。';
        });
        options.append(button);
      });
      find('.jhc-back').disabled = session.current === 0;
      find('.jhc-next').textContent = session.current === 8 ? '結果を見る' : '次へ';
      status.textContent = '';
      updateAnswer();
      showScreen('question');
    }

    function renderResult() {
      const result = calculateResult(session.questions, session.answers);
      const resultDate = new Date();
      find('.jhc-score').textContent = '合計 ' + result.totalScore + ' / 36点';
      const list = find('.jhc-category-scores');
      list.replaceChildren();
      categories.forEach(category => {
        const row = document.createElement('div');
        row.className = 'jhc-score-item';
        const header = document.createElement('div');
        header.className = 'jhc-score-header';
        const label = document.createElement('span');
        label.textContent = category;
        const score = document.createElement('strong');
        score.textContent = result.scores[category] + ' / 12点';
        const track = document.createElement('div');
        track.className = 'jhc-score-track';
        track.setAttribute('aria-hidden', 'true');
        const fill = document.createElement('span');
        fill.style.width = result.scores[category] / 12 * 100 + '%';
        header.append(label, score);
        track.append(fill);
        row.append(header, track);
        list.append(row);
      });
      const messages = find('.jhc-result-advice');
      messages.replaceChildren();
      getAdvice(result, resultDate).forEach(text => {
        const section = document.createElement('section');
        section.className = 'jhc-advice-card';
        // Preserve all Excel wording. Separate the leading result line for hierarchy.
        const lines = text.split('\n');
        const title = document.createElement('h3');
        title.textContent = lines.shift();
        const paragraph = document.createElement('p');
        paragraph.className = 'jhc-advice';
        paragraph.textContent = lines.join('\n').trim();
        section.append(title, paragraph);
        messages.append(section);
      });
      showScreen('result');
      status.textContent = '診断結果。合計' + result.totalScore + '点。' +
        (result.perfect ? '満点です。' : getRecommendedCategory(result, resultDate) + 'を案内します。');
    }

    find('.jhc-start-button').addEventListener('click', () => {
      session = createSession(allQuestions);
      renderQuestion();
    });
    find('.jhc-back').addEventListener('click', () => {
      if (!session || session.current === 0) return;
      session.current--;
      renderQuestion();
    });
    find('.jhc-next').addEventListener('click', () => {
      if (!session || session.answers[session.current] === null) return;
      if (session.current === 8) renderResult();
      else {
        session.current++;
        renderQuestion();
      }
    });
    find('.jhc-retry').addEventListener('click', () => {
      session = null;
      find('.jhc-options').replaceChildren();
      find('.jhc-category-scores').replaceChildren();
      find('.jhc-result-advice').replaceChildren();
      find('.jhc-score').textContent = '';
      find('.jhc-progress-fill').style.width = '0%';
      find('.jhc-progress-bar').setAttribute('aria-valuenow', '0');
      find('.jhc-progress-bar').setAttribute('aria-valuetext', '9問中0問回答済み');
      find('.jhc-progress-count').textContent = '';
      find('.jhc-next').disabled = true;
      showScreen('start');
      status.textContent = '回答をリセットしました。';
    });
    showScreen('start', false);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { categories, advice, registerUrl, shuffle, selectQuestions, createSession, calculateResult, getRecommendedCategory, getAdvice };
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.jhc-app').forEach(root => {
        try { init(root); }
        catch {
          root.textContent = '診断を読み込めませんでした。ページを再読み込みしてください。';
        }
      });
    });
  }
})();
