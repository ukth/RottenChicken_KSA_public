/**
 * Created by UKth, 16-047 on 2017-05-24.
 */


var express = require('express')
var app = express()
var bodyParser = require('body-parser');

var server = app.listen(process.env.PORT || 5000, function(){
 console.log("Express server has started on port 5000/dynamic")
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var router = require('./router/main')(app);

console.log("rotten chicken is working");
