##jsonのinsertサンプル
import json
from pymongo import MongoClient

client = MongoClient(
    host = 'mongodb',
    port = 27017,
    username = "root",
    password = "password",
)

class MongoInsertSample(object):

    def __init__(self, dbName, collectionName):
        self.client = client
        self.db = self.client[dbName]
        self.collection = self.db.get_collection(collectionName)

    def find(self, projection=None,filter=None, sort=None):
        return self.collection.find(projection=projection,filter=filter,sort=sort)

    def insert_one(self, document):
        return self.collection.insert_one(document)

    def insert_many(self, documents):
        return self.collection.insert_many(documents)

mongo = MongoInsertSample('test', 'salary')

with open('./insert_data/sample.json', 'r') as file:
    file_data=json.load(file)

if isinstance(file_data,list):
    mongo.insert_many(file_data)
else:
    mongo.insert_one(file_data)

find = mongo.find()
for doc in find:
    print(doc)


