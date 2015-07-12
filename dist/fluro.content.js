
//Create Fluro UI With dependencies
angular.module('fluro.content', [
	'fluro.util',
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

    //////////////////////////////////////////////////

    controller.query = function(queryDetails, typeName) {
        if (typeName && typeName.length) {
            return $http.post(Fluro.apiURL + '/content/' + typeName + '/query', queryDetails);
        } else {
            return $http.post(Fluro.apiURL + '/content/query', queryDetails);
        }
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
                _.each(res.data, function(item) {
                    console.log('Create and Cache', item.title)
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