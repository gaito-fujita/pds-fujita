const express = require('express');
const passport = require('passport');
const router = express.Router();
const { Client } = require('@elastic/elasticsearch');
const { ElasticsearchClientError } = require('@elastic/elasticsearch/lib/errors');
const client = new Client({
  node: 'http://10.11.2.8:9201',
});
// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
const mongodb_db = require('../config/mongodb_db')
const MongoClient = require('mongodb').MongoClient;
//const { PythonShell}  = require('python-shell')



/* GET /mypage */
router.get('/', (req, res) => {
  res.render('mypage', {
    title: 'マイページ',
    user: req.user,
  });
});

/** 学籍番号で検索し、最新のログ10個を取ってくる */
var create_query = (student_number) => {
  return {
    "index": '.ds-logs-generic-default-2022.01.09-000001',
    // type: '_doc', // uncomment this line if you are using {es} ≤ 6
    "body": {
      "query": {
        "match": { "message": student_number }
      },
      "size": 10,
      "sort": [{
        "@timestamp": { "order": "desc" }
      }]
    }
  }
}

/** メールアドレスから学籍番号を取得する */
async function search(email) {
  var student_number = email.split('@')[0]; //@でスプリットをかける
  const { body } = await client.search(create_query(student_number)); //elsticsearchのsearch()の処理を待ちたいので非同期処理で書く
  // console.log(body.hits.hits);
  return body.hits.hits;
}

async function split_email(email) {
  var student_number = email.split('@')[0]; //@でスプリットをかける
  return student_number
}

/* GET /mypage/data */
router.get('/data',(req,res)=>{
  var get_jsn = []
  var list = []
  var list_length_1
  var list_length_2

  async function connect_mongo() {
    var collection_name = "a18tn036" //テスト用で藤田の学籍番号で検索
    console.log("---- test connect mongodb server ---")

    // ../config/mongodb_dbからurl, options, db_name, collection_nameをインポートしてるので、それを使う
    MongoClient.connect(mongodb_db.url, mongodb_db.options, (err, client) => {
      if (err != null || client == null) {
        console.log(" !! failed to connect mongo db server !! ")
        console.log(err)
      } else {
        console.log(" @@ Connected successfully to server @@ ")
        const db = client.db(mongodb_db.db_name);
        var collection = db.collection(collection_name);
        collection.find().sort({date:1}).toArray((err, result) => {
          if (err != null) {
            console.log("err: select")
            console.log(err)
            client.close()
          } else {
            console.log("succeeded: select")
            //console.log(result[1].date) //確認用にコンソールに表示(BSON形式らしい)
            collection_name = "filter_format" //filter_formatコレクションから整形方法を取得
            collection = db.collection(collection_name);
            //resultのデータごとに整形方法を指定
            //console.log(result)
            var result_jsn
            async function for_format(){
              for(i=0;i<result.length;i++){
                setTimeout(function (){
                  result_jsn = result[i]
                },10)
                //console.log(result[i].data_category)
                //console.log(result_jsn.data_category)
                //console.log(i)
                await get_format()
              }
            }
            function get_format(){
              return new Promise(resolve=>{
              
                setTimeout(() => {
                  collection.find({"category":result[i].data_category}).toArray((err,format_result)=>{
                    if(err!=null){
                      console.log("err: format select")
                      console.log(err)
                      client.close()
                    }else{
                      console.log("succeeded: format select")
                      //削除する「詳細」の項目を配列で取得
                      //console.log(format_result)
                      //console.log(result_jsn.data_category)
                      for(j=0;j<format_result[0].projection_category.length;j++){
                        delete result_jsn.detail[format_result[0].projection_category[j]]
                      }
                      //console.log(result_jsn)
                      get_jsn.push(result_jsn)
                    }
                  })
                  resolve()
                }, 30)
                
              })
            }
            (async ()=>{
              await for_format()
            }).call()
            //console.log(result_jsn.data_category)
            setTimeout(function client_close(){
              client.close()
            },500)
          }
        })
      }
    })
  }
  
  connect_mongo()
  setTimeout(function (){
    for(k=0;k<get_jsn.length;k++){
      delete get_jsn[k]._id
      delete get_jsn[k].data_id
      delete get_jsn[k].source
      delete get_jsn[k].pds_user_id
    }
    //console.log(get_jsn)
    list.push(["日時","内容","詳細","情報カテゴリ","このデータを参照しているサービス"])//項目名
    for(i=0;i<get_jsn.length;i++){
      var list_jsn = []
      list_jsn.push(get_jsn[i].date)
      list_jsn.push(get_jsn[i].message)
      //詳細だけ個別の手順
      var s1=get_jsn[i].detail
      s1=JSON.stringify(s1)
      const j1 = JSON.parse(s1)
      const keyList = Object.keys(j1)
      var list_jsn_list = []
      for(j=0;j<keyList.length;j++){
        list_jsn_list.push(keyList[j]+': '+j1[keyList[j]])
      }
      //console.log(list_jsn_list)
      list_jsn.push(list_jsn_list)
      list_jsn.push(get_jsn[i].data_category)
      list_jsn.push(get_jsn[i].referring_service)
      list.push(list_jsn)
    }
    //console.log(list) //JSONで直接表示するのは難しかったため、二次元配列にしている、詳細だけはさらに配列持ち
  },550)
  setTimeout(function(){
    res.render('data', {
      title: 'data',
      list: list
    });
  },600)  
})

/* GET /mypage/filter */
router.get('/filter', (req, res) => {
  var filter_data = [] //mongoから取得しブラウザに表示するメッセージの要素となる
  var filter_message //ブラウザに表示するメッセージ

  async function connect_mongo() {
    console.log("---- test connect mongodb server ---")
    var student_number = "a18tn036" //テスト用で藤田の学籍番号で検索
    var obj = { "log1.id": student_number };//検索条件の指定

    // ../config/mongodb_dbからurl, options, db_name, collection_nameをインポートしてるので、それを使う
    MongoClient.connect(mongodb_db.url, mongodb_db.options, (err, client) => {
      if (err != null || client == null) {
        console.log(" !! failed to connect mongo db server !! ")
        console.log(err)
      } else {
        console.log(" @@ Connected successfully to server @@ ")
        const db = client.db(mongodb_db.db_name);
        const collection = db.collection(mongodb_db.collection_name);
        collection.find(obj).toArray((err, result) => {
          if (err != null) {
            console.log("err: select")
            console.log(err)
            client.close()
          } else {
            console.log("succeeded: select")
            console.log(result) //確認用にコンソールに表示(BSON形式らしい)
            filter_data.push(result[0].log1.id)
            filter_data.push(result[0].log1.data)
            filter_data.push(result[0].log1.log)
            filter_message = filter_data[0] + ' が日時 ' + filter_data[1] + ' に ' + filter_data[2]
            client.close()
          }
        })
      }
    })
  }
  //もはやawaitとかは意味をなしていないが、理由なく残している
  async function filter() {
    await connect_mongo()
    setTimeout(function filter_render() {
      res.render('filter', {
        title: 'filter',
        message: filter_message
      });
      console.log("filter_render fin")
    }, 100);//軽いデータなら20msとかでギリ間に合う
  }
  filter()
})


/* GET /mypage/ocunet_log */
router.get('/ocunet_log', (req, res) => {
  //もしログインしていたら
  if (req.user) {
    search(req.user.email)//ログインしているユーザーのemailを引数にsearch関数を呼ぶ
      //search()でエラーが出た時の処理
      .catch(console.log)
      //search()の処理が無事に終わったら
      .then(value => {//search()の返り値がvalueに代入される
        if (value) {
          hits = value;
        } else {
          hits = ['該当するものはありません'];
        }
        res.render('list', {//以下の引数をlist.ejsに渡してレンダーする
          title: 'ネットワークログ',
          user: req.user,
          hits: hits,
        });
      });
    //もしログインしてなかったら
  } else {
    res.redirect('/users/login');//ログインページにリダイレクト
  }
})

module.exports = router;