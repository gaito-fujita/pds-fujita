FROM python:3.10.2

RUN apt update -y
RUN pip install pymongo