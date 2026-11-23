from pathlib import Path
import hashlib
import re

SOURCE = '67352cb0ee79e7c7f2107dc4aa45b89ee523175d'
TARGET = 'ef90753574010d0ddce102496cd4b2bd19358cda'

def blob(text):
    data = text.encode('utf-8')
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

def once(text, old, new):
    assert text.count(old) == 1, 'Unexpected source fragment'
    return text.replace(old, new, 1)

def migrate(text):
    if blob(text) == TARGET:
        return text
    assert blob(text) == SOURCE, 'Unexpected index.html: stop for review'
    text = once(text, '<script>\nconst $=s=>document.querySelector(s);', '<script src="data-store.js?v=1"></script>\n<script src="nutrition-store.js?v=1"></script>\n<script>\nconst $=s=>document.querySelector(s);')
    text = once(text, 'let S={profile:null,entries:[],reports:{},weights:{},rem:defRem()};', 'const foodNutritionRepo=()=>window.SetUpNutritionStore.createRepository({storage:localStorage,today});\nlet S={profile:null,entries:[],reports:{},weights:{},rem:defRem()};')
    start = text.index('function addEntry(){')
    end = text.index('function delEntry(', start)
    old = text[start:end].rstrip()
    new = once(old, 'S.entries.push({', 'const entry={')
    new = once(new, 'thumb:pend.thumb});', 'thumb:pend.thumb};')
    new = once(new, '  save();pend=null;', "  try{S=foodNutritionRepo().append([entry]).state}catch(e){toast('Не удалось сохранить; запись не добавлена');return}\n  pend=null;")
    text = once(text, old, new)
    for name in ('manualSave', 'jPut'):
        matches = re.findall(r'function ' + name + r'\([^\n]+', text)
        assert len(matches) == 1
        old = matches[0]
        new = once(old, 'S.entries.push({', 'const entry={')
        new = once(new, "thumb:''});save();", "thumb:''};try{S=foodNutritionRepo().append([entry]).state}catch(e){toast('Не удалось сохранить; запись не добавлена');return}")
        text = once(text, old, new)
    text = once(text, 'function delEntry(id){S.entries=S.entries.filter(e=>e.id!==id);save();render()}', "function delEntry(id){try{S=foodNutritionRepo().remove(id,S.entries.find(e=>e.id===id)).state}catch(e){toast('Не удалось удалить: '+e.message);return}render()}")
    text = once(text, "const next={...S,entries:[...S.entries,...added]};try{localStorage.setItem('nt1',JSON.stringify(next))}catch(e){toast('Не удалось сохранить. Записи не добавлены.');return}\n S=next;", "let next;try{next=foodNutritionRepo().append(added).state}catch(e){toast('Не удалось сохранить. Записи не добавлены.');return}\n S=next;")
    text = once(text, "const next={...S,entries:[...S.entries,entry]};try{localStorage.setItem('nt1',JSON.stringify(next))}catch(e){toast('Не удалось сохранить; запись не добавлена');return}\n  S=next;", "let next;try{next=foodNutritionRepo().append([entry]).state}catch(e){toast('Не удалось сохранить; запись не добавлена');return}\n  S=next;")
    assert blob(text) == TARGET, 'Unexpected output: stop without writing'
    return text

if __name__ == '__main__':
    path = Path('index.html')
    source = path.read_bytes().decode('utf-8')
    target = migrate(source)
    if target != source:
        path.write_bytes(target.encode('utf-8'))
