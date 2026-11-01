# food.pro: GigaChat backend

Первый этап: защищённый разбор текста. index.html не изменён, сохранение в дневник и интеграция интерфейса ещё не реализованы.

## Render Web Service
- Repository: 888ankors888/food.pro
- Branch: main
- Runtime: Python
- Root Directory: backend
- Build Command: bash build.sh
- Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
- Health Check Path: /health
- Environment: PYTHON_VERSION=3.12.8

Секреты в Dashboard Render (не в GitHub и не в переписке):
- GIGACHAT_CREDENTIALS: Authorization Key из Studio
- APP_ACCESS_TOKEN: отдельный длинный случайный пароль для личного доступа к приложению
- GIGACHAT_SCOPE: GIGACHAT_API_PERS
- GIGACHAT_MODEL: GigaChat (при необходимости заменить на доступную в аккаунте модель)

Запрос: POST /api/food/parse, Authorization: Bearer <APP_ACCESS_TOKEN>, Content-Type: application/json, тело: {"text":"рис 150 г и два яйца"}.

Проверка TLS включена. build.sh загружает корневой сертификат с официального домена Госуслуг без отключения проверки TLS. Если загрузка или проверка сертификата не удалась, сборка останавливается.

КБЖУ не генерируются: ответ содержит только продукты и уточнения. Ответ проверяется Pydantic, но правильность распознавания должен подтвердить пользователь.

Это личный прототип: нет учётных записей, распределённых лимитов, базы продуктов и защиты от исчерпания ресурсов авторизованным пользователем. Перед публичным запуском нужны авторизация, лимиты запросов и проверка условий коммерческого использования GigaChat. Совместимость с реальным API и развёртывание ещё не протестированы.
