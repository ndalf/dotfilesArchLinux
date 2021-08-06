var enabled = false;
var proxy = {};

browser.runtime.onMessage.addListener(function (message, sender, response) {

    if (!message || typeof message !== 'object')
        return;

    if (message.proxy && typeof message.enabled !== "undefined") {
        enabled = message.enabled;
        proxy = message.proxy;
    }

    response(
        {
            "enabled": enabled,
            "proxy": proxy
        }
    );
});

browser.runtime.sendMessage("init");

var isIPV4 = function (ipString) {
    return /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(ipString);
};

var ipToInt = function (ip) {
    var bytes = ip.split('.');
    return ((bytes[0] & 0xff) << 24) | ((bytes[1] & 0xff) << 16) | ((bytes[2] & 0xff) << 8) | (bytes[3] & 0xff);
};

var isSubnetOfV4 = function (ipv4, network, subnetMask) {
    var host = ipToInt(ipv4);
    var netw = ipToInt(network);
    var mask = ipToInt(subnetMask);

    return (host & mask) === (netw & mask);
};

var isLocalIp = function (host) {

    if (isIPV4(host)) {
        // local IPV4 check ...
        return isSubnetOfV4(host, "0.0.0.0", "255.0.0.0") ||
            isSubnetOfV4(host, "10.0.0.0", "255.0.0.0") ||
            isSubnetOfV4(host, "127.0.0.0", "255.0.0.0") ||
            isSubnetOfV4(host, "169.254.0.0", "255.255.0.0") ||
            isSubnetOfV4(host, "172.16.0.0", "255.240.0.0") ||
            isSubnetOfV4(host, "192.0.2.0", "255.255.255.0") ||
            isSubnetOfV4(host, "192.88.99.0", "255.255.255.0") ||
            isSubnetOfV4(host, "192.168.0.0", "255.255.0.0") ||
            isSubnetOfV4(host, "198.18.0.0", "255.254.0.0") ||
            isSubnetOfV4(host, "224.0.0.0", "240.0.0.0") ||
            isSubnetOfV4(host, "240.0.0.0", "240.0.0.0");
    }

    return false;
};


// ----------------------- MAIN PROXY FUNCTION -----------------------
function FindProxyForURL(url, host) {
    if (!enabled || isLocalIp(host))
        return "DIRECT";

    return "HTTPS " + proxy.host + ":" + proxy.port;
}