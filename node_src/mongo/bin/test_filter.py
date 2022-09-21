import json,sys
from pymongo import MongoClient
from pymongo import DESCENDING
from pymongo import ASCENDING
from bson.json_util import dumps #json形式での取得に必要

#['a18tn036','WiFiシステム','WiFiアクセスポイント','IPアドレス','MACアドレス'] がnodeから送られてくる

#std_in = sys.stdin.readline() #test_filter.pyを呼び出した時の引数
std_in =['a18tn036','WiFiシステム','WiFiアクセスポイント','IPアドレス','MACアドレス']
print(std_in)
pds_user_id = std_in[0]

client = MongoClient(
    host = 'mongodb',
    port = 27017,
    username = "root",
    password = "password",
)

db = client["pds"]
collection = db[pds_user_id]

def filterring(category,projection_category):
    condition_projection = {'data_id':0,'source':0,'_id':0,'pds_user_id':0} #基本のフィルタリング
    condition_filter = {'data_category': category} #情報カテゴリの指定
    find = collection.find(projection= condition_projection,filter = condition_filter)

    for jsn in find:
        jsn_dumps = (dumps(jsn,ensure_ascii=False)) #ensure_asciiは日本語を読み込むため
        jsn_loads = json.loads(jsn_dumps) #jsonを辞書化

        for key in projection_category:
            dict_search(jsn_loads,key) #情報の削除
        print(jsn_loads)

def dict_search(d,key): #ネストされている項目の削除
    if not d or not key:
        return None
    elif isinstance(d, dict):
        if key in d:
            return d.pop(key)
        else:
            l = [dict_search(d.get(dkey),key) for dkey in d if isinstance(d.get(dkey),dict) or isinstance(d.get(dkey),list)]
            return [lv for lv in l if not lv is None].pop(0) if any(l) else None
    elif isinstance(d,list):
        li = [dict_search(e,key) for e in d if isinstance(e,dict) or isinstance(e,list)]
        return [liv for liv in li if not liv is None].pop(0) if any(li) else None
    else:
        return None

            
###WiFiシステムからの取得
category = std_in[1]
projection_category = []
for i in range(len(std_in)):
    if i==0 or i==1:
        pass
    else:
        projection_category.append(std_in[i])
print(projection_category)

filterring(category,projection_category)


###教育支援システム(WebClass)からの取得
category = "教育支援システム(WebClass)"
projection_category = ["MACアドレス"]

filterring(category,projection_category)


###電子錠システムからの取得
category = "電子錠システム"
projection_category = ["電子錠"]

filterring(category,projection_category)


###入退館システムからの取得
category = "入退館システム"
projection_category = ["ゲート名"]

filterring(category,projection_category)


###図書貸出システムからの取得
category = "図書貸出システム"
projection_category = ["担当者"]

filterring(category,projection_category)


###QR着席管理システムからの取得
category = "QR着席管理システム"
projection_category = ["MACアドレス"]

filterring(category,projection_category)


client.close()
