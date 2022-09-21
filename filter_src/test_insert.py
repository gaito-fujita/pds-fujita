import json
from pymongo import MongoClient
from bson.json_util import dumps #json形式での取得に必要

client = MongoClient(
    host = 'mongodb',
    port = 27017,
    username = "root",
    password = "password",
)

user_id = "a18tn036" #ユーザーID


#処理
def connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value):
    find = collection_1.find(filter=condition_filter)
    for jsn in find:
        jsn_dumps = (dumps(jsn,ensure_ascii=False)) #ensure_asciiは日本語を読み込むため
        jsn_loads = json.loads(jsn_dumps) #jsonを辞書化

        for key in delete_key:
            jsn_loads.pop(key) #情報の削除

        for i in range(len(add_key)):
            jsn_loads[add_key[i]] = add_value[i] #情報の追加
        collection_2.insert_one(jsn_loads)


###academmicからデータを変換###
#設定の記述
db_1 = client["test_insert_db"]
collection_1 = db_1["academic"]
db_2 = client["pds"]
collection_2 = db_2[user_id]
condition_filter = {"user_id": user_id}
delete_key = ["_id","user_id"] #削除する項目
add_key = ["data_category","referring_service","pds_user_id"] #追加する項目(valueと一致させる)
add_value = ["教育支援システム(WebClass)","出席管理システム",user_id] #追加する値(keyと一致させる)

connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value)



###e_keyからデータを変換###
#設定の記述
db_1 = client["test_insert_db"]
collection_1 = db_1["e_key"]
db_2 = client["pds"]
collection_2 = db_2[user_id]
condition_filter = {"user_id": user_id}
delete_key = ["_id","user_id"] #削除する項目
add_key = ["data_category","referring_service","pds_user_id"] #追加する項目(valueと一致させる)
add_value = ["電子錠システム","",user_id] #追加する値(keyと一致させる)

connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value)



###entryからデータを変換###
#設定の記述
db_1 = client["test_insert_db"]
collection_1 = db_1["entry"]
db_2 = client["pds"]
collection_2 = db_2[user_id]
condition_filter = {"user_id": user_id}
delete_key = ["_id","user_id"] #削除する項目
add_key = ["data_category","referring_service","pds_user_id"] #追加する項目(valueと一致させる)
add_value = ["入退館システム","図書貸出システム",user_id] #追加する値(keyと一致させる)

connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value)



###libraryからデータを変換###
#設定の記述
db_1 = client["test_insert_db"]
collection_1 = db_1["library"]
db_2 = client["pds"]
collection_2 = db_2[user_id]
condition_filter = {"user_id": user_id}
delete_key = ["_id","user_id"] #削除する項目
add_key = ["data_category","referring_service","pds_user_id"] #追加する項目(valueと一致させる)
add_value = ["図書貸出システム","教育支援システム",user_id] #追加する値(keyと一致させる)

connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value)



###qrからデータを変換###
#設定の記述
db_1 = client["test_insert_db"]
collection_1 = db_1["qr"]
db_2 = client["pds"]
collection_2 = db_2[user_id]
condition_filter = {"user_id": user_id}
delete_key = ["_id","user_id"] #削除する項目
add_key = ["data_category","referring_service","pds_user_id"] #追加する項目(valueと一致させる)
add_value = ["QR着席管理システム","電子錠システム",user_id] #追加する値(keyと一致させる)

connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value)



###wifiからデータを変換###
#設定の記述
db_1 = client["test_insert_db"]
collection_1 = db_1["wifi"]
db_2 = client["pds"]
collection_2 = db_2[user_id]
condition_filter = {"user_id": user_id}
delete_key = ["_id","user_id"] #削除する項目
add_key = ["data_category","referring_service","pds_user_id"] #追加する項目(valueと一致させる)
add_value = ["WiFiシステム","登校管理システム",user_id] #追加する値(keyと一致させる)

connect(collection_1,collection_2,condition_filter,delete_key,add_key,add_value)



client.close()