angular.module('fluro.content').service('FluroContentRetrieval', function($cacheFactory, Fluro, $q, $http) {


    //////////////////////////////////////////////////

    var controller = {}

    //////////////////////////////////////////////////

    var cache = {};
    var queryCache = {};

    //////////////////////////////////////////////////

    controller.getCollection = function(id, noCache) {

        var deferred = $q.defer();

        var url = Fluro.apiURL + '/content/_collection/' + id;
        if (noCache) {
            url += '?noCache=true';
        }

        $http.get(url).then(function(res) {
            deferred.resolve(res.data);
        });

        return deferred.promise;
    }


    //////////////////////////////////////////////////

    controller.getMultipleCollections = function(ids, noCache) {

        var deferred = $q.defer();

        var url = Fluro.apiURL + '/content/_collection/multiple';
        if (noCache) {
            url += '?noCache=true';
        }

        $http({
            method: 'GET',
            url: url,
            params: {
                ids: ids
            }
        }).then(function(res) {
            deferred.resolve(res.data);
        });

/**        
        $http.post(url, ids)
            .then(function(res) {
                deferred.resolve(res.data);
            });
/**/

        return deferred.promise;

    }

    /**
    
    //////////////////////////////////////////////////

    controller.queryMultiple = function(ids, noCache) {

        var deferred = $q.defer();


        var url = Fluro.apiURL + '/content/_query/multiple';
        if (noCache) {
            url += '?noCache=true';
        }

        $http({
            method: 'GET',
            url: url,
            params: {
                ids: ids
            }
        }).then(function(res) {
            deferred.resolve(res.data);
        });

        return deferred.promise;
    }


    /**/




    //////////////////////////////////////////////////

    controller.query = function(queryDetails, typeName, id, noCache) {

        var deferred = $q.defer();

        var url;

        if (id) {

            url = Fluro.apiURL + '/content/_query/' + id;
            if (noCache) {
                url += '?noCache=true';
            }

            $http.get(url).then(function(res) {
                deferred.resolve(res.data);
            });
        }

        if (typeName && typeName.length) {

            url = Fluro.apiURL + '/content/' + typeName + '/_query';
            if (noCache) {
                url += '?noCache=true';
            }

            $http.post(url, queryDetails).then(function(res) {
                deferred.resolve(res.data);
            });
        } else {
            url = Fluro.apiURL + '/content/_query';
            if (noCache) {
                url += '?noCache=true';
            }

            $http.post(url, queryDetails).then(function(res) {
                deferred.resolve(res.data);
            });
        }

        return deferred.promise;

    }

    //////////////////////////////////////////////////

    controller.queryMultiple = function(ids, noCache) {

        var deferred = $q.defer();


        var url = Fluro.apiURL + '/content/_query/multiple';
        if (noCache) {
            url += '?noCache=true';
        }

        $http({
            method: 'GET',
            url: url,
            params: {
                ids: ids
            }
        }).then(function(res) {
            deferred.resolve(res.data);
        });

        return deferred.promise;
    }

    //////////////////////////////////////////////////

    controller.retrieveMultiple = function(ids, noCache, params) {

        var deferred = $q.defer();

        var url = Fluro.apiURL + '/content/multiple';
        if (noCache) {
            url += '?noCache=true';
        }

        if(!params) {
            params = {};
        }

        params.ids = ids;

        $http({
            method: 'GET',
            url: url,
            params:params
        }).then(function(res) {
            deferred.resolve(res.data);
        });

        return deferred.promise;
    }

    //////////////////////////////////////////////////

    controller.populate = function(contentArray, noCache) {
        var ids = _.map(contentArray, function(item) {
            if (item._id) {
                return item._id;
            } else {
                return item;
            }
        });

        console.log('Populate no cache', noCache);
        return controller.get(ids, noCache);
    }

    //////////////////////////////////////////////////

    controller.populatePartial = function(contentArray, fields, noCache) {

        var deferred = $q.defer();

        //Get the items as ids
        var ids = _.map(contentArray, function(item) {
            if (item._id) {
                return item._id;
            } else {
                return item;
            }
        });

        //////////////////////////////////////

         //Query all of the nodes by a GET request
        return controller.retrieveMultiple(ids, noCache, {select:fields}).then(deferred.resolve, deferred.reject);

    }

    //////////////////////////////////////////////////

    controller.get = function(ids, noCache) {

        var deferred = $q.defer();

        //////////////////////////////////

        //Check if we already have the items
        var requiredIds = _.filter(ids, function(id) {
            return !(cache[id]);
        });

        //////////////////////////////////

        if (requiredIds.length) {

            //////////////////////////////////////////
            
            //Query all of the nodes by a GET request
            controller.retrieveMultiple(requiredIds, noCache).then(function(res) {
                //Add each item to the cache
                _.each(res, function(item) {
                    // console.log('Create and Cache', item.title)
                    cache[item._id] = item;
                })

                finish();
            }, function(res) {

                //Failed to retrieve ids
                deferred.reject(res);

            })
/**/

            //////////////////////////////////////////
            /** 
            //Query all of the nodes by POSTing a query of ids
            controller.query({
                _id: {
                    $in: requiredIds
                }
            }, null, null, noCache).then(function(res) {
                //Add each item to the cache
                _.each(res, function(item) {
                    // console.log('Create and Cache', item.title)
                    cache[item._id] = item;
                })

                finish();
            }, function(res) {

                //Failed to retrieve ids
                deferred.reject(res);

            })
/**/
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

    //////////////////////////////////////////

    return controller;

});