
//Create Fluro UI With dependencies
angular.module('fluro.content', [
	'fluro.util',
	'ngResource',

	]);
angular.module('fluro.content')
.service('FluroContent', function($resource, CacheManager, Fluro) {

    //////////////////////////////////////////////////

    var controller = {}

    //////////////////////////////////////////////////

    controller.resource = function(type, ignoreLoadingBar, noCache) {

        var cache = CacheManager.get(type);
        
        if(noCache) {
            cache = false;
        }
        return $resource(Fluro.apiURL + '/content/' + type + '/:id', {}, {
            update: {
                method: 'PUT', // this method issues a PUT request
                ignoreLoadingBar:ignoreLoadingBar,
            },
            save: {
                method: 'POST', // this method issues a PUT request
                ignoreLoadingBar:ignoreLoadingBar,
            },
            query: {
                method: 'GET',
                isArray: true,
                cache: cache,
                ignoreLoadingBar: true
            },
            batch: {
                method: 'POST',
                ignoreLoadingBar: true
            }
        });
    }

    //////////////////////////////////////////////////

    controller.endpoint = function(path, ignoreLoadingBar, noCache) {

        var cache = CacheManager.get(path);
        
        if(noCache) {
            cache = false;
        }
        return $resource(Fluro.apiURL + '/' + path, {}, {
            update: {
                method: 'PUT', // this method issues a PUT request
                ignoreLoadingBar:ignoreLoadingBar,
            },
            save: {
                method: 'POST', // this method issues a PUT request
                ignoreLoadingBar:ignoreLoadingBar,
            },
            query: {
                method: 'GET',
                isArray: true,
                cache: cache,
                ignoreLoadingBar: true
            },
            batch: {
                method: 'POST',
                ignoreLoadingBar: true
            }
        });
    }

    //////////////////////////////////////////////////


    return controller;

});



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

        $http.post(url, ids)
            .then(function(res) {
                deferred.resolve(res.data);
            });

        return deferred.promise;

    }




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


        $http.post(url, ids)
            .then(function(res) {
                deferred.resolve(res.data);
            });

        return deferred.promise;

    }

    //////////////////////////////////////////////////

    controller.populate = function(contentArray) {
        var ids = _.map(contentArray, function(item) {
            if (item._id) {
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

            //////////////////////////////////////////

            //Query all of the nodes
            controller.query({
                _id: {
                    $in: requiredIds
                }
            }).then(function(res) {
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