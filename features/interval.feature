Feature: interval
  Scenario: Interval between executions of a function
    Given a function decorated with an interval of 1000 milliseconds
    When the decorated function is called 5 times
    Then there should be around 1000 milliseconds between calls
