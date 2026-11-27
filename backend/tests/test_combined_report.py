import json
import unittest
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from pydantic import ValidationError
from combined_report_api import CombinedInput, CombinedOutput, prepare_combined

def sample():
    now=datetime.now(timezone.utc)
    end=now.date();start=end-timedelta(days=1)
    return {'date_from':start,'date_to':end,'as_of':now,'targets':{'k':2000,'p':100,'f':70,'c':250},'profile':{'bodyGoal':'maintain','notes':'PRIVATE','nutritionGoals':['protein','PRIVATE'],'nutritionGoalSettings':{'proteinFactor':1.6,'notes':'PRIVATE'}},'days':[{'date':start,'food_count':1,'activity_count':0,'k':100,'p':10,'f':3,'c':12,'minutes':0,'strength_count':0,'kinds':{}},{'date':end,'food_count':0,'activity_count':1,'k':0,'p':0,'f':0,'c':0,'minutes':20,'distance':None,'strength_count':0,'kinds':{'walk':20}}]}

class CombinedReportTests(unittest.TestCase):
    def test_coverage_and_averages(self):
        facts=prepare_combined(CombinedInput(**sample()))
        self.assertEqual(facts['calendar_days'],2)
        self.assertEqual(facts['nutrition']['logged_days'],1)
        self.assertEqual(facts['nutrition']['average_on_logged_days']['k'],100)
        self.assertEqual(facts['activity']['logged_days'],1)
        self.assertEqual(facts['activity']['minutes'],20)
        self.assertNotIn('PRIVATE',json.dumps(facts))
    def test_empty_is_unknown(self):
        data=sample();data['days']=[]
        facts=prepare_combined(CombinedInput(**data))
        self.assertIsNone(facts['nutrition']['average_on_logged_days'])
        self.assertIsNone(facts['activity']['distance'])
    def test_bad_ranges_and_dates(self):
        for mode in ('reverse','future','long','duplicate'):
            data=sample()
            if mode=='reverse':data['date_from']=data['date_to']+timedelta(days=1)
            if mode=='future':data['date_to']+=timedelta(days=1)
            if mode=='long':data['date_from']=data['date_to']-timedelta(days=366)
            if mode=='duplicate':data['days'].append(data['days'][0])
            with self.subTest(mode=mode),self.assertRaises(HTTPException):
                prepare_combined(CombinedInput(**data))
    def test_inconsistent_metrics_rejected(self):
        data=sample();data['days'][1]['kinds']['walk']=30
        with self.assertRaises(HTTPException):prepare_combined(CombinedInput(**data))
        data=sample();data['days'][0]['k']=-1
        with self.assertRaises(ValidationError):CombinedInput(**data)
    def test_total_character_limit(self):
        self.assertEqual(len(CombinedOutput(text='я'*2000).text),2000)
        with self.assertRaises(ValidationError):CombinedOutput(text='я'*2001)
