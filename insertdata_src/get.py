##jsonファイルからのimport

import json
from pymongo import MongoClient

with open('./testdata/webclass_log.json', 'r') as f:
    json_dict = json.load(f)

    print(json_dict["log1"])

# def connect_mongo():
#     with MongoClient('mongodb', 27017) as mongo_client:
#         mongo_client['admin'].authenticate("root","password")
#         return mongo_client

# def connect_mongo():
#     with MongoClient('mongodb://root:password@mongodb') as mongo_client:
#         return mongo_client


class MongoFindSample(object):

    def __init__(self, dbName, collectionName):
        self.client = MongoClient('mongodb://root:password@mongodb')
        self.db = self.client[dbName]
        self.collection = self.db.get_collection(collectionName)

    def find_one(self):
        return self.collection.find_one()

    def find(self):
        return self.collection.find()

mongo = MongoFindSample("authentication", "users")
findOne = mongo.find_one()
print(findOne)