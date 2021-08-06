app.controller("CyberGhost", function ($scope, config, proxyService, chromeService, blockChainService, $timeout) {

    $scope.config = {};
    $scope.config.enabled = false;
    $scope.config.init = false;
    $scope.config.selectedCountry = null;
    $scope.config.availableCountries = [];
    $scope.config.randomClass = "";

    $scope._updating = false;

    $scope.countryCode2Country = function (aCountryCode) {
        return chromeService.resolveCountryCode(aCountryCode);
    };

    $scope.enableProxy = function () {
        if ($scope.config.selectedCountry) {
            chromeService.disableWebRTC();
            proxyService.enableProxyWithCountryCode($scope.config.selectedCountry).then(function () {
                chromeService.setBadgeText($scope.config.selectedCountry.toUpperCase());
            }, function () {
                $scope.config.enabled = false;
            })
        } else {
            $scope.config.enabled = false;
        }
    };

    $scope.browserString = function () {
        if (chromeService.isChrome())
            return "chrome";
        else
            return "firefox";
    };

    $scope.disableProxy = function () {
        chromeService.enableWebRTC();
        proxyService.disableProxy();
        chromeService.setBadgeText("");
        $scope.config.enabled = false;
    };

    $scope._refreshCountryList = function () {
        proxyService.getAvailableCountryList().then(function (list) {
            $scope._updating = true;
            $scope.config.availableCountries = list;

        
            chromeService.loadSetting("lastUsedCountry").then(function (lastUsedCountry) {
                if (lastUsedCountry != null && arrayContains(list, lastUsedCountry))
                    $scope.config.selectedCountry = lastUsedCountry;
                else {
                    $scope.config.selectedCountry = list[Math.floor(Math.random() * list.length)];
                    chromeService.storeSetting("lastUsedCountry", $scope.config.selectedCountry);
                }

                $scope._updating = false;
            }, function () {
                $scope._updating = false;
            });
        });
    };

    $scope._updateIcon = function () {
        if ($scope.config.enabled)
            chromeService.setExtensionIcon(config.enabledIcon);
        else
            chromeService.setExtensionIcon(config.disabledIcon);
    };

    $scope._bindWatches = function () {
        $scope.$watch("config.enabled", function (newVal, oldVal) {
            if (newVal === oldVal)
                return;

            if (newVal === "UNDEF")
                return;

            if (oldVal === "UNDEF")
                return;

            $scope.config.randomClass = $scope._getRandomClass();

            if ($scope.config.enabled === true)
                $scope.enableProxy();
            else
                $scope.disableProxy();

            $scope._updateIcon();
        });

        $scope.$watch("config.selectedCountry", function (newVal, oldVal) {
            if (newVal === oldVal || $scope._updating)
                return;

            $scope.config.selectedCountry = newVal;
            chromeService.storeSetting("lastUsedCountry", newVal);

            if ($scope.config.enabled) {
                $scope.enableProxy();
            }
        });
    };

    $scope._getRandomClass = function () {
        var min = 0;
        var max = 4;
        var rand = Math.floor(Math.random() * (max - min)) + min;

        return String.fromCharCode(97 + rand);
    };

    $scope._init = function () {
        chromeService.isProxyEnabled().then(function (enabled) {
            $scope.config.enabled = enabled;

            $timeout(function () {
                $scope._updateIcon();
                $scope.config.randomClass = $scope._getRandomClass();
                $scope._bindWatches();
                $scope._refreshCountryList();
                $scope.config.init = true;
            }, 0);
        });
    };

    $scope._init();

    /*console.log("UK", blockChainService.encodeServerEntry("GB", "89.238.167.181", 81));
    console.log("IT", blockChainService.encodeServerEntry("IT", "185.183.105.107", 81));
    console.log("ES", blockChainService.encodeServerEntry("ES", "194.99.104.219", 81));
    console.log("FR", blockChainService.encodeServerEntry("FR", "194.187.249.211", 81));*/

    //console.log(blockChainService.encodeServerEntry("RO", "89.45.10.67", 81));
    //console.log(blockChainService.decodeServerEntry("421121459893479182762065", 10));
});