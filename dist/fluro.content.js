
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
                ignoreLoadingBar: ignoreLoadingBar
            },
            batch: {
                method: 'POST',
                ignoreLoadingBar: ignoreLoadingBar
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
                ignoreLoadingBar: ignoreLoadingBar
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

    controller.getQuery = function(id, options, variables) {

        if (!options) {
            options = {};
        }

        ////////////////////////////

        //Defer a promise
        var deferred = $q.defer();

        //Create the url
        var url = Fluro.apiURL + '/content/_query/' + id;

        var queryParams = '';

        //If variables are provided
        if (options.noCache || options.template || variables) {
            queryParams = '?';
        }

        ////////////////////////////

        if (options.noCache) {
            queryParams += '&noCache=true';
        }

        if (options.template) {
            queryParams += '&template=' + options.template;
        }

        ////////////////////////////

        if (variables) {
            //Map each parameter as a query string variable
            queryParams += _.map(variables, function(v, k) {
                return 'variables[' + k + ']=' + encodeURIComponent(v);
            }).join('&');
        }

        ////////////////////////////

        if(queryParams.length) {
            url += queryParams;
        }

        ////////////////////////////

        $http.get(url).then(function(res) {
            deferred.resolve(res.data);
        });

        ////////////////////////////

        return deferred.promise;

    }


    //////////////////////////////////////////////////

    controller.query = function(queryDetails, typeName, id, params, variables) {
        //noCache, searchInheritable) {

        var deferred = $q.defer();

        //////////////////////////////////////

        var url;

        //////////////////////////////////////
        //////////////////////////////////////
        //////////////////////////////////////

        if (!params) {
            params = {}
        }

        //////////////////////////////////////

        //If using the old school noCache instead of params object
        if (params && !_.isObject(params)) {
            params = {
                noCache: true,
            }
        }

        //////////////////////////////////////

        //Map each parameter as a query string variable
        var queryParams = _.map(params, function(v, k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
        }).join('&');


        ////////////////////////////

        if (variables) {
            //Map each parameter as a query string variable
            queryParams += _.map(variables, function(v, k) {
                return 'variables[' + k + ']=' + encodeURIComponent(v);
            }).join('&');
        }


        //////////////////////////////////////

        if (id) {

            url = Fluro.apiURL + '/content/_query/' + id;
            // if (noCache) {
            //     url += '?noCache=true';
            // }

            //If there are query string parameters append them to the url
            if (queryParams.length) {
                url += '?' + queryParams;
            }

            $http.get(url).then(function(res) {
                deferred.resolve(res.data);
            });
        }

        if (typeName && typeName.length) {

            url = Fluro.apiURL + '/content/' + typeName + '/_query';
            // if (noCache) {
            //     url += '?noCache=true';
            // }


            //If there are query string parameters append them to the url
            if (queryParams.length) {
                url += '?' + queryParams;
            }


            $http.post(url, queryDetails).then(function(res) {
                deferred.resolve(res.data);
            });
        } else {
            url = Fluro.apiURL + '/content/_query';
            // if (noCache) {
            //     url += '?noCache=true';
            // }


            //If there are query string parameters append them to the url
            if (queryParams.length) {
                url += '?' + queryParams;
            }

            $http.post(url, queryDetails).then(function(res) {
                deferred.resolve(res.data);
            });
        }

        return deferred.promise;

    }

    //////////////////////////////////////////////////

    controller.queryMultiple = function(ids, noCache, variables) {

        var deferred = $q.defer();

        //Get the url
        var url = Fluro.apiURL + '/content/_query/multiple';

        ////////////////////////////

        var variableParams;

        if (variables) {
            //Map each parameter as a query string variable
            variableParams = _.map(variables, function(v, k) {
                return 'variables[' + k + ']=' + encodeURIComponent(v);
            }).join('&');
        }

        ////////////////////////////

        if (noCache || variableParams) {
            url += '?';
        }

        ////////////////////////////

        if (variableParams && variableParams.length) {
            url += variableParams;
        }

        ////////////////////////////

        if (noCache) {
            url += '&noCache=true';
        }

        ////////////////////////////

        //Make the request
        $http({
            method: 'GET',
            url: url,
            params: {
                ids: ids,
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

        // console.log('RETRIEVE MULTIPLE', params);

        if (!params) {
            params = {};
        }

        params.ids = ids;

        $http({
            method: 'GET',
            url: url,
            params: params
        }).then(function(res) {
            deferred.resolve(res.data);
        });

        return deferred.promise;
    }

    //////////////////////////////////////////////////

    controller.populate = function(contentArray, noCache, searchInheritable) {
        var ids = _.map(contentArray, function(item) {
            if (item._id) {
                return item._id;
            } else {
                return item;
            }
        });

        // console.log('Populate no cache', noCache);
        return controller.get(ids, noCache, searchInheritable);
    }

    //////////////////////////////////////////////////

    controller.populatePartial = function(contentArray, fields, noCache, searchInheritable) {

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
        controller.retrieveMultiple(ids, noCache, {
            select: fields,
            searchInheritable: searchInheritable,
        }).then(deferred.resolve, deferred.reject);

        return deferred.promise;

    }

    //////////////////////////////////////////////////

    controller.get = function(ids, noCache, searchInheritable) {

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
            controller.retrieveMultiple(requiredIds, noCache, {
                searchInheritable: searchInheritable
            }).then(function(res) {
                //Add each item to the cache
                _.each(res, function(item) {
                    console.log('Create and Cache', item.title)
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