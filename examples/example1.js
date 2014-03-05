var Invoker = require('../');

var startTime = Date.now();

var funcA = function() {
    console.log('funcA', Date.now() - startTime);
};

var invoker = new Invoker()
  .concurrency(2)
  .delay(1000);

var funcB = invoker.decorate(funcA);

funcB();
funcB();
funcB();
funcB();
funcB();

/*
the output would be something like this:
funcA 1005
funcA 1006
funcA 2006
funcA 2006
funcA 3007
*/
