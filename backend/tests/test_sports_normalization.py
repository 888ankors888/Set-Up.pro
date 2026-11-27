import copy
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from fastapi import HTTPException
from pydantic import ValidationError
from sports_api import SportsInput, SportsPlan, install_sports_routes
from sports_normalization import safe_validation_fields

def sample():
    return {'summary':'Черновик','sessions':[{'weekday':0,'title':'Ходьба','kind':'walk','minutes':20,'intensity':'light','exercises':[{'name':'Шаг','sets':0,'repetitions':'10','instruction':'В удобном темпе'}]}],'warnings':['Проверьте переносимость'],'progression':'Постепенно'}

def payload(**changes):
    data={'age':30,'level':'beginner','goal':'activity','body_goal':'maintain','days':[0,1,2],'minutes':20,'place':'home','equipment':'Нет','restrictions':'none','health_flag':False}
    data.update(changes)
    return SportsInput(**data)

class App:
    def post(self,path):
        def register(fn):
            self.handler=fn
            return fn
        return register

class SportsValidationTests(unittest.TestCase):
    def test_equivalent_representations(self):
        raw=sample();s=raw['sessions'][0];s.update(weekday='Понедельник',kind='Ходьба',intensity='лёгкая');s['exercises'][0]['repetitions']=10;raw['warnings']='Одна заметка';before=copy.deepcopy(raw)
        plan=SportsPlan.model_validate(raw)
        self.assertEqual(plan.sessions[0].weekday,0)
        self.assertEqual(plan.sessions[0].kind,'walk')
        self.assertEqual(plan.sessions[0].exercises[0].repetitions,'10')
        self.assertEqual(plan.warnings,['Одна заметка'])
        self.assertEqual(raw,before)

    def test_invalid_values_are_not_relaxed(self):
        for field,value in [('weekday',7),('intensity','high'),('intensity','высокая'),('kind','unknown'),('minutes',100)]:
            raw=sample();raw['sessions'][0][field]=value
            with self.subTest(field=field,value=value),self.assertRaises(ValidationError):
                SportsPlan.model_validate(raw)
        for reps in [-1,float('nan'),True]:
            raw=sample();raw['sessions'][0]['exercises'][0]['repetitions']=reps
            with self.assertRaises(ValidationError):
                SportsPlan.model_validate(raw)

    def test_restrictions_prevent_generation(self):
        app=App();install_sports_routes(app)
        for changes in [{'restrictions':'yes'},{'restrictions':'unsure'},{'health_flag':True}]:
            generate=lambda *args: self.fail('Generation must not run')
            with patch.dict('sys.modules',{'main':SimpleNamespace(generate=generate)}):
                with self.assertRaises(HTTPException) as caught:
                    app.handler(payload(**changes),None)
                self.assertEqual(caught.exception.status_code,409)

    def test_safety_checks_remain(self):
        app=App();install_sports_routes(app)
        too_long=sample();too_long['sessions'][0]['minutes']=21
        adjacent=sample();adjacent['sessions'][0]['kind']='strength';second=copy.deepcopy(adjacent['sessions'][0]);second['weekday']=1;adjacent['sessions'].append(second)
        for raw in [too_long,adjacent]:
            plan=SportsPlan.model_validate(raw)
            with patch.dict('sys.modules',{'main':SimpleNamespace(generate=lambda *args:plan)}):
                with self.assertRaises(HTTPException) as caught:
                    app.handler(payload(),None)
                self.assertEqual(caught.exception.status_code,502)

    def test_json_schema_is_present(self):
        schema=SportsPlan.model_json_schema()
        self.assertIn('sessions',schema['properties'])
        self.assertNotIn('high',schema['$defs']['Session']['properties']['intensity']['enum'])

    def test_diagnostics_do_not_contain_values(self):
        import json
        raw=sample();raw['sessions'][0]['kind']='PRIVATE_VALUE_NOT_FOR_LOGS'
        try:
            SportsPlan.model_validate(raw)
        except ValidationError as exc:
            fields=safe_validation_fields(exc)
        self.assertTrue(fields)
        self.assertEqual(fields[0]['path'],'sessions.0.kind')
        self.assertNotIn('PRIVATE_VALUE_NOT_FOR_LOGS',json.dumps(fields))
