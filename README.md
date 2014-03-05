# Invoker

Modifies method invocation behavior.

## Installation

```javascript
npm install method-invoker
```

## Usage

The example bellow shows how to limit the concurrency of a function while applying a delay to its execution.

```javascript
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

```

This can also be used with an asynchronous function, like the example bellow:

```javascript
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

```

## API

First, you need a new Invoker for each invocation control (the same one can be applied to multiple functions, and all of them will share behavior).

```javascript
var invoker = new Invoker();
```

### new Invoker()

This creates and retuns a new Invoker.


### Static Methods

#### Invoker.params(...)

Returns a function decorator for filling the specified parameters.
You can pass Invoker.CALLBACK as a replacement for the callback, which also indicates the function is asynchronous.

#### Invoker.concurrency(count)

Returns a function decorator for retricting concurrency.
This only makes sense for asynchronous functions.

#### Invoker.delay(ms)

Returns a function decorator for delaying the execution of a function.

#### Invoker.interval(ms)

Returns a function decorator for imposing a delay between calls.

#### Invoker.gap(ms)

Returns a function decorator for imposing a gap between the end of a function execution and the next call.
This only makes sense for asynchronous functions.

#### Invoker.every(count)

Returns a function decorator for executing a function every X call.

#### Invoker.after(count)

Returns a function decorator for executing a function after X calls.

#### Invoker.limit(count)

Returns a function decorator for executing a function at most X times.


### Prototype Methods

#### Invoker#execution(fn)

Adds the specified function to the list of decorators to be applied.

#### Invoker#decorate(fn, ctx)

Decorates the specified function with all the configured methods.

### Other

All the static methods have a prototype version, which calls Invoker#execution on the returned decorator. There are also the following prototype methods.
