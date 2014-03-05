Feature: after
  Scenario: Execute function after X calls
    Given a function decorated with an after of 2
    When the decorated function is called 5 times
    Then there should be 3 executions
