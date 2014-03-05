Feature: every
  Scenario: Execute function every X calls
    Given a function decorated with an every of 2
    When the decorated function is called 5 times
    Then there should be 2 executions
