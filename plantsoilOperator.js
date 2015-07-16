var DocumentDBClient = require('documentdb').DocumentClient;
var docdbUtils = require('./docdbUtils');
var async = require('async');

function PlantSoilOperator(documentDBClient, databaseId, plantsCollectionId, soilsCollectionId ) {
  this.client = documentDBClient;
  this.databaseId = databaseId;
  this.plantsCollectionId = plantsCollectionId;
  this.soilsCollectionId = soilsCollectionId;

  this.database = null;
  this.plantsCollection = null;
  this.soilsCollection = null;
}

PlantSoilOperator.prototype = {

  //initialize by grabbing plantsoil database and plants/soils collections
  init: function(callback) {
    var self = this;

    docdbUtils.getDatabase(self.client, self.databaseId, function(err, db) {
      if (err) {
        callback(err); //change to console.log if you have problems
      }

      self.database = db;

      async.series([
        function(callback) {
          docdbUtils.getCollection(self.client, self.database._self, self.plantsCollectionId, function(err, coll) {
            if (err) {
              callback(err);
            }

            self.plantsCollection = coll;
            console.log('Here37', self.plantsCollection);
            callback(null);
          });

          //callback(null);
        },

        function(callback) {
          docdbUtils.getCollection(self.client, self.database._self, self.soilsCollectionId, function(err, coll) {
            if (err) {
              callback(err);
            }

            self.soilsCollection = coll;
            console.log('Here51', self.soilsCollection);
            callback(null);
          });

          //callback(null);
        },
      ],
        function(err, results) {
          if (err) {
            callback(err);
          }
          console.log('HERE');
        }
      );

      //callback(null);
    });

  },

  //get list of plants for user to choose from
  getPlants: function(callback) {
    var self = this;

    var querySpec = {
      query: 'SELECT p.id FROM Plants p'
    };

    self.client.queryDocuments(self.plantsCollection._self, querySpec).toArray(function(err, results) {
      if (err) {
        callback(err);
      } else {
        //console.log(results);
        callback(null, results);
      }
    });
  },

  //get list of soils for user to choose from
  getSoils: function(callback) {
    var self = this;

    var querySpec = {
      query: 'SELECT s.id FROM Soils s'
    };

    self.client.queryDocuments(self.soilsCollection._self, querySpec).toArray(function(err, results) {
      if (err) {
        callback(err);
      } else {
        callback(null, results);
      }
    });
  },

  //checks if user submitted plant and soil are compatible with each other
  checkIfCompatible: function(userPlant, userSoil, callback) {
    var self = this;

    var querySpec = {
      query: 'SELECT {"Plant": p.id, "Soil": s.id} FROM Plants p JOIN s IN p.compatibleSoils WHERE p.id=@userPlantId AND s.id=@userSoilId',
      parameters: [{
        name: '@userPlantId',
        value: userPlant
      },
      {
        name: '@userSoilId',
        value: userSoil
      }
      ]
    };

    //if 0 results, they are incompatible; if 1 result, they are compatible
    self.client.queryDocuments(self.plantsCollection._self, querySpec).toArray(function(err, results) {
      if (err) {
        callback(err);
      }

      if (!err && results.length === 0) {
        //incompatible
        callback(null, 0);
      }
      if (!err && results.length == 1) {
        //compatible
        callback(null, 1);
      }
    });
  }

};

module.exports = PlantSoilOperator;
