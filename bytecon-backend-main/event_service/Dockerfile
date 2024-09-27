FROM python:3.10

WORKDIR /event-service
COPY .env .env
COPY ./event_service/requirements.txt /event-service/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /event-service/requirements.txt

COPY ./shared shared
RUN pip install ./shared

COPY ./event_service /event-service

RUN python3 models.py
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]