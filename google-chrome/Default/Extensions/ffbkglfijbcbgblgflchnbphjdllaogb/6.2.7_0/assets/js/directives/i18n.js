translateTemplate = function (aTemplateText) {
    var value = aTemplateText;
    var i18Pattern = /__MSG_(.*)__/gi;
    while (value.match(i18Pattern)) {
        angular.forEach(value.match(i18Pattern), function (placeholder) {
            var match = i18Pattern.exec(placeholder);
            if (match)
               value = value.replace(placeholder, chrome.i18n.getMessage(match[1]));
        });
    }

    return value;
};

app.directive('i18n', function () {
    return {
        restrict: 'A',
        replace: true,
        compile: function (element) {
            element.html(translateTemplate(element.html()));
        }
    };
});

app.directive('i18nSrc', function () {
    return {
        restrict: 'A',
        replace: true,
        compile: function (element, attrs) {
            element.attr("src", translateTemplate(attrs.i18nSrc));
        }
    };
});