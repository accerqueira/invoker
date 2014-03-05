var Invoker = require('../');

var startTime = Date.now();

var funcA = function(n, callback) {
    console.log('funcA', Date.now() - startTime);
    setTimeout(function() {
        if (typeof callback === 'function') callback(n * 2);
    }, 2000);
};

var invoker = new Invoker()
  .gap(1000)
  .params(Invoker.CALLBACK);

var funcB = invoker.decorate(funcA);

var callback = function() {
    console.log('callback', Date.now() - startTime);
};

funcB(1).then(callback);
funcB(2).then(callback);
funcB(3).then(callback);
funcB(4).then(callback);
funcB(5).then(callback);


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
