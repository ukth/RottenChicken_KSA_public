/**
* Created by UKth, 16-047 on 2017-04-23.
*/
module.exports = function(app)
{
  var Iconv = require('iconv').Iconv;
  var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');

  // 키보드
  var config = { // Didn't split config file, so I made copy for github public repository
    user: '#', //env var: PGUSER
    database: '#', //env var: PGDATABASE
    password: '#', //env var: PGPASSWORD
    host: 'ec2-#.compute-1.amazonaws.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  };

  var pg = require('pg');

  //this initializes a connection pool
  //it will keep idle connections open for a 30 seconds
  //and set a limit of maximum 10 idle clients
  var pool = new pg.Pool(config);

  // to run a query we can acquire a client from the pool,
  // run a query on the client, and then return the client to the pool
  app.post('/coupon_post',function(req,res){
    console.log('ACCESSED by /coupon_post')
    // db접속
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //'SELECT id, active FROM userkeys WHERE userkey = $1'

      var chicken_id=req.body["chicken_id"]
      var user_id=req.body["user_id"]
      var cnt=req.body["cnt"]
      console.log('c:'+chicken_id)
      console.log('u:'+user_id)
      console.log(cnt)
      if(chicken_id==0){var chid='chicken0'}
      if(chicken_id==1){var chid='chicken1'}
      if(chicken_id==2){var chid='chicken2'}
      client.query(`UPDATE coupon set ${chid}=$1 where user_id=$2`, [cnt,user_id], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);
        console.log('aa')
        if(err) {
          return console.error('error running query', err);
        }
        res.end('success')
      });
    });


    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });

  app.post('/coupon_load_user',function(req,res){
    console.log('ACCESSED by /coupon_load_user')
    // db접속
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //'SELECT id, active FROM userkeys WHERE userkey = $1'
      var str=req.body
      client.query('SELECT chicken0,chicken1,chicken2 FROM coupon where user_id=$1', [req.body["user_id"]], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);
        if(err) {
          return console.error('error running query', err);
        }
        if(result["rows"].length==0){
          var table=[0,0,0]
          client.query('INSERT into coupon (chicken0,chicken1,chicken2,user_id) VALUES(0,0,0,$1)', [req.body["user_id"]], function(err, result) {
            //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
            done(err);
            if(err) {
              return console.error('error running query', err);
            }
            return;
          });
        }else{var table=[result["rows"][0]["chicken0"],result["rows"][0]["chicken1"],result["rows"][0]["chicken2"]]}
        res.end(String(table));
        return;
      });
    });


    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });

  app.post('/coupon_load',function(req,res){
    console.log('ACCESSED by /coupon_load')
    // db접속
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //'SELECT id, active FROM userkeys WHERE userkey = $1'
      var chicken_id=req.body["chicken_id"]
      client.query('SELECT * FROM coupon', [], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);
        var table=[[],[]]//
        console.log(result["rows"])
        if(err) {
          return console.error('error running query', err);
        }
        for(var i=0; i<result["rows"].length;i++){
          console.log(chicken_id)
          if(Number(chicken_id)==0){
            var count=result["rows"][i]["chicken0"]
            console.log('choanged:'+count)
          }
          if(chicken_id==1){var count=result["rows"][i]["chicken1"]}
          if(chicken_id==2){var count=result["rows"][i]["chicken2"]}
          console.log(count)
          console.log(result["rows"][i]["chicken0"])

          table[0].push(result["rows"][i]["user_id"])
          table[1].push(count)
          console.log('a')
        }
        console.log(table)
        res.end(String(table));
        console.log('aaaaa')
        return;
      });
    });


    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });

  app.post('/coupon_loadall',function(req,res){
    console.log('ACCESSED by /coupon_loadall')
    // db접속
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //'SELECT id, active FROM userkeys WHERE userkey = $1'

      client.query('SELECT chicken0,chicken1,chicken2 FROM coupon', [], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);
        var table=[0,0,0]
        if(err) {
          return console.error('error running query', err);
        }
        for(var i=0; i<result["rows"].length;i++){
          table[0]+=Number(result["rows"][i]["chicken0"])
          table[1]+=Number(result["rows"][i]["chicken1"])
          table[2]+=Number(result["rows"][i]["chicken2"])
        }
        res.end(String(table));
        return;
      });
    });

    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });

  app.post('/review_post',function(req,res){
    console.log('ACCESSED by /review_post!!');
    // db접속
    console.log(req.body)
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }

      //'SELECT id, active FROM userkeys WHERE userkey = $1'
      var chicken_id=req.body["chicken_id"]
      var user_id=req.body["user_id"]
      var text=req.body["text"]
      client.query('INSERT into review (chicken_id,user_id,text) VALUES($1,$2,$3)', [chicken_id,user_id,text], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);
        if(err) {
          return console.error('error running query', err);
        }
        res.end('success');
        return;
      });
    });

    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });

  app.post('/review_load',function(req,res){
    console.log('ACCESSED by /review_load')
    // db접속
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //'SELECT id, active FROM userkeys WHERE userkey = $1'
      var str=req.body
      console.log(str)
      console.log(typeof str)
      client.query('SELECT user_id,text FROM review where chicken_id=$1', [req.body["chicken_id"]], function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done(err);
        var table=[[],[]]
        if(err) {
          return console.error('error running query', err);
        }
        for(var i=0; i<result["rows"].length;i++){
          table[0].push(result["rows"][i]["user_id"])
          table[1].push(result["rows"][i]["text"])
        }
        console.log(String(table))
        res.end(String(table));
        return;
      });
    });

    pool.on('error', function (err, client) {
      // if an error is encountered by a client while it sits idle in the pool
      // the pool itself will emit an error event with both the error and
      // the client which emitted the original error
      // this is a rare occurrence but can happen if there is a network partition
      // between your application and the database, the database restarts, etc.
      // and so you might want to handle it and at least log it out
      console.error('idle client error', err.message, err.stack)
    });
  });


}

console.log('main function is working')
