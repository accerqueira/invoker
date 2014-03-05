module.exports = function() {
    var Promise = require('promise');
    var chai = require('chai');
    var expect = chai.expect;

    var Invoker = require('../../');

    this.Given(/^a function decorated with an? (\w+) of (\d+).*$/, function(behavior, amount, callback) {
        var invocationBehavior = new Invoker()[behavior](amount).params(Invoker.CALLBACK);

        var world = this;
        this.original_function = function(callback) {
            var invocation = {};
            world.original_function.invocations.push(invocation);
            invocation.callTime = Date.now();
            setTimeout(function() {
                world.original_function.count++;
                invocation.endTime = Date.now();
                if (typeof callback === 'function') callback();
            }, 1000);
        };
        this.original_function.invocations = [];
        this.original_function.count = 0;

        this.decorated_function = invocationBehavior.decorate(this.original_function);
        this.decorated_function.invocations = [];

        callback();
    });

    this.When(/^the decorated function is called (\d+) times?$/, function(times, callback) {
        var executionEnded = function(invocation) {
            invocation.endTime = Date.now();
        };

        var promises = [];
        for (var i = 0; i < times; i++) {
            var invocation = {};
            this.decorated_function.invocations.push(invocation);
            invocation.callTime = Date.now();
            var promise = this.decorated_function();
            promise.then(executionEnded.bind(null, invocation));
            promises.push(promise);
        }

        Promise.all(promises).then(function() {
            callback();
        });
    });

    this.Then(/^the original function should be called after (\d+) milliseconds$/, function(duration, callback) {
        var originalInvocations = this.original_function.invocations;
        var decoratedInvocations = this.decorated_function.invocations;

        for (var i = 0; i < originalInvocations.length; i++) {
            var originalInvocation = originalInvocations[i];
            var decoratedInvocation = decoratedInvocations[i];

            var delay = originalInvocation.callTime - decoratedInvocation.callTime;
            expect(delay).to.be.closeTo(duration, 10);
        }

        callback();
    });

    this.Then(/^there should be around (\d+) milliseconds between calls$/, function(duration, callback) {
        var originalInvocations = this.original_function.invocations;

        for (var i = 1; i < originalInvocations.length; i++) {
            var currentInvocation = originalInvocations[i];
            var previousInvocation = originalInvocations[i - 1];

            var interval = currentInvocation.callTime - previousInvocation.callTime;
            expect(interval).to.be.closeTo(duration, 10);
        }

        callback();
    });

    this.Then(/^there should be around (\d+) milliseconds between the end of one call and the beginning of another$/, function(duration, callback) {
        var originalInvocations = this.original_function.invocations;

        for (var i = 1; i < originalInvocations.length; i++) {
            var currentInvocation = originalInvocations[i];
            var previousInvocation = originalInvocations[i - 1];

            var gap = currentInvocation.callTime - previousInvocation.endTime;
            expect(gap).to.be.closeTo(duration, 10);
        }

        callback();
    });

    this.Then(/^there should be no more than (\d+) running calls$/, function(concurrency, callback) {
        var originalInvocations = this.original_function.invocations.slice();

        var started = 0;
        for (var i = 0; i < originalInvocations.length; i++) {
            var currentInvocation = originalInvocations[i];

            started++;

            var ended = 0;
            for (var k = 0; k < i; k++) {
                var previousInvocation = originalInvocations[k];
                if (currentInvocation.callTime >= previousInvocation.endTime) {
                    ended++;
                }
            }

            var running = started - ended;
            expect(running).to.be.at.most(concurrency);
        }

        callback();
    });

    this.Then(/^there should be (\d+) executions$/, function(count, callback) {
        expect(this.original_function.count).to.be.equal(Number(count));
        callback();
    });
};
