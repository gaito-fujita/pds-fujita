##oura ringのactivityデータをテーブルを参照して変換する
import json

import copy
import sys

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

file_data_converted={}
#このサンプルデータはtitle:activityのカテゴリ、次の処理ではそのカテゴリから参照する必要がある
if len(sys.argv)<2:
    sys.exit()
else:
    file=sys.argv[1]
    table=sys.argv[2]
    table_data=json.loads(table)

    file_data=json.loads(file)   #dict型
    file_data_converted=flat_dict(file_data)

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

    file_data_converted=reform_data(file_data_converted,table_data[0])

    print(json.dumps(file_data_converted,ensure_ascii=False))



