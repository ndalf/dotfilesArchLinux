app.factory("chromeService", function ($q) {
    return {
        isChrome: function () {
            return (typeof browser === "undefined");
        },

        enableProxy: function (host, port) {
            var deferred = $q.defer();

            if (this.isChrome()) {
                var config = {
                    mode: "fixed_servers",
                    rules: {
                        singleProxy: {
                            scheme: "https",
                            host: host,
                            port: port
                        }
                    }
                };

                chrome.proxy.settings.set({value: config, scope: 'regular'}, function () {
                    deferred.resolve();
                });
            } else {
                var message = {
                    "enabled": true,
                    "proxy": {
                        type: "https",
                        host: host,
                        port: Number(port) || 443
                    }
                };

                browser.runtime.sendMessage(message).then(function (response) {
                    if (typeof response.enabled !== "undefined")
                        deferred.resolve(message.enabled);
                    else
                        deferred.reject();
                });
            }

            return deferred.promise;
        },

        disableProxy: function () {
            var deferred = $q.defer();

            if (this.isChrome()) {
                var config = {
                    mode: "system"
                };

                chrome.proxy.settings.set(
                    {value: config, scope: 'regular'}, function () {
                        deferred.resolve()
                    });
            } else {
                var message = {
                    "enabled": false,
                    "proxy": {
                        type: "direct",
                        host: null,
                        port: null
                    }
                };

                browser.runtime.sendMessage(message).then(function (response) {
                    if (typeof response.enabled !== "undefined")
                        deferred.resolve(response.enabled);
                    else
                        deferred.reject();
                });
            }

            return deferred.promise;
        },

        isProxyEnabled: function () {
            var deferred = $q.defer();

            if (this.isChrome()) {
                chrome.proxy.settings.get({incognito: false}, function (data) {
                    var enabled = data.value.mode === "fixed_servers" && data.levelOfControl === "controlled_by_this_extension";
                    deferred.resolve(enabled);
                });
            } else {
                var message = {};

                browser.runtime.sendMessage(message).then(function (response) {
                    if (typeof response.enabled !== "undefined")
                        deferred.resolve(response.enabled);
                    else
                        deferred.reject();
                });
            }

            return deferred.promise;
        },

        enableWebRTC: function () {
            var deferred = $q.defer();

            if (this.isChrome()) {
                if (chrome.privacy != null &&
                    chrome.privacy.network != null &&
                    chrome.privacy.network.webRTCIPHandlingPolicy != null) {
                    chrome.privacy.network.webRTCIPHandlingPolicy.set({
                        value: "default"
                    });

                    deferred.resolve();
                } else
                    deferred.reject();
            } else {
                if (browser.privacy != null &&
                    browser.privacy.network != null &&
                    browser.privacy.network.webRTCIPHandlingPolicy != null) {
                    browser.privacy.network.webRTCIPHandlingPolicy.set({
                        value: "default"
                    });

                    deferred.resolve();
                } else
                    deferred.reject();
            }

            return deferred.promise;
        },

        disableWebRTC: function () {
            var deferred = $q.defer();

            if (this.isChrome()) {
                if (chrome.privacy != null &&
                    chrome.privacy.network != null &&
                    chrome.privacy.network.webRTCIPHandlingPolicy != null) {
                    chrome.privacy.network.webRTCIPHandlingPolicy.set({
                        value: "disable_non_proxied_udp"
                    });

                    deferred.resolve();
                } else
                    deferred.reject();
            } else {
                if (browser.privacy != null &&
                    browser.privacy.network != null &&
                    browser.privacy.network.webRTCIPHandlingPolicy != null) {
                    browser.privacy.network.webRTCIPHandlingPolicy.set({
                        value: "proxy_only"
                    });

                    deferred.resolve();
                } else
                    deferred.reject();
            }

            return deferred.promise;
        },

        setExtensionIcon: function (iconFile) {
            chrome.browserAction.setIcon({path: iconFile});
        },

        setBadgeText: function (text) {
            chrome.browserAction.setBadgeText({text: text});
        },

        resolveCountryCode: function (aCountryCode) {
            if (aCountryCode) {
                var lang = chrome.i18n.getMessage("countrylang");

                if (lang !== "de" && lang !== "en")
                    lang = "en";

                return country_codes[lang][aCountryCode.toUpperCase()];
            }
        },

        storeSetting: function (key, value) {
            var deferred = $q.defer();

            var obj = {};
            obj[key] = JSON.stringify(value);
            if ((typeof browser !== "undefined")) {
                browser.storage.sync.set(obj, function () {
                    deferred.resolve();
                });
            }else{
                chrome.storage.sync.set(obj, function () {
                    deferred.resolve();
                });
            }
            

            return deferred.promise;
        },

        loadSetting: function (key) {
            var deferred = $q.defer();

            if ((typeof browser !== "undefined")) {
                browser.storage.sync.get(key, function (data) {

                    try {
                        deferred.resolve(JSON.parse(data[key]));
                    } catch (e) {
                        deferred.resolve(null);
                    }
                });
    
            }else{
                chrome.storage.sync.get(key, function (data) {

                    try {
                        deferred.resolve(JSON.parse(data[key]));
                    } catch (e) {
                        deferred.resolve(null);
                    }
                });
    
            }
           
            return deferred.promise;
        }
    };
});