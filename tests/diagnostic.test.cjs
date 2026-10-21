const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../tools/build-preview.cjs');
const { categories, advice, registerUrl, selectQuestions, createSession, calculateResult, getRecommendedCategory, getAdvice } = require('../assets/quiz.js');
const winter = new Date('2026-10-21T12:00:00+09:00');
const summer = new Date('2026-04-01T12:00:00+09:00');

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

test('the source pool has 15 questions and 4 ordered choices per question', () => {
  assert.equal(pool.length, 15);
  assert.equal(new Set(pool.map(question => question.question)).size, 15);
  for (const category of categories) assert.equal(pool.filter(question => question.category === category).length, 5);
  assert.ok(pool.every(question => question.choices.length === 4));
});

test('each draw has exactly 3 per category, without repeats or modifying the pool', () => {
  const before = JSON.stringify(pool);
  const seen = new Set();
  const sequences = new Set();
  const positions = new Set();
  for (let seed = 1; seed <= 200; seed++) {
    const draw = selectQuestions(pool, seeded(Math.imul(seed, 0x9e3779b1) >>> 0));
    assert.equal(draw.length, 9);
    assert.equal(new Set(draw).size, 9);
    for (const category of categories) assert.equal(draw.filter(question => question.category === category).length, 3);
    draw.forEach(question => seen.add(question.question));
    sequences.add(draw.map(question => question.question).join('\n'));
    positions.add(draw[0].category);
  }
  assert.equal(seen.size, 15);
  assert.equal(sequences.size, 200);
  assert.equal(positions.size, 3);
  assert.equal(JSON.stringify(pool), before);
});

const grouped = categories.flatMap(category => pool.filter(question => question.category === category).slice(0, 3));

test('four answers score 1 through 4 and each category is out of 12', () => {
  const result = calculateResult(grouped, [0, 1, 2, 1, 2, 3, 2, 3, 3]);
  assert.deepEqual(result.scores, { 自己分析: 6, 企業分析: 9, 選考対策: 11 });
  assert.equal(result.totalScore, 26);
  assert.deepEqual(result.lowestCategories, ['自己分析']);
  assert.deepEqual(getAdvice(result), [advice.自己分析]);
});

test('self/company tie always recommends self analysis', () => {
  const result = calculateResult(grouped, [1, 1, 1, 1, 1, 1, 2, 2, 2]);
  assert.deepEqual(result.lowestCategories, ['自己分析', '企業分析']);
  for (const date of [winter, summer]) assert.deepEqual(getAdvice(result, date), [advice.自己分析]);
});

test('company/selection tie always recommends selection preparation', () => {
  const result = calculateResult(grouped, [2, 2, 2, 1, 1, 1, 1, 1, 1]);
  assert.deepEqual(result.lowestCategories, ['企業分析', '選考対策']);
  for (const date of [winter, summer]) assert.deepEqual(getAdvice(result, date), [advice.選考対策]);
});

test('self/selection and three-way ties use Japan season and show one message', () => {
  const tied = calculateResult(grouped, [1, 1, 1, 2, 2, 2, 1, 1, 1]);
  assert.deepEqual(tied.lowestCategories, ['自己分析', '選考対策']);
  const minimum = calculateResult(grouped, Array(9).fill(0));
  assert.equal(minimum.totalScore, 9);
  assert.equal(minimum.perfect, false);
  for (const result of [tied, minimum]) {
    assert.deepEqual(getAdvice(result, winter), [advice.選考対策]);
    assert.deepEqual(getAdvice(result, summer), [advice.自己分析]);
    for (let month = 1; month <= 12; month++) {
      const date = new Date(`2026-${String(month).padStart(2, '0')}-15T12:00:00+09:00`);
      const category = month <= 3 || month >= 10 ? '選考対策' : '自己分析';
      assert.equal(getRecommendedCategory(result, date), category);
    }
  }
});

test('season changes at midnight in Japan on April 1 and October 1', () => {
  const result = calculateResult(grouped, Array(9).fill(0));
  const cases = [
    ['2026-03-31T14:59:59.999Z', '選考対策'],
    ['2026-03-31T15:00:00.000Z', '自己分析'],
    ['2026-09-30T14:59:59.999Z', '自己分析'],
    ['2026-09-30T15:00:00.000Z', '選考対策'],
    ['2026-12-31T15:00:00.000Z', '選考対策'],
    ['2027-03-31T15:00:00.000Z', '自己分析'],
  ];
  for (const [instant, category] of cases) {
    assert.equal(getRecommendedCategory(result, new Date(instant)), category, instant);
    assert.deepEqual(getAdvice(result, new Date(instant)), [advice[category]], instant);
  }
});

test('only all fourth choices show the perfect message', () => {
  const result = calculateResult(grouped, Array(9).fill(3));
  assert.equal(result.totalScore, 36);
  assert.equal(result.perfect, true);
  for (const date of [winter, summer]) {
    assert.deepEqual(getAdvice(result, date), [advice.perfect]);
    assert.equal(getRecommendedCategory(result, date), null);
  }
  assert.equal(calculateResult(grouped, [2, ...Array(8).fill(3)]).perfect, false);
});

test('all 262144 answer patterns match an independent scoring and tie oracle', () => {
  const recommendations = {
    '自己分析': ['自己分析', '自己分析'],
    '企業分析': ['企業分析', '企業分析'],
    '選考対策': ['選考対策', '選考対策'],
    '自己分析,企業分析': ['自己分析', '自己分析'],
    '自己分析,選考対策': ['選考対策', '自己分析'],
    '企業分析,選考対策': ['選考対策', '選考対策'],
    '自己分析,企業分析,選考対策': ['選考対策', '自己分析'],
  };
  for (let pattern = 0; pattern < 4 ** 9; pattern++) {
    let remaining = pattern;
    const answers = Array.from({ length: 9 }, () => { const answer = remaining % 4; remaining = Math.floor(remaining / 4); return answer; });
    const expectedScores = [0, 0, 0];
    answers.forEach((answer, index) => { expectedScores[Math.floor(index / 3)] += answer + 1; });
    const minimum = Math.min(...expectedScores);
    const expectedCategories = categories.filter((_, index) => expectedScores[index] === minimum);
    const actual = calculateResult(grouped, answers);
    assert.deepEqual(Object.values(actual.scores), expectedScores);
    assert.equal(actual.totalScore, expectedScores.reduce((a, b) => a + b, 0));
    assert.deepEqual(actual.lowestCategories, expectedCategories);
    assert.equal(actual.perfect, pattern === 4 ** 9 - 1);
    [winter, summer].forEach((date, season) => {
      const expected = actual.perfect ? advice.perfect : advice[recommendations[expectedCategories.join(',')][season]];
      assert.deepEqual(getAdvice(actual, date), [expected]);
    });
  }
});

test('incomplete, invalid and unbalanced inputs cannot produce a result', () => {
  for (const answer of [null, undefined, -1, 4, 1.5, '3']) {
    assert.throws(() => calculateResult(grouped, [answer, ...Array(8).fill(0)]));
  }
  assert.throws(() => calculateResult(grouped, Array(9)));
  assert.throws(() => calculateResult(grouped, Array(8).fill(0)));
  assert.throws(() => calculateResult(Array(9).fill(pool[0]), Array(9).fill(0)));
  assert.throws(() => selectQuestions(pool.filter(question => question.category !== '企業分析')));
});

test('new sessions reset answers and draw new questions', () => {
  const first = createSession(pool, seeded(1));
  first.answers[0] = 3;
  first.current = 4;
  const next = createSession(pool, seeded(2));
  assert.equal(next.current, 0);
  assert.deepEqual(next.answers, Array(9).fill(null));
  assert.notDeepEqual(first.questions, next.questions);
  assert.equal(first.answers[0], 3);
  assert.equal(registerUrl, 'https://me-mories.jp/');
});
