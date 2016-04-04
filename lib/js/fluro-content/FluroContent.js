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
                ignoreLoadingBar: false
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


