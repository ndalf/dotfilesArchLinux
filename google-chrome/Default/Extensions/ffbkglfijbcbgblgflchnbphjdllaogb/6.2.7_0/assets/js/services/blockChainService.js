app.factory("blockChainService", function ($q, $timeout, $http, config) {

    function int2ip(ipInt) {
        return ((ipInt >>> 24) + '.' + (ipInt >> 16 & 255) + '.' + (ipInt >> 8 & 255) + '.' + (ipInt & 255));
    }

    function ip2int(ip) {
        return ip.split('.').reduce(function (ipInt, octet) {
            return (ipInt << 8) + parseInt(octet, 10)
        }, 0) >>> 0;
    }

    function pow2(exp) {
        return Math.pow(2, +exp);
    }

    function getContract(web3) {
        return web3.eth.contract(
            [{
                "constant": false,
                "inputs": [{"name": "i", "type": "uint256"}],
                "name": "removeServerAtIndex",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }, {
                "constant": false,
                "inputs": [{"name": "newServer", "type": "uint256"}],
                "name": "addServer",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }, {
                "constant": true,
                "inputs": [{"name": "", "type": "uint256"}],
                "name": "servers",
                "outputs": [{"name": "", "type": "uint256"}],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }, {
                "constant": false,
                "inputs": [],
                "name": "getServers",
                "outputs": [{"name": "", "type": "uint256[]"}],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }, {
                "constant": true,
                "inputs": [],
                "name": "owner",
                "outputs": [{"name": "", "type": "address"}],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }, {
                "constant": false,
                "inputs": [{"name": "newOwner", "type": "address"}],
                "name": "transferOwnership",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }]).at('0xfc74e11acbce03c5ce3464b94d322684159e4735');
    }


    return {
        getWorkingEndpoint: function() {
            var deferred = $q.defer();
            var resolved = false;
            
            for (const endpoint of config.blockChainRPCNode) {
                const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
                web3.eth.getBlockNumber((err, currentBlock) => {
                    if (!err) {
                        resolved = true;
                        deferred.resolve(endpoint);
                    }
                }, function() {});
            };

            $timeout(function() {
                if (!resolved)
                    deferred.reject();
            }, 5000);

            return deferred.promise;
        },
        getAvailableServersRAW: function () {

            var deferred = $q.defer();

            this.getWorkingEndpoint().then(function(endpoint) {
                var web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
                web3.eth.defaultAccount = '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe';
                var serverContract = getContract(web3);

                var res = [];

                var callData = serverContract.getServers.call();

                if (isArray(callData)) {
                    callData.forEach(function (server) {
                        var strValue = server.toString(16);

                        if (strValue !== "0")
                            res.push(strValue);
                    });
                }

                deferred.resolve(res);
            }, function() {
                deferred.resolve([]);
            });

            return deferred.promise;
        },

        getAvailableServers: function () {
            var that = this;
            var deferred = $q.defer();

            var serverData = this.getAvailableServersRAW();

            serverData.then(function (data) {
                var res = [];

                data.forEach(function (entry) {
                    var serverItem = that.decodeServerEntry(entry);
                    res.push(serverItem);
                });

                deferred.resolve(res);
            }, deferred.reject);

            return deferred.promise;
        },

        encodeServerEntry: function (countryCode, ip, port, base) {
            var intIp = ip2int(ip);
            var intCountryCode = indexOfAssociateArray(countryCode, country_codes["en"]);
            var intPort = +port;

            // Using BigInteger lib from https://github.com/peterolson/BigInteger.js
            var res = bigInt(intIp);

            if (!base)
                base = 10;

            // IP (32 Bit) | CountryCode Index (16 Bit) | Port (16 Bit)
            return res.shiftLeft(32).plus(intCountryCode).shiftLeft(16).plus(intPort).toString(base);
        },

        decodeServerEntry: function (num, base) {

            if (!base)
                base = 16;

            var res = {};
            var bNum = bigInt(num, base);

            // IP (32 Bit) | CountryCode Index (16 Bit) | Port (16 Bit)
            var intPort = +bNum.mod(pow2(16)).toString(10);

            bNum = bNum.shiftRight(16);
            var intCountryCode = +bNum.mod(pow2(32)).toString(10);

            bNum = bNum.shiftRight(32);
            var intIp = +bNum.toString(10);

            res.ip = int2ip(intIp);
            res.port = intPort;
            res.countryCode = keyOfAssociateArray(intCountryCode, country_codes["en"]).toLowerCase();


            return res;
        }
    };
});