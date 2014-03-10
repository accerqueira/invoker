var Promise = require('promise');

var Invoker = module.exports = function () {
    if (!(this instanceof Invoker)) return new Invoker();

    this._decorators = [];
};

Invoker.CALLBACK = function() {};
Invoker.CALLBACK.id = Invoker.CALLBACK;

Invoker.prototype.execution = function(fn) {
    this._decorators.push(fn);
    return this;
};

Invoker.prototype.getDecorator = function(ctx) {
    return (function(fn) {
        var finalFn = fn.bind(ctx);

        for (var i = this._decorators.length - 1; i >= 0; i--) {
            var decorator = this._decorators[i];
            finalFn = decorator(finalFn);
        }

        return finalFn;
    }).bind(this);
};

Invoker.prototype.decorate = function(fn, ctx) {
    return this.getDecorator(ctx)(fn);
};

Invoker.params = function(___) {
    var argsApplied = Array.prototype.slice.call(arguments);

    var invocation = {
        callTime: 0,
        executionBegin: 0,
        executionEnd: 0
    };

    return function(fn) {
        var decorated = function() {
            invocation.callTime = Date.now();
            var argsCalled = Array.prototype.slice.call(arguments);

            var ctx = this;
            var args = argsApplied.slice();

            return new Promise(function(resolve, reject) {
                try {
                    var callback = function() {
                        resolve(arguments);
                        invocation.executionEnd = Date.now();
                    };
                    callback.id = Invoker.CALLBACK;

                    var isAsync = false;
                    for (var i = 0, k = 0; i < args.length; i++) {
                        if (args[i] === undefined) {
                            args[i] = argsCalled[k++];
                        }
                    }

                    var lastParam = args[args.length-1];
                    var callbackAtLast = (typeof lastParam === 'function' && 'id' in lastParam && lastParam.id === Invoker.CALLBACK);
                    Array.prototype.splice.apply(args, [args.length - callbackAtLast, 0].concat(argsCalled.slice(k)));
                    for (i = 0; i < args.length; i++) {
                        if (args[i] === Invoker.CALLBACK) {
                            args[i] = callback;
                            isAsync = true;
                        }
                    }

                    invocation.executionBegin = Date.now();
                    if (isAsync) {
                        fn.apply(ctx, args);
                    } else {
                        resolve(fn.apply(ctx, args));
                        invocation.executionEnd = Date.now();
                    }
                } catch (ex) {
                    reject(ex);
                }
            });
        };

        return decorated;
    };
};

Invoker.prototype.params = function(___) {
    return this.execution(Invoker.params.apply(null, arguments));
};

Invoker.concurrency = function(concurrency) {
    var invocation = {
        running: 0,
        queue: []
    };

    return function(fn) {
        var processQueue = function() {
            if (invocation.running < concurrency) {
                invocation.running++;
                var task = invocation.queue.shift();
                if (task) {
                    var fn = task[0];
                    var ctx = task[1];
                    var args = task[2];
                    var resolve = task[3];

                    var promise = Promise.from(fn.apply(ctx, args));
                    resolve(promise);

                    promise.then(function() {
                        invocation.running--;
                        process.nextTick(processQueue);
                    });
                }
            }
        };

        var decorated = function() {
            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                var task = [fn, ctx, args, resolve];
                invocation.queue.push(task);
                processQueue();
            });
        };

        return decorated;
    };
};

Invoker.prototype.concurrency = function(concurrency) {
    return this.execution(Invoker.concurrency(concurrency));
};

Invoker.delay = function(duration) {
    return function(fn) {
        var decorated = function() {
            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(fn.apply(ctx, args));
                }, duration);
            });
        };

        return decorated;
    };
};

Invoker.prototype.delay = function(duration) {
    return this.execution(Invoker.delay(duration));
};

Invoker.interval = function(duration) {
    var invocation = {
        callTime: 0,
        queue: []
    };

    return function(fn) {
        var decorated = function() {
            var processQueue = function() {
                var timeNow = Date.now();
                if (timeNow - duration >= invocation.callTime) {
                    var task = invocation.queue.shift();
                    if (task) {
                        var fn = task[0];
                        var ctx = task[1];
                        var args = task[2];
                        var resolve = task[3];

                        invocation.callTime = Date.now();
                        resolve(fn.apply(ctx, args));

                        setTimeout(processQueue, duration);
                    }
                }
            };

            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                var task = [fn, ctx, args, resolve];
                invocation.queue.push(task);
                processQueue();
            });
        };

        return decorated;
    };

};

Invoker.prototype.interval = function(duration) {
    return this.execution(Invoker.interval(duration));
};

Invoker.gap = function(duration) {
    var invocation = {
        executing: false,
        executionEnd: 0,
        queue: []
    };

    return function(fn) {
        var decorated = function() {
            var processQueue = function() {
                var timeNow = Date.now();
                if (!invocation.executing && timeNow - duration >= invocation.executionEnd) {
                    invocation.executing = true;
                    var task = invocation.queue.shift();
                    if (task) {
                        var fn = task[0];
                        var ctx = task[1];
                        var args = task[2];
                        var resolve = task[3];

                        var promise = Promise.from(fn.apply(ctx, args));
                        resolve(promise);

                        promise.then(function() {
                            invocation.executing = false;
                            invocation.executionEnd = Date.now();
                            setTimeout(processQueue, duration);
                        });
                    }
                }
            };

            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                var task = [fn, ctx, args, resolve];
                invocation.queue.push(task);
                processQueue();
            });
        };

        return decorated;
    };

};

Invoker.prototype.gap = function(duration) {
    return this.execution(Invoker.gap(duration));
};

Invoker.every = function(count) {
    var invocation = {
        callCount: 0
    };

    return function(fn) {
        var decorated = function() {
            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                if (++invocation.callCount % count === 0) {
                    resolve(fn.apply(ctx, args));
                } else {
                    resolve(null);
                }
            });
        };

        return decorated;
    };
};

Invoker.prototype.every = function(count) {
    return this.execution(Invoker.every(count));
};

Invoker.after = function(count) {
    var invocation = {
        callCount: 0
    };

    return function(fn) {
        var decorated = function() {
            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                if (++invocation.callCount > count) {
                    resolve(fn.apply(ctx, args));
                } else {
                    resolve(null);
                }
            });
        };

        return decorated;
    };
};

Invoker.prototype.after = function(count) {
    return this.execution(Invoker.after(count));
};

Invoker.limit = function(count) {
    var invocation = {
        callCount: 0
    };

    return function(fn) {
        var decorated = function() {
            var ctx = this;
            var args = Array.prototype.slice.call(arguments);

            return new Promise(function(resolve, reject) {
                if (++invocation.callCount <= count) {
                    resolve(fn.apply(ctx, args));
                } else {
                    resolve(null);
                }
            });
        };

        return decorated;
    };
};

Invoker.prototype.limit = function(count) {
    return this.execution(Invoker.limit(count));
};

Invoker.throttle = function(rate) {
    return Invoker.interval(1/rate);
};

Invoker.prototype.throttle = function(rate) {
    return this.execution(Invoker.throttle(rate));
};
