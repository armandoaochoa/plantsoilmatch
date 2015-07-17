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
var Promise = require('es6-promise').Promise;


//DocumentDB configuration
var config = {};
config.host = process.env.HOST || "https://plantsoil.documents.azure.com:443/";
config.authKey = process.env.AUTH_KEY || "Gr8ptbHRaml0I+zk7RgDwoBRd/4TV7jq/Zr7AzCUYNdquljWzN2HPnPpl/yhlfAvCoXF4iKRP1umiCSCZ5SOHQ==";
config.databaseId = "plantsoil";
config.plantsCollectionId = "plants";
config.soilsCollectionId = "soils";

var app = express();
app.set('port', (process.env.PORT || 3001));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname + '/public')));

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

// single page app functions

// handles request for lists of plants and soils
app.get('/service', function(req, res) {
  console.log('GET /service');
  console.log(req.body);

  //get list of plants, store in return data
  var plantsPromise = new Promise(function(resolve, reject) {
    plantsoilOperator.getPlants(function(err, results) {
      err ? reject(err) : resolve({plants: results});
    });
  });

  //get list of soils, store in var data
  var soilsPromise = new Promise(function(resolve, reject) {
    plantsoilOperator.getSoils(function(err, results) {
      err ? reject(err) : resolve({soils: results});
    });
  });

  //execute together, write response
  Promise.all([plantsPromise, soilsPromise]).then(function(values) {
    console.log('values', values);
    //aggregate results in var to be returned
    var data = values.reduce(function(ret, cur) {
      Object.keys(cur).forEach(function(key) {
        ret[key] = cur[key];
      });
      return ret;
    }, {});
    res.setHeader('Cache-Control', 'no-cache');
    res.json(data);
  });
});

//handles plantsoilMatchForm submission from user, returns binary success or failure
app.post('/service', function(req, res) {
  console.log('POST /service : received request...');
  console.log(req.body);

  var plantId = req.body.plant;
  var soilId = req.body.soil;
  plantsoilOperator.checkIfCompatible(plantId, soilId, function(err, result) {
    if (err) {
      console.log(err);
    }
    console.log('POST / : writing response...', result);
    res.setHeader('Cache-Control', 'no-cache');
    res.json({goodMatch: result});
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
