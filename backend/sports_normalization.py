from copy import deepcopy
from math import isfinite
from pydantic import BaseModel, model_validator, ValidationError

class NormalizedPlan(BaseModel):
    @model_validator(mode='before')
    @classmethod
    def normalize_representation(cls, raw):
        if not isinstance(raw, dict):
            return raw
        value=deepcopy(raw)
        if isinstance(value.get('warnings'),str):
            value['warnings']=[value['warnings']]
        weekdays={name:i for i,names in enumerate([('понедельник','пн','monday','mon'),('вторник','вт','tuesday','tue'),('среда','ср','wednesday','wed'),('четверг','чт','thursday','thu'),('пятница','пт','friday','fri'),('суббота','сб','saturday','sat'),('воскресенье','вс','sunday','sun')]) for name in names}
        kinds={'walking':'walk','ходьба':'walk','running':'run','бег':'run','cycling':'bike','велосипед':'bike','силовая':'strength','силовая тренировка':'strength','подвижность':'mobility','растяжка':'mobility','другое':'other'}
        intensities={'low':'light','лёгкая':'light','легкая':'light','низкая':'light','medium':'moderate','умеренная':'moderate','средняя':'moderate'}
        sessions=value.get('sessions')
        if not isinstance(sessions,list):
            return value
        for session in sessions:
            if not isinstance(session,dict):
                continue
            for field,aliases in [('weekday',weekdays),('kind',kinds),('intensity',intensities)]:
                current=session.get(field)
                if isinstance(current,str):
                    normalized=current.strip().casefold()
                    session[field]=aliases.get(normalized,normalized)
            exercises=session.get('exercises')
            if isinstance(exercises,list):
                for exercise in exercises:
                    if not isinstance(exercise,dict):
                        continue
                    reps=exercise.get('repetitions')
                    if type(reps) in (int,float) and isfinite(reps) and reps>=0:
                        exercise['repetitions']=format(reps,'.15g')
        return value

def safe_validation_fields(exc):
    if not isinstance(exc,ValidationError):
        return []
    allowed={'sessions','exercises','name','sets','repetitions','instruction','weekday','title','kind','minutes','intensity','summary','warnings','progression'}
    result=[]
    for item in exc.errors(include_input=False,include_context=False,include_url=False)[:12]:
        path='.'.join(str(p) if isinstance(p,int) or p in allowed else '*' for p in item.get('loc',())) or 'root'
        result.append({'path':path[:160],'type':str(item.get('type','validation_error'))[:80]})
    return result
