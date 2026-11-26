"""Loopback-only fake API for local migration; no calls to the live API."""
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import uuid

SLUG = 'yH_h8rnNix'
PROJECT = str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://mypolitics.pl/quiz/' + SLUG + '/local-project'))
HERE = Path(__file__).resolve().parent


def score(survey, answers, prioritized=()):
    """New frontend arithmetic: sum weights / sum per-question maxima."""
    chosen = {}
    for a in answers:
        chosen.setdefault(a['questionId'], a['answerId'])
    categories = {c['id']: c['weight'] for c in survey['categories']}
    totals = {o['id']: {'id': o['id'], 'points': 0, 'maxPossible': 0} for o in survey['orientations']}
    for q in survey['questions']:
        maxima = {}
        weight = categories.get(q.get('categoryId'), 1) if q.get('categoryId') in prioritized else 1
        multiplier = weight if weight > 0 else 1
        for a in q['possibleAnswers']:
            for oid in a['orientationIds']:
                maxima[oid] = max(maxima.get(oid,0), a['weight'])
        for oid, maximum in maxima.items():
            totals[oid]['maxPossible'] += maximum * multiplier
        a = next((a for a in q['possibleAnswers'] if a['id']==chosen.get(q['id'])),None)
        if a:
            for oid in a['orientationIds']:
                totals[oid]['points'] += a['weight'] * multiplier
    return list(totals.values())


def result(survey, payload):
    answers=payload['answers']
    return {'id':payload['sessionId'],'surveyId':survey['id'],'answers':answers,'results':{'orientations':score(survey,answers,payload.get('prioritizedCategories',[]))}}


def serve():
    surveys=json.loads((HERE/'survey-mock.json').read_text(encoding='utf-8'))
    survey=next(iter(surveys.values()))
    stored={}
    class Handler(BaseHTTPRequestHandler):
        def reply(self,status,data=None):
            self.send_response(status)
            self.send_header('Access-Control-Allow-Origin','*')
            self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
            self.send_header('Access-Control-Allow-Headers','*')
            if data is not None:
                self.send_header('Content-Type','application/json; charset=utf-8')
            self.end_headers()
            if data is not None:self.wfile.write(json.dumps(data,ensure_ascii=False).encode())
        def do_OPTIONS(self): self.reply(204)
        def do_GET(self):
            url=urlparse(self.path); path=url.path; lang=parse_qs(url.query).get('lang',['pl'])[0]
            if path==f'/api/v1/project/{PROJECT}':self.reply(200,{'id':PROJECT,'latestSurveyId':survey['id']})
            elif path==f'/api/v1/survey/{survey["id"]}':self.reply(200,surveys.get(lang,survey))
            elif path.startswith('/api/v1/result/'):
                key=path.rsplit('/',1)[1]
                self.reply(200,stored[key]) if key in stored else self.reply(404,{})
            elif path=='/api/health':self.reply(200,{'ready':True})
            else:self.reply(404,{})
        def do_POST(self):
            if urlparse(self.path).path!='/api/v1/result':return self.reply(404,{})
            try:
                body=json.loads(self.rfile.read(int(self.headers['Content-Length'])))
                assert body['surveyId']==survey['id'] and isinstance(body['sessionId'],str)
                valid={q['id']:{a['id'] for a in q['possibleAnswers']} for q in survey['questions']}
                assert isinstance(body['answers'],list) and all(a['answerId'] in valid.get(a['questionId'],set()) for a in body['answers'])
                key=body['sessionId']
                if key in stored:return self.reply(409,{})
                stored[key]=result(survey,body)
                self.reply(201,{})
            except (ValueError,TypeError,KeyError,AssertionError):self.reply(400,{})
    print('Local API: http://127.0.0.1:8765/api',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()

if __name__=='__main__':serve()
