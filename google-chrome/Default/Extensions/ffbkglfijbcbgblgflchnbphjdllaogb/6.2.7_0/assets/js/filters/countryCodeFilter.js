app.filter('countryCode', function (chromeService) {
    return function (country) {
        return chromeService.resolveCountryCode(country);
    };
});