angular.module('fluro.content')
.service('FluroContentRetrieval', function($cacheFactory, Fluro, $q, $http) {


    //////////////////////////////////////////////////

    var controller = {}

    //////////////////////////////////////////////////

    var cache = {};

    //////////////////////////////////////////////////

    controller.query = function(queryDetails, typeName) {
        if(type && type.length) {
            return $http.post(Fluro.apiURL + '/content/'+ typeName, queryDetails);
        } else {
            return $http.post(Fluro.apiURL + '/content', queryDetails);
        }
    }

    //////////////////////////////////////////////////

    controller.populate = function(contentArray) {
        var ids = _.map(contentArray, function(item) {
            if(item._id) {
                return item._id;
            } else {
                return item;
            }
        });

         return controller.get(ids);
    }
   
    //////////////////////////////////////////////////

    controller.get = function(ids) {


        var deferred = $q.defer();

        //////////////////////////////////

        //Check if we already have the items
        var requiredIds = _.filter(ids, function(id) {
            return !(cache[id]);
        });

        //////////////////////////////////

        if (requiredIds.length) {
            console.log('Retrieving ', requiredIds.length, 'items')
            
            //////////////////////////////////////////

            //Query all of the nodes
            controller.query({
                _id:{
                    $in:requiredIds
                }
            }).then(function(res) {
                //Add each item to the cache
                _.each(res.data, function(item) {
                    //console.log('Cache', item.title)
                    cache[item._id] = item;
                })

                finish();
            }, function(res) {

                //Failed to retrieve ids
                deferred.reject(res);

            })
        } else {
            finish();
        }
        
        //////////////////////////////////////////

        function finish() {
            //Return all the requested nodes in the order we requested them
            var results = _.map(ids, function(id) {
                return cache[id];
            });

            deferred.resolve(results);
        }

        //////////////////////////////////////////

        return deferred.promise;


    }

    return controller;

});