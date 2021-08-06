app.directive('slider', function () {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            model: "=",
            animation: "="
        },
        template: '<div class="slider" ng-class="{\'active\': model, \'animation\': animation}" ng-click="toggleModel()"><div class="sliderBackground"></div><span class="button"></span></div>',
        link: function (scope) {
            scope.toggleModel = function () {
                scope.model = !scope.model;
            };
        }
    };
});