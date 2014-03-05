Feature: delay
  Scenario: Delay the execution of a function
    Given a function decorated with a delay of 1000 milliseconds
    When the decorated function is called 5 times
    Then the original function should be called after 1000 milliseconds
