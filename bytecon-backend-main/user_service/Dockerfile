FROM python:3.10

WORKDIR /user-service

COPY .env .env

COPY ./user_service/requirements.txt /user-service/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /user-service/requirements.txt

COPY ./shared shared
RUN pip install ./shared

COPY ./user_service /user-service

RUN python3 models.py
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]