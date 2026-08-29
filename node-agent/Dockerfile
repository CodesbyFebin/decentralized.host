FROM python:3.12-slim

WORKDIR /app

COPY node-agent/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY node-agent/agent.py ./agent.py

EXPOSE 8100
CMD ["python", "agent.py"]
