app.factory("proxyService", function ($http, $q, config, blockChainService, chromeService) {

    var currentServerList = null;
    var lastServerListQuery = null;

    return {
        getAvailableServerList: function () {
            var deferred = $q.defer();
            var now = new Date();

            // Load cache data ...
            var qServerList = chromeService.loadSetting("serverList");
            var qLastServerListQuery = chromeService.loadSetting("lastServerListQuery");

            qServerList.then(function (serverList) {
                if (serverList)
                    currentServerList = serverList;
            });

            qLastServerListQuery.then(function (lastQuery) {
                if (lastQuery)
                    lastServerListQuery = new Date(lastQuery);
            });

            $q.all([qServerList, qLastServerListQuery]).then(function () {
                if (currentServerList === null || (currentServerList != null && Object.keys(currentServerList).length === 0) ||
                    lastServerListQuery === null ||
                    ((now.getTime() - lastServerListQuery.getTime()) > config.serverCacheTime)) {

                    // Deliver old data, if available ...
                    if (currentServerList != null && Object.keys(currentServerList).length) {
                        deferred.resolve(currentServerList);
                    }

                    // Start update to get new data ...
                    var bc = blockChainService.getAvailableServers();

                    bc.then(function (serverData) {
                        var res = {};

                        // Sort by country ...
                        serverData.forEach(function (server) {
                            if (!res[server.countryCode])
                                res[server.countryCode] = [];

                            res[server.countryCode].push(server);
                        });

                        // Update cache, but only if we got something ...
                        if (Object.keys(res).length) {
                            currentServerList = res;

                            chromeService.storeSetting("serverList", currentServerList);
                        }

                        lastServerListQuery = new Date();
                        chromeService.storeSetting("lastServerListQuery", lastServerListQuery.toString());

                        deferred.resolve(currentServerList);
                    }, deferred.reject);
                } else
                    deferred.resolve(currentServerList);
            }, deferred.reject);

            return deferred.promise;
        },

        getAvailableCountryList: function () {
            var deferred = $q.defer();
            var res = [];

            this.getAvailableServerList().then(function (serverList) {
                for (var country in serverList) {
                    res.push(country.toLowerCase());
                }

                res.sort();

                deferred.resolve(res);
            }, deferred.reject);

            return deferred.promise;
        },

        resolveHostForProxyEntry: function (proxyEntry) {
            var deferred = $q.defer();

            if (proxyEntry.proxyPort && proxyEntry.proxyHost)
                deferred.resolve(proxyEntry);
            else {
                $http({method: "GET", url: "http://" + proxyEntry.ip + ":" + proxyEntry.port}).then(function (resData) {
                    if (resData) {
                        var res = resData.data.split(":");

                        if (res.length == 2 && (+res[1]) > 0) {
                            proxyEntry.proxyHost = res[0];
                            proxyEntry.proxyPort = +res[1];

                            deferred.resolve(proxyEntry);
                        } else
                            deferred.reject();

                    } else {
                        deferred.reject();
                    }
                }, deferred.reject);
            }

            return deferred.promise;
        },

        enableProxyWithProxyEntry: function (proxyEntry) {
            var deferred = $q.defer();

            this.resolveHostForProxyEntry(proxyEntry).then(function (resolvedEntry) {
                chromeService.enableProxy(resolvedEntry.proxyHost, resolvedEntry.proxyPort).then(function () {
                    chromeService.setExtensionIcon(config.enabledIcon);
                    deferred.resolve();
                }, deferred.reject);
            }, deferred.reject);

            return deferred.promise;
        },

        enableProxyWithCountryCode: function (aCountryCode) {
            var that = this;
            aCountryCode = aCountryCode.toLowerCase(); // just to be sure

            var getRandomServerFromList = function (aServerList) {
                var deferred = $q.defer();

                var randomServerIndex = getRandomInt(0, aServerList.length - 1);
                var randomServer = aServerList[randomServerIndex];

                that.resolveHostForProxyEntry(randomServer).then(deferred.resolve, function () {
                    // Remove non working server from list ...
                    aServerList.remove(randomServer);

                    // Recursive search for next server or reject if no servers are available ...
                    if (aServerList.length) {
                        getRandomServerFromList(aServerList).then(deferred.resolve, deferred.reject);
                    } else
                        deferred.reject();
                });

                return deferred.promise;
            };

            var deferred = $q.defer();

            // Update server list ....
            that.getAvailableServerList().then(function () {

                //console.log("ServerList", currentServerList);

                // Check if country code is available ...
                if (currentServerList[aCountryCode]) {
                    var serverArray = currentServerList[aCountryCode];

                    // Get a working server ...
                    getRandomServerFromList(serverArray).then(function (aServerToUse) {

                        // Enable that server ....
                        that.enableProxyWithProxyEntry(aServerToUse).then(deferred.resolve, deferred.reject);
                    }, deferred.reject);
                } else
                    deferred.reject();
            }, deferred.reject);

            return deferred.promise;
        },

        disableProxy: function () {
            var deferred = $q.defer();

            chromeService.disableProxy().then(function () {
                chromeService.setExtensionIcon(config.disabledIcon);
                deferred.resolve();
            }, deferred.reject);

            return deferred.promise;
        }
    }
});