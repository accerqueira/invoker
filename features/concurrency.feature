Feature: concurrency
  Scenario: Concurrent invocations of a function
    Given a function decorated with a concurrency of 2
    When the decorated function is called 5 times
    Then there should be no more than 2 running calls
