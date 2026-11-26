"""Prepare a local migration. No push, no credentials stored. Python 3.10+."""
import argparse
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys
import uuid
import time
import urllib.request

SLUG = 'yH_h8rnNix'
BRANCH = 'feat/migration-philosophical'
BASE = '7ff0cb526f75f20b07a8a5ab2c2ed7cb6bdfaeed'
ORG = 'https://github.com/gi-org-pl/'
LOCAL_URL = 'http://127.0.0.1:8765/api'
PROJECT = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://mypolitics.pl/quiz/' + SLUG + '/local-project'))
HERE = Path(__file__).resolve().parent


def run(*args, cwd=None, env=None):
    exe = shutil.which(args[0]) or args[0]
    print('+', ' '.join(map(str, args)), flush=True)
    subprocess.run([exe, *map(str, args[1:])], cwd=cwd, env=env, check=True)


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')


def stable(*parts):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, '/'.join((SLUG, *map(str, parts)))))


def localized(value, lang='pl'):
    if isinstance(value, str):
        return value.strip()
    if not isinstance(value, dict):
        return ''
    return next((v.strip() for v in [value.get(lang), value.get('pl'), *value.values()] if isinstance(v, str) and v.strip()), '')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def expand_query(query):
    # The converter's query does not request scoring relationships.
    old = 'effects {\n                    type\n                    custom {'
    require(old in query, 'Unexpected converter query format; inspect query.txt.')
    return query.replace(old, '''effects {
                    type
                    agree { ideologies { id } parties { id } }
                    disagree { ideologies { id } parties { id } }
                    custom {
                        key
                        ideologies { id }
                        parties { id }''', 1).replace('lastUpdatedVersion {', '''lastUpdatedVersion {
            options { disableAnswersGradiation enableCategoryWeight }
            parties { id }''', 1).replace('leftIdeologies {', 'leftIdeologies {\n                        weight').replace('rightIdeologies {', 'rightIdeologies {\n                        weight')


def ids(effect, known):
    effect = effect or {}
    require(not any(effect.get('parties') or []), 'Party mappings are not supported by this philosophical adapter.')
    out = list(dict.fromkeys(str(item['id']) for item in (effect.get('ideologies') or []) if item))
    require(set(out) <= known, f'Unknown orientation in answer: {set(out) - known}')
    return out


def modules_for(survey, pole_ids):
    axis_ids = [a['id'] for a in survey['axis'] if a['type'] == 'axis']
    scored = {oid for q in survey['questions'] for a in q['possibleAnswers'] if a['weight'] > 0 for oid in a['orientationIds']}
    # Keep axis poles out of a ranking when independent scored schools exist.
    candidates = [o['id'] for o in survey['orientations'] if o['id'] in scored - pole_ids]
    if not candidates and not axis_ids:
        candidates = [o['id'] for o in survey['orientations'] if o['id'] in scored]
    require(candidates or axis_ids, 'No drawable result modules.')
    def record(kind, position, col, orientations=(), axes=(), **values):
        return {'id': stable('module', kind), 'type': kind, 'position': position,
                'column': col, 'orientationIds': list(orientations), 'axisIds': list(axes),
                'values': [{'key': k, 'value': v} for k, v in values.items()]}
    result = []
    if candidates:
        result.append(record('header', 0, 'start', candidates, lowMatch='named', **{
            'label.compare': {'pl': 'Z nurtem filozoficznym', 'en': 'With a school of philosophy'},
            'label.lowMatch': {'pl': 'Żaden nurt nie jest wystarczająco bliski Twoim poglądom.', 'en': 'No school is sufficiently close to your views.'}}))
    if axis_ids:
        result.append(record('multi_axis', 1, 'start', axes=axis_ids,
            title={'pl': 'Osie filozoficzne', 'en': 'Philosophical axes'},
            description={'pl': 'Zobacz, do którego bieguna każdej osi jest Ci bliżej.', 'en': 'See which pole of each axis is closer to your views.'}))
    if candidates:
        result.append(record('horizontal_bar', 2, 'end' if axis_ids else 'start', candidates,
            title={'pl': 'Nurty filozoficzne', 'en': 'Schools of philosophy'},
            description={'pl': 'Dopasowanie Twoich odpowiedzi do poszczególnych nurtów.', 'en': 'How closely your answers match each school.'}, visibleRows=5))
        result.append(record('archetype', 3, 'end', candidates,
            title={'pl': 'Najbliższy nurt', 'en': 'Closest school'}, lowMatch='named'))
    return result


def adapt(export, raw):
    version = raw['lastUpdatedVersion']
    require(str(export['id']) == str(raw['id']), 'Mismatched quiz ID.')
    require(not raw.get('hidden'), 'Quiz is hidden; do not export without checking permission.')
    require(not any(version.get('parties') or []), 'Unexpected parties in quiz.')
    require(not any(version.get('traits') or []), 'Legacy traits need a separate rule mapping; no silent omission.')
    require(not any(version.get('compassModes') or []), 'Legacy compass needs an explicit polarity/weight review; no silent omission.')
    options = version.get('options') or {}
    graded = not options.get('disableAnswersGradiation')
    languages = [x for x in ('pl', 'en') if x in (export.get('supportedLanguages') or ['pl'])] or ['pl']
    # The legacy ID is retained in the export, while the mock uses a stable local UUID.
    survey_id = stable('survey', export['id'])
    orientations = export['orientations']
    known = {str(o['id']) for o in orientations}
    require(len(known) == len(orientations) and all(known), 'Duplicate or missing orientation ID.')
    source_questions = {str(q['id']): q for q in version['questions'] if q}
    require(len(source_questions) == len(export['questions']), 'Question counts differ or IDs are duplicated.')
    def make_survey(lang):
        cats = [{'id': str(c['id']), 'name': localized(c['name'], lang), 'weight': c['weight'] if options.get('enableCategoryWeight') else 1} for c in export['categories']]
        cat_ids = {c['id'] for c in cats}
        os = [{**o, 'generalName': localized(o['generalName'], lang), 'description': localized(o['description'], lang), 'surveyId': survey_id} for o in orientations]
        require(all(o['generalName'] for o in os), 'Missing orientation label.')
        questions = []
        for q in export['questions']:
            qid = str(q['id']); e = source_questions[qid]['effects']; kind = e['type'] or 'FOR_AND_AGAINST'
            require(kind in ('FOR_AND_AGAINST', 'CUSTOM_ONLY', 'ALL'), f'Unknown answer type: {kind}')
            answers = []
            def answer(key, label, weight, mapping):
                require(isinstance(weight, (int,float)) and not isinstance(weight,bool) and math.isfinite(weight) and weight >= 0, f'Invalid weight {qid}/{key}')
                require(bool(label), f'Missing answer text {qid}/{key}')
                answers.append({'id': stable('answer', qid, key), 'text': label, 'weight': weight, 'orientationIds': mapping})
            if kind in ('FOR_AND_AGAINST','ALL'):
                pl = ['Zdecydowanie za','Częściowo za','Neutralnie','Częściowo przeciw','Zdecydowanie przeciw']
                en = ['Strongly agree','Agree','Neutral','Disagree','Strongly disagree']
                for key, index, weight, side in [('strong-agree',0,2,'agree'),('agree',1,1,'agree'),('neutral',2,0,None),('disagree',3,1,'disagree'),('strong-disagree',4,2,'disagree')]:
                    if not graded and weight == 2: continue
                    answer(key, (en if lang=='en' else pl)[index], weight, ids(e.get(side), known) if side else [])
            if kind in ('CUSTOM_ONLY','ALL'):
                for i, a in enumerate(e.get('custom') or []):
                    require(a is not None, f'Null custom answer {qid}/{i}')
                    answer('custom-' + str(a.get('key') or i), localized(a.get('text'),lang), a['weight'], ids(a,known))
            require(answers and len({a['id'] for a in answers}) == len(answers), f'No answers or duplicate answers: {qid}')
            require(any(a['orientationIds'] and a['weight'] > 0 for a in answers), f'No scoring mapping: {qid}')
            label = localized(q['text'],lang); require(label, f'Missing question {qid}')
            category = q.get('categoryId') or None
            require(category is None or category in cat_ids, f'Unknown category: {category}')
            questions.append({'id': qid, 'text': label, 'explanation': localized(q.get('explanation'),lang), 'categoryId': category, 'status': 'LIVE', 'answerType': 'ONE_OF_MANY' if kind=='CUSTOM_ONLY' else 'AGREE_OR_DISAGREE', 'possibleAnswers': answers})
        axes = []
        for a in export['axes']:
            # Converter stores left as positive and right as negative. The new
            # axis UI renders positive on the end; verify orientation visually.
            left, right = a['positiveOrientations'], a['negativeOrientations']
            require(left in known and right in known and left != right, f'Invalid axis {a["id"]}')
            axes.append({'id': a['id'], 'name': localized(a['name'],lang), 'type': 'axis', 'positiveOrientations': [right], 'negativeOrientations': [left]})
        require(questions, 'Quiz is empty.')
        return {'id': survey_id, 'title': localized(export['title'],lang), 'type': 'OFFICIAL', 'averageFinishTime': export.get('averageFinishTime'), 'defaultLanguage': languages[0], 'supportedLanguages': languages, 'orientations': os, 'categories': cats, 'axis': axes, 'questions': questions}
    surveys = {lang: make_survey(lang) for lang in languages}
    first = surveys[languages[0]]
    poles = {oid for a in first['axis'] for oid in a['positiveOrientations']+a['negativeOrientations']}
    return surveys, modules_for(first, poles)


def prepare(root, base, skip_tests):
    root.mkdir(parents=True, exist_ok=True)
    app, bot = root/'mypolitics-app', root/'quiz-conversion-bot'
    for repo in (bot, app):
        if repo == bot and all((bot / name).is_file() for name in ('convert.py', 'models.py', 'query.txt', 'requirements.txt')):
            print('Using existing quiz-conversion-bot files:', bot, flush=True)
            continue
        if not (repo/'.git').is_dir():
            run('git','clone',ORG+repo.name+'.git',str(repo))
    require(not subprocess.check_output(['git','status','--porcelain'],cwd=app,text=True).strip(),'App working tree is not clean. Use a fresh workspace.')
    if base == BASE:
        run('git','fetch','origin','pull/202/head',cwd=app)
    run('git','switch','-c',BRANCH,base,cwd=app)
    run(sys.executable,'-m','pip','install','-r','requirements.txt',cwd=bot)
    dest=app/'migration'/'filozoficzny'; dest.mkdir(parents=True)
    output=dest/f'quiz-data-{SLUG}.json'
    run(sys.executable,'convert.py',SLUG,'--out',str(output),cwd=bot)
    # Read-only GraphQL request: no mutation or production API writes.
    import requests
    query=expand_query((bot/'query.txt').read_text(encoding='utf-8'))
    response=requests.post('https://gql.mypolitics.pl/graphql',json={'query':query,'variables':{'slug':SLUG}},timeout=30)
    response.raise_for_status(); payload=response.json(); require(not payload.get('errors'), str(payload.get('errors')))
    raw=payload['data']['quiz']; require(raw, 'No quiz returned.')
    export=json.loads(output.read_text(encoding='utf-8'))
    write_json(dest/'legacy-quiz-with-effects.json',raw)
    surveys, modules=adapt(export,raw)
    write_json(dest/'survey-mock.json',surveys)
    write_json(dest/'result-modules.json',modules)
    survey_id=next(iter(surveys.values()))['id']
    p=app/'src/constants/result-modules.ts'; t=p.read_text(encoding='utf-8'); marker='export const OWN_RESULT_MODULES: Record<string, OwnResultModule[]> = {'
    require(t.count(marker)==1 and survey_id not in t,'Result module source changed or entry already exists.')
    p.write_text(t.replace(marker,marker+'\n  '+json.dumps(survey_id)+': '+json.dumps(modules,ensure_ascii=False,indent=2)+',',1),encoding='utf-8')
    p=app/'src/constants/survey.ts'; t=p.read_text(encoding='utf-8'); marker='export const QUIZ_PROJECT_IDS: Record<string, string> = {'
    require(t.count(marker)==1,'Quiz project map changed.')
    # Only enable the local ID when the local mock API is explicitly selected.
    t=t.replace(marker,marker+'\n  ...(import.meta.env.VITE_API_URL === '+json.dumps(LOCAL_URL)+'\n    ? { filozoficzny: '+json.dumps(PROJECT)+' }\n    : {}),',1)
    p.write_text(t,encoding='utf-8')
    for file in ('mock_api.py','smoke.mjs','README.md','prepare.py','test_migration.py'):
        shutil.copy2(HERE/file,dest/file)
    run(sys.executable,'-m','unittest','discover','-s',str(dest),'-p','test_migration.py',cwd=app,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
    run('yarn','install','--frozen-lockfile',cwd=app)
    run('yarn','biome','format','--write','src/constants/result-modules.ts','src/constants/survey.ts',cwd=app)
    if not skip_tests:
        run('yarn','lint',cwd=app)
        run('yarn','prebuild',cwd=app)
        run('yarn','tsc','-b',cwd=app)
        run('yarn','vitest','run',cwd=app)
        run('yarn','playwright','install','chromium',cwd=app)
        run('yarn','e2e:local',cwd=app,env={**os.environ,'CI':'1'})
        smoke(app)
    if not skip_tests:
        run('git','add','src/constants/result-modules.ts','src/constants/survey.ts','migration/filozoficzny',cwd=app)
        run('git','commit','-m','feat: migrate philosophical quiz result modules and local mocks',cwd=app)
    print('Local branch:',BRANCH,'\nNo push was made.')
    print('IMPORTANT: mock IDs are not production IDs. Review the result layout and legacy scoring differences before PR.')


def smoke(app):
    # Explicitly use the local API, never the live result-creation endpoint.
    env={**os.environ,'VITE_API_URL':LOCAL_URL,'VITE_RESULTS_EMAIL_URL':'','VITE_ANSWER_COUNTS_URL':''}
    yarn=shutil.which('yarn')
    processes=[]
    try:
        processes.append(subprocess.Popen([sys.executable,'migration/filozoficzny/mock_api.py'],cwd=app))
        processes.append(subprocess.Popen([yarn,'dev','--host','127.0.0.1','--port','5173','--strictPort'],cwd=app,env=env))
        for url in (LOCAL_URL+'/health','http://127.0.0.1:5173'):
            for i in range(120):
                require(all(p.poll() is None for p in processes),'Local server exited.')
                try:
                    with urllib.request.urlopen(url,timeout=2) as response:
                        if response.status==200:break
                except OSError:time.sleep(1)
            else:raise RuntimeError('Local server not ready: '+url)
        run('node','migration/filozoficzny/smoke.mjs',cwd=app)
    finally:
        for p in reversed(processes):
            if p.poll() is None:
                if os.name=='nt':subprocess.run(['taskkill','/PID',str(p.pid),'/T','/F'],check=False)
                else:p.terminate()


def main():
    p=argparse.ArgumentParser(); p.add_argument('--workspace',type=Path,default=HERE/'workspace');p.add_argument('--base',default=BASE);p.add_argument('--skip-app-tests',action='store_true'); a=p.parse_args()
    for tool in ('git','node','yarn'):
        require(shutil.which(tool), f'{tool} is required on PATH.')
    require(int(subprocess.check_output(['node','--version'],text=True).strip().split('.')[0][1:])>=24,'Node 24+ required.')
    prepare(a.workspace.resolve(),a.base,a.skip_app_tests)

if __name__=='__main__': main()
