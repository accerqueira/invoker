Feature: gap
  Scenario: Gap between executions of a function
    Given a function decorated with a gap of 1000 milliseconds
    When the decorated function is called 5 times
    Then there should be around 1000 milliseconds between the end of one call and the beginning of another
