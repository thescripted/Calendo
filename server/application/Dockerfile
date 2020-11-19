FROM python:3.8.5

RUN pip install Flask requests uwsgi

COPY app.py /app.py

ENV FLASK_APP=app

CMD uwsgi --master \
  --workers $WORKERS \
  --threads $THREADS \
  --protocol $PROTOCOL \
  --socket 0.0.0.0:$PORT_APP \
  --module app:app


