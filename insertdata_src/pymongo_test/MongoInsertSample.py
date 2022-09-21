##ただのinsertサンプル

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
find = mongo.find()
print('--------------------登録前--------------------')
for doc in find:
    print(doc)

print('-------------------登録情報-------------------')
result = mongo.insert_one({'name':'加藤','salary':400000})
print(type(result))
print(result)
print(result.inserted_id)

print('--------------------登録後--------------------')
find = mongo.find()
for doc in find:
    print(doc)