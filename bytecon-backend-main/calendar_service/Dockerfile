FROM python:3.10


WORKDIR /calendar-service
COPY .env .env
COPY ./calendar_service/requirements.txt /calendar-service/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /calendar-service/requirements.txt

COPY ./shared shared
RUN pip install ./shared

COPY ./calendar_service .

RUN python3 models.py
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]