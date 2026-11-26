// Run against the local mock API and a Vite dev server configured to use it.
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';

const dir = fileURLToPath(new URL('.', import.meta.url));
const surveys = JSON.parse(await readFile(join(dir, 'survey-mock.json'), 'utf8'));
const survey = surveys.pl ?? Object.values(surveys)[0];
const modules = JSON.parse(await readFile(join(dir, 'result-modules.json'), 'utf8'));
const base = 'http://127.0.0.1:5173';
const api = 'http://127.0.0.1:8765/api';
const browser = await chromium.launch();
const screenshots = join(dir, 'screenshots');
await mkdir(screenshots, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'pl-PL' });
  // Quiz page must render a real imported question, and allow a real choice.
  await page.goto(`${base}/quizzes/filozoficzny`);
  const main = page.getByRole('main');
  const buttons = (name) => main.getByRole('button', { name, exact: true });
  const first = survey.questions[0];
  const group = main.getByRole('group', { name: first.text, exact: true });
  await expect(group.or(buttons('Pomiń')).first()).toBeVisible({ timeout: 30000 });
  if (!(await group.isVisible())) await buttons('Pomiń').click();
  await expect(group).toBeVisible({ timeout: 30000 });
  await group.getByRole('button', { name: first.possibleAnswers[0].text, exact: true }).click();
  // Full completion is attempted, including checkpoints and demographic controls.
  const answered = new Set([first.id]);
  const demographics = main.getByRole('heading', { name: 'Twoja tożsamość' });
  for (let step = 0; step < survey.questions.length * 3 + 30; step++) {
    if (await demographics.isVisible()) break;
    let found = false;
    for (const q of survey.questions) {
      if (answered.has(q.id)) continue;
      const g = main.getByRole('group', { name: q.text, exact: true });
      if (await g.isVisible()) {
        await g.getByRole('button', { name: q.possibleAnswers[0].text, exact: true }).click();
        answered.add(q.id); found = true; break;
      }
    }
    if (found) continue;
    if (await buttons('Wyłącz checkpointy').isVisible()) {
      await buttons('Wyłącz checkpointy').click();
      if (await buttons('Dalej').isVisible()) await buttons('Dalej').click();
    } else if (await buttons('Dalej').isVisible()) await buttons('Dalej').click();
    else await page.waitForTimeout(500);
  }
  await expect(demographics).toBeVisible({ timeout: 10000 });
  expect(answered.size).toBe(survey.questions.length);
  for (const [field, option] of [['Wiek','25'],['Płeć','Wolę nie podawać'],['Wielkość miejsca zamieszkania','Miasto od 50 do 200 tys. mieszkańców'],['Wykształcenie','Wyższe']]) {
    await buttons(field).click();
    await page.getByRole('menuitemradio',{name:option,exact:true}).click();
  }
  await buttons('Zobacz wyniki').click();
  await expect(page).toHaveURL(/\/results\//,{timeout:45000});
  const heading = main.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible({ timeout: 30000 });
  for (const m of modules) {
    const title = m.values.find(v=>v.key==='title')?.value?.pl;
    if (title) await expect(main.getByRole('region',{name:title,exact:true})).toBeVisible({timeout:30000});
  }
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:join(screenshots,'results-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:join(screenshots,'results-mobile.png'),fullPage:true});
  // Independent seeded result: choose the best matching answer to the first
  // real ranked orientation wherever possible, not a fabricated percentage.
  const target=modules.find(m=>m.type==='header')?.orientationIds[0];
  if (target) {
    const answers=survey.questions.map(q=>({questionId:q.id,answerId:[...q.possibleAnswers].sort((a,b)=>(b.orientationIds.includes(target)?b.weight:0)-(a.orientationIds.includes(target)?a.weight:0))[0].id}));
    const id=randomUUID();
    const response=await fetch(`${api}/v1/result`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:id,surveyId:survey.id,prioritizedCategories:[],answers})});
    if (response.status!==201) throw new Error(`Local result POST: ${response.status}`);
    await page.goto(`${base}/results/${id}`);
    await expect(main.getByRole('heading',{level:1})).toBeVisible({timeout:30000});
  }
  console.log('Philosophical browser smoke: passed. Actual screenshots saved in',screenshots);
} finally { await browser.close(); }
