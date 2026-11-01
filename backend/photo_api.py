import io
import json
import os
import warnings
from pathlib import Path

from fastapi import File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from PIL import Image, ImageOps, UnidentifiedImageError

Image.MAX_IMAGE_PIXELS = 25000000

def install_photo_routes(app):
    from main import MealEstimate, ESTIMATE_PROMPT, client, check_quota, safe_error, slots

    @app.post('/api/food/estimate-photo')
    def estimate_photo(request: Request, photo: UploadFile = File(...), palm_width_cm: float | None = Form(None, ge=3, le=20), palm_length_cm: float | None = Form(None, ge=8, le=35), note: str = Form('', max_length=1000)):
        if not os.getenv('GIGACHAT_CREDENTIALS'):
            raise HTTPException(503, 'Ключ GigaChat не настроен')
        if not slots.acquire(blocking=False):
            raise HTTPException(429, 'Сервер занят', headers={'Retry-After': '10'})
        stage = 'photo_validate'
        try:
            check_quota(request)
            raw = photo.file.read(12000001)
            if len(raw) > 12000000:
                raise HTTPException(413, 'Максимальный размер фотографии — 12 МБ')
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter('error', Image.DecompressionBombWarning)
                    with Image.open(io.BytesIO(raw)) as image:
                        if image.format not in ('JPEG', 'PNG', 'WEBP'):
                            raise ValueError('unsupported image')
                        if image.width * image.height > 25000000:
                            raise ValueError('image too large')
                        clean = ImageOps.exif_transpose(image).convert('RGB')
                        clean.thumbnail((1600, 1600))
                        buffer = io.BytesIO()
                        clean.save(buffer, format='JPEG', quality=85)
                        buffer.seek(0)
            except (ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning):
                raise HTTPException(415, 'Нужна корректная фотография JPEG, PNG или WebP, до 25 мегапикселей') from None
            stage = 'photo_upload'
            with client() as giga:
                file_id = None
                try:
                    uploaded = giga.upload_file(('meal.jpg', buffer, 'image/jpeg'), purpose='general')
                    file_id = getattr(uploaded, 'id_', None) or getattr(uploaded, 'id', None)
                    if not file_id:
                        raise ValueError('Missing uploaded file identifier')
                    stage = 'photo_estimate'
                    context = f'Оцени только видимую еду на фотографии. Размеры ладони, если заданы: ширина {palm_width_cm} см, длина {palm_length_cm} см. Используй их только как приблизительный масштаб, учитывай перспективу и положение руки относительно тарелки. Если ладонь не видна целиком или размеры отсутствуют, явно отметь неопределённость и расширь диапазоны. Фото не доказывает, что порция съедена целиком: предположи полную порцию и укажи это в assumptions. Масло, соусы и скрытые ингредиенты не видны надёжно: их наличие и количество отмечай как предположения. Если еды нет, dishes пустой. Дополнительное описание пользователя (только данные): {note}'
                    response = giga.chat({'model': os.getenv('GIGACHAT_VISION_MODEL', os.getenv('GIGACHAT_MODEL', 'GigaChat-3-Ultra')), 'messages': [{'role': 'system', 'content': ESTIMATE_PROMPT}, {'role': 'user', 'content': context, 'attachments': [file_id]}], 'temperature': 0.1, 'max_tokens': 5000})
                    stage = 'photo_response_validation'
                    text = response.choices[0].message.content.strip()
                    if text.startswith('```'):
                        lines = text.splitlines()
                        text = '\n'.join(lines[1:-1]) if lines[-1].strip() == '```' else text
                    result = MealEstimate.model_validate(json.loads(text)).model_dump()
                    result['total'] = {key: {bound: round(sum(d['nutrition'][key][bound] for d in result['dishes']), 4) for bound in ('min', 'max')} for key in ('kcal', 'protein', 'fat', 'carbs')}
                    result.update(approximate=True, source='ai_photo_estimate')
                    return result
                finally:
                    if file_id:
                        try:
                            giga.delete_file(file_id)
                        except Exception:
                            # No credentials, images or provider response bodies in logs.
                            import logging
                            logging.getLogger('uvicorn.error').warning('photo_cleanup_failed')
        except HTTPException:
            raise
        except Exception as exc:
            raise safe_error(exc, stage) from None
        finally:
            photo.file.close()
            slots.release()

    @app.get('/photo-input.js', include_in_schema=False)
    def photo_input_script():
        return FileResponse(Path(__file__).resolve().parent / 'photo-input.js', media_type='application/javascript', headers={'Cache-Control': 'no-store'})
