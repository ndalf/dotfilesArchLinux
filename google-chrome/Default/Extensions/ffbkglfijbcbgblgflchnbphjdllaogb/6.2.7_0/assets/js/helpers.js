Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

arrayContains = function (aArray, aObject) {
    if (typeof aArray !== "undefined") {
        var i = aArray.length;
        while (i--) {
            if (aArray[i] == aObject) {
                return true;
            }
        }
    }

    return false;
};

indexOfAssociateArray = function (aKey, aArray) {
    var x = -1;
    for (var key in aArray) {
        x++;

        if (key == aKey)
            return x;
    }

    return false;
};

keyOfAssociateArray = function (aIndex, aArray) {
    var x = -1;

    for (var key in aArray) {
        x++;
        if (x === +aIndex)
            return key;
    }

    return false;
};

getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};