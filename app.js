//backend requirements
var DocumentDBClient = require('documentdb').DocumentClient;
var PlantSoilOperator = require('./plantsoilOperator');

//boilerplate requirements
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var http = require('http');


//DocumentDB configuration
var config = {};
config.host = process.env.HOST || "https://plantsoil.documents.azure.com:443/";
config.authKey = process.env.AUTH_KEY || "Gr8ptbHRaml0I+zk7RgDwoBRd/4TV7jq/Zr7AzCUYNdquljWzN2HPnPpl/yhlfAvCoXF4iKRP1umiCSCZ5SOHQ==";
config.databaseId = "plantsoil";
config.plantsCollectionId = "plants";
config.soilsCollectionId = "soils";

// - routes = require('./routes/index');
// - var users = require('./routes/users');

var app = express();
app.set('port', (process.env.PORT || 3001));

//NOTE: kept getting error that I didn't specify a view engine, tried adding the lines below, didn't work...
//NOTE: The Facebook React tutorial I used doesn't specify a view engine, shouldn't be necessary.
// view engine setup
//app.set('/', path.join(__dirname + '/'));
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// PlantSoil App
var docDbClient = new DocumentDBClient(config.host, {
  masterKey: config.authKey
});
var plantsoilOperator = new PlantSoilOperator(docDbClient, config.databaseId, config.plantsCollectionId, config.soilsCollectionId);


plantsoilOperator.init(function(err) {
  if (err) {
    console.log(err);
  }
});

// - app.use('/', routes);
// - app.use('/users', users);

// single page app functions

// handles request for lists of plants and soils
app.get('/', function(req, res) {
    var data = [];
    data[0] = []; //plants
    data[1] = []; //soils

    //get list of plants, store in var data
    var pushPlants = function(callback) {
      plantsoilOperator.getPlants(function(err, results) {
        if (err) {
          callback(err);
        }

        //iterate through results object, store each plant in data[0]
        for (var i = 0; i < results.length; i++) {
          data[0].push(results[i]);
        }

        callback(null);
      });
    };

    //get list of soils, store in var data
    var pushSoils = function(callback) {
      plantsoilOperator.getSoils(function(err, results) {
        if (err) {
          callback(err);
        }

        //iterate through results object, store each soil in data[1]
        for (var i = 0; i < results.length; i++) {
          data[1].push(results[i]);
        }
        console.log(data);
        callback(null);
      });
    };

    //execute in parallel, write response to client
    async.parallel([pushPlants, pushSoils], function () {
      console.log('GET / : writing response now...');
      res.setHeader('Cache-Control', 'no-cache');
      res.JSON(data);
    });
});

//handles plantsoilMatchForm submission from user, returns binary success or failure
app.post('/', function(req, res) {
  console.log('POST / : received request...');
  console.log(req.body);

  var plantId = req.body.plant;
  var soilId = req.body.soil;
  plantsoilOperator.checkIfCompatible(plantId, soilId, function(err, result) {
    if (err) {
      console.log(err);
    }
    console.log('POST / : writing response...', result);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(result);
  });

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    next(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  next(err);
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:', app.get('port'));
});

module.exports = app;
