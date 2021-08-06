/*
 CyberGhost Proxy Plugin
 (c) 2017 CyberGhost S.A., All Rights Reserved
 http://www.cyberghostvpn.com

 Author: Patrick Arns, Mobile Concepts GmbH
 */

try {
    app = angular.module('cg-chrome', ['ui.bootstrap', 'ui.select']);
} catch (e) {
}

/*
 * #############################################################################
 * Config
 * #############################################################################
 */

app.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|resource|moz-extension):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|resource|moz-extension):/);
    }
]);

app.service("config", function () {
    this.enabledIcon = "cyberghost.png";
    this.disabledIcon = "cyberghost_disabled.png";

    this.serverCacheTime = 1000 * 60 * 10; // 10 Min

    this.blockChainRPCNode = [
        // "https://api.myetherapi.com/rop",
        "https://api.myetherwallet.com/rop",
        "https://api.infura.io/v1/jsonrpc/ropsten"
    ];
});