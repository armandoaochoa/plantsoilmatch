var DocumentDBClient = require('documentdb').DocumentDBClient;

var DocDBUtils = {

  //we need the two utilities in order to perform queries to getPlants, getSoils, and checkIfCompatible

  //is used to grab plantsoil database so we can subsequently grab plants and soils collections
  getDatabase: function(client, databaseId, callback) {
    var querySpec = {
      query: 'SELECT * FROM root r WHERE r.id=@id',
      parameters: [{
        name: '@id',
        value: databaseId
      }]
    };

    client.queryDatabases(querySpec).toArray(function(err, results) {
      if (err) {
        callback(err);
      }

      callback(null, results[0]);
    });
  },

  //is used to grab plants/soils collection for additional querying
  getCollection: function(client, databaseLink, collectionId, callback) {
    var querySpec = {
      query: 'SELECT * FROM root r WHERE r.id=@id',
      parameters: [{
        name: '@id',
        value: collectionId
      }]
    };

    client.queryCollections(databaseLink, querySpec).toArray(function(err, results) {
      if (err) {
        callback(err);
      }

      callback(null, results[0]);
    });
  },

};

module.exports = DocDBUtils;
