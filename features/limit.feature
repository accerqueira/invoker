Feature: limit
  Scenario: Execute function until X calls
    Given a function decorated with a limit of 3
    When the decorated function is called 5 times
    Then there should be 3 executions
