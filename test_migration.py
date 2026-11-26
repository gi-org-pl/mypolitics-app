import copy
import unittest
from prepare import adapt, expand_query, stable
from mock_api import score, result


def fixture():
    # Synthetic test only; never used as production or migrated quiz data.
    orient = lambda k: {'id':k,'generalName':{'pl':k,'en':k},'description':{'pl':'Opis '+k},'type':'IDEOLOGY','logoUrl':None,'color':'#123456','linkedOrientations':[]}
    q = lambda k,kind: {'id':k,'text':{'pl':'Pytanie '+k,'en':'Question '+k},'categoryId':'cat','answerType':kind,'possibleAnswers':[]}
    export = {'id':'test-quiz','title':{'pl':'Test'},'supportedLanguages':['pl','en'],'orientations':[orient(k) for k in ['a','b','c','d']],'categories':[{'id':'cat','name':{'pl':'Kategoria'},'weight':2}],'questions':[q('q1','FOR_AND_AGAINST'),q('q2','CUSTOM_ONLY')],'axes':[{'id':'axis','name':{'pl':'Oś'},'positiveOrientations':'c','negativeOrientations':'d','type':'axis'}]}
    effect=lambda *ids: {'ideologies':[{'id':i} for i in ids],'parties':[]}
    raw={'id':'test-quiz','hidden':False,'lastUpdatedVersion':{'parties':[],'traits':[],'compassModes':[],'options':{'enableCategoryWeight':True},'questions':[{'id':'q1','effects':{'type':'FOR_AND_AGAINST','agree':effect('a','c'),'disagree':effect('b','d')}},{'id':'q2','effects':{'type':'CUSTOM_ONLY','custom':[{'key':'1','weight':3,'text':{'pl':'Tak','en':'Yes'},**effect('a')},{'key':'2','weight':1,'text':{'pl':'Nie','en':'No'},**effect('b')}]}}]}}
    return export,raw


class MigrationTests(unittest.TestCase):
    def test_adapter_and_languages(self):
        data, mods=adapt(*fixture()); pl=data['pl']; en=data['en']; self.assertEqual(len(pl['questions']),2)
        self.assertEqual(len(pl['questions'][0]['possibleAnswers']),5)
        self.assertEqual(pl['questions'][0]['possibleAnswers'][0]['id'],en['questions'][0]['possibleAnswers'][0]['id'])
        self.assertEqual(pl['axis'][0]['negativeOrientations'],['c'])
        self.assertEqual(pl['axis'][0]['positiveOrientations'],['d'])
        self.assertEqual(mods[0]['orientationIds'],['a','b'])
        self.assertEqual([m['type'] for m in mods],['header','multi_axis','horizontal_bar','archetype'])
        self.assertEqual(adapt(*fixture()),(data,mods))
    def test_disabled_gradation(self):
        e,r=fixture();r['lastUpdatedVersion']['options']['disableAnswersGradiation']=True
        data,_=adapt(e,r);self.assertEqual(len(data['pl']['questions'][0]['possibleAnswers']),3)
    def test_unknown_orientation_fails(self):
        e,r=fixture();r['lastUpdatedVersion']['questions'][0]['effects']['agree']['ideologies']=[{'id':'unknown'}]
        with self.assertRaisesRegex(ValueError,'Unknown orientation'):adapt(e,r)
    def test_unhandled_traits_and_compass_fail(self):
        for field in ('traits','compassModes','parties'):
            with self.subTest(field=field):
                e,r=fixture();r['lastUpdatedVersion'][field]=[{'id':'unsupported'}]
                with self.assertRaises(ValueError):adapt(e,r)
    def test_missing_mapping_fails(self):
        e,r=fixture();r['lastUpdatedVersion']['questions'][0]['effects']['agree']={};r['lastUpdatedVersion']['questions'][0]['effects']['disagree']={}
        with self.assertRaisesRegex(ValueError,'No scoring mapping'):adapt(e,r)
    def test_scores_skipped_duplicate_and_priority(self):
        data,_=adapt(*fixture());s=data['pl'];q=s['questions'][0];a=q['possibleAnswers'][0]
        picked={'questionId':q['id'],'answerId':a['id']}; alternative={'questionId':q['id'],'answerId':q['possibleAnswers'][-1]['id']}
        totals={x['id']:x for x in score(s,[picked,alternative],['cat'])}
        self.assertEqual(totals['a'],{'id':'a','points':4,'maxPossible':10})
        self.assertEqual(totals['b'],{'id':'b','points':0,'maxPossible':6})
        self.assertTrue(all(0<=x['points']<=x['maxPossible'] for x in totals.values()))
        self.assertEqual(result(s,{'sessionId':'local','answers':[picked]})['surveyId'],s['id'])
    def test_query_requests_missing_links(self):
        q='lastUpdatedVersion {\n effects {\n                    type\n                    custom {\n leftIdeologies {\n rightIdeologies {'
        expanded=expand_query(q)
        for snippet in ('agree { ideologies { id } parties { id } }','key','disableAnswersGradiation','weight'):
            self.assertIn(snippet,expanded)
        with self.assertRaises(ValueError):expand_query('unexpected')

if __name__=='__main__':unittest.main()
