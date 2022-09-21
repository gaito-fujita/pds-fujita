##oura ringのactivityデータをテーブルを参照して変換する
import json
from pymongo import MongoClient
import pandas as pd
import copy

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


#dict型において、ネストやリストが含まれているものをフラットなdict型に変換する
def flat_dict(file_data):

    file_data_converted={}
    keys=[]
    values=[]

    def open_dict(d):

        def open_list(key,l):
            for x in range(len(l)):
                if(isinstance(l[x],dict)):
                    open_dict(l[x])
                elif(isinstance(l[x],list)):
                    open_list(x,l[x])
                else:
                    keys.append(key)
                    values.append(l)

        for key in d:
            if(isinstance(d[key],dict)):
                open_dict(d[key])
            elif(isinstance(d[key],list)):
                open_list(key,d[key])
            else:
                keys.append(key)
                values.append(d[key])

    open_dict(file_data)
    file_data_converted.update(zip(keys,values))
    return file_data_converted

def change_dict_key(d, old_key, new_key, default_value=None):
    d[new_key] = d.pop(old_key, default_value)

def reform_data(file,table):
    keys=[]
    values=[]
    file_after=file.copy()
    for key in table:
        keys.append(key)
        values.append(table[key])
    for key in file:
        flag=True
        for i in range(len(keys)):
            if (key==keys[i]):
                change_dict_key(file_after,key,values[i])
                flag=False
        if(flag):
            file_after.pop(key)
    return file_after

def key_change(file,table):
    def dict_dict(d):
        def dict_list(key,l):
            for x in range(len(l)):
                if(isinstance(l[x],dict)):
                    dict_dict(l[x])
                elif(isinstance(l[x],list)):
                    dict_list(x,l[x])
                else:
                    #print("\"",key,"\"")
                    for i in table.keys():
                        if(key==i):
                            change_dict_key(d,key,table[i])

        for key in list(d.keys()):
            if(isinstance(d[key],dict)):
                #print("\"",key,"\"")
                dict_dict(d[key])
                for i in table.keys():
                    if(key==i):
                        change_dict_key(d,key,table[i])
            elif(isinstance(d[key],list)):
                if (isinstance(d[key][0],dict)):
                    #print("\"",key,"\"")
                    pass
                dict_list(key,d[key])
                for i in table.keys():
                        if(key==i):
                            change_dict_key(d,key,table[i])
            else:
                #print("\"",key,"\"")
                for i in table.keys():
                    if(key==i):
                        change_dict_key(d,key,table[i])
    dict_dict(file)


###ネストを全て解除し、フラットにする場合
#file_data_converted={}
# #このサンプルデータはtitle:activityのカテゴリ、次の処理ではそのカテゴリから参照する必要がある
# with open('./insert_data/oura_ring_activity.json', 'r') as file:
#     file_data=json.load(file)   #dict型
#     file_data_converted=flat_dict(file_data)
# #print(file_data_converted)

# #テーブルを参照して変換を行う
# mongo_table = MongoInsertSample('test_convert_table', 'oura ring')
# table=mongo_table.find(filter={'title':'activity'})
# #print(table[0])

# file_data_converted=reform_data(file_data_converted,table[0])

##変換後にpdsに挿入
# mongo = MongoInsertSample('test', 'oura ring')
# mongo.insert_one(file_data_converted)




###ネストを維持する場合
#このサンプルデータはtitle:activityのカテゴリ、次の処理ではそのカテゴリから参照する必要がある
with open('./insert_data/oura_ring_activity.json', 'r') as file:
    file_data=json.load(file)   #dict型
with open('./insert_data/table.json', 'r') as table:
    table_data=json.load(table)   #dict型

key_change(file_data,table_data)
##変換後にpdsに挿入
mongo = MongoInsertSample('test', 'oura ring')
mongo.insert_one(file_data)



