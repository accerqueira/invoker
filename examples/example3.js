var Invoker = require('../');

var startTime = Date.now();

var funcA = function(n, callback) {
    console.log('funcA', Date.now() - startTime);
    setTimeout(function() {
        if (typeof callback === 'function') callback(n * 2);
    }, 2000);
};

var funcB = function(n, callback) {
    console.log('funcB', Date.now() - startTime);
    setTimeout(function() {
        if (typeof callback === 'function') callback(n * 2);
    }, 2000);
};

var invoker = new Invoker()
  .gap(1000)
  .params(Invoker.CALLBACK);

var funcA1 = invoker.decorate(funcA);
var funcB1 = invoker.decorate(funcB);

var callback = function() {
    console.log('callback', Date.now() - startTime);
};

funcA1(1).then(callback);
funcB1(1).then(callback);
funcA1(2).then(callback);
funcB1(2).then(callback);
funcA1(3).then(callback);
funcB1(3).then(callback);


/*
the output should be something like this:
funcA 5
callback 2006
funcA 3007
callback 5009
funcA 6010
callback 8011
funcA 9013
callback 11015
funcA 12016
callback 14018
*/
