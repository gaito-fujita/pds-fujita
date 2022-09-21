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
const { PythonShell}  = require('python-shell')


/* GET /mypage */
router.get('/', (req, res) => {
  res.render('activity', {
    title: 'activity'
  });
});
router.post('/', (req, res) => {
  if(req.body.database){
    console.log(req.body.database);
  }
  if(req.body.collection){
    console.log(req.body.collection);
  }
  if(req.body.jsonfile){
    console.log(req.body.jsonfile)
  }

  res.render('activity', {
    title: 'activity'
  });
  console.log("posted!");
});

router.get('/data', (req, res) => {
  res.render('activity', {
    title: 'activity'
  });
  console.log("got!");
});



//jsonを入力フォームから取得したい
router.get('/insert',(req,res)=>{
  res.render('insert',{
    message:""
  });
  console.log("get insert page!");
})
router.post('/insert/post',(req,res)=>{
  if(req.body.database){
    console.log(req.body.database);
  }
  if(req.body.collection){
    console.log(req.body.collection);
  }
  if(req.body.jsonfile){
    //console.log(req.body.jsonfile)
  }
  var db_name="test_convert_table"
  var collection_name="oura ring"
  var table
  var data

  MongoClient.connect(mongodb_db.url, mongodb_db.options, (err, client) => {
    if (err != null || client == null) {
      console.log(" !! failed to connect mongo db server !! ")
      console.log(err)
    } else {
      console.log(" @@ Connected successfully to server @@ ")
      const db = client.db(db_name)
      var collection = db.collection(collection_name)
      //_id抜いてるけど多分意味ない
      collection.find().project({_id:0}).toArray((err, result) => {
        if (err != null) {
          console.log("err: select")
          console.log(err)
          client.close()
        } else {
          console.log("succeeded: select")
          //console.log(result)
          table=result
          client.close()
        }
      })
    }
  })
  setTimeout(() => {
    PythonShell.run('insert.py',{args:[req.body.jsonfile,JSON.stringify(table)]},function(err,result){
      if(err) throw err;
      //console.log(result)
      data=result[0]
    })
    setTimeout(() => {
      
      //console.log(data)
      data=JSON.parse(data)
      db_name=req.body.database
      collection_name=req.body.collection
      MongoClient.connect(mongodb_db.url, mongodb_db.options, (err, client) => {
        if (err != null || client == null) {
          console.log(" !! failed to connect mongo db server !! ")
          console.log(err)
        } else {
          console.log(" @@ Connected successfully to server @@ ")
          const db = client.db(db_name)
          var collection = db.collection(collection_name)
          collection.insertOne(data, (error, result) => {
            if (err != null) {
              console.log("err: insert")
              console.log(err)
              client.close()
            } else {
              console.log("succeeded: insert")
              console.log(db_name)
              console.log(collection_name)
              console.log(result)
              client.close()
            }
          });
        }
      })
    }, 500);
  }, 500);
  
  //console.log(typeof JSON.parse(req.body.jsonfile))
  res.render('insert',{
    message:"登録完了しました"
  });
  console.log("post insert!");
})

//oura ring activity
router.get('/oura_ring_activity',(req,res)=>{
  var db_name = "test"
  var collection_name = "oura ring"
  var data

  MongoClient.connect(mongodb_db.url, mongodb_db.options, (err, client) => {
    if (err != null || client == null) {
      console.log(" !! failed to connect mongo db server !! ")
      console.log(err)
    } else {
      console.log(" @@ Connected successfully to server @@ ")
      const db = client.db(db_name)
      var collection = db.collection(collection_name)
      collection.find().sort({日時:1}).toArray((err, result) => {
        if (err != null) {
          console.log("err: select")
          console.log(err)
          client.close()
        } else {
          console.log("succeeded: select")
          //console.log(result)
          data=result
          client.close()
        }
      })
    }
  })
  setTimeout(() => {
    res.render('oura_ring_activity',{
      data:data
    })
  }, 500);
})

module.exports = router;