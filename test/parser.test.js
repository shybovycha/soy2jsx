const parser = require('../src/grammar/SOY.js');

describe('parser', () => {
  describe('#parse', () => {
    describe('template declarations', () => {
      describe('namespace', () => {
        describe('simple path', () => {
          describe('which is valid', () => {
            it('is parsed correctly', () => {});
          });

          describe('which is invalid because', () => {
            describe('it starts with a digit', () => {
              it('fails', () => {});
            });

            describe('it starts with a special character', () => {
              it('fails', () => {});
            });

            describe('it starts with a dot', () => {
              it('fails', () => {});
            });

            describe('it ends with a special character', () => {
              it('fails', () => {});
            });

            describe('it ends with a dot', () => {
              it('fails', () => {});
            });
          });
        });

        describe('complex path', () => {
          describe('which is invalid because', () => {
            describe('it contains multiple consequent dots', () => {
              it('fails', () => {});
            });

            describe('it contains space character', () => {
              it('fails', () => {});
            });

            describe('it contains special character', () => {
              it('fails', () => {});
            });

            describe('it contains namespace part starting with digit', () => {
              it('fails', () => {});
            });
          });
        });
      });

      describe('template name', () => {
        describe('which is valid', () => {
          it('succeeds', () => {});
        });

        describe('which is invalid because', () => {
          describe('it contains multiple consequitive dots', () => {
            it('fails', () => {});
          });

          describe('it contains special characters', () => {
            it('fails', () => {});
          });

          // TODO: is this really invalid?
          describe('it starts with a letter', () => {
            it('fails', () => {});
          });

          describe('it starts with a digit', () => {
            it('fails', () => {});
          });
        });
      });

      describe('template comment', () => {
        describe('no comment', () => {
          it('succeeds', () => {});
        });

        describe('one-line comment', () => {
          describe('with required parameter declaration', () => {
            it('ignores parameter declaration', () => {});
          });

          describe('with optional parameter declaration', () => {
            it('ignores parameter declaration', () => {});
          });

          describe('with special characters', () => {
            it('succeeds', () => {});
          });

          describe('with variable interpolation', () => {
            it('ignores that', () => {});
          });

          describe('with math expression', () => {
            it('ignores that', () => {});
          });

          describe('with ternary expression', () => {
            it('ignores that', () => {});
          });
        });

        describe('multi-line comment with no parameters', () => {
          describe('with special characters', () => {
            it('succeeds', () => {});
          });

          describe('with variable interpolation', () => {
            it('ignores that', () => {});
          });

          describe('with math expression', () => {
            it('ignores that', () => {});
          });

          describe('with ternary expression', () => {
            it('ignores that', () => {});
          });
        });

        describe('multi-line comment with single required parameter', () => {
          describe('and no documentation', () => {
            it('generates that parameter', () => {});
          });

          describe('and documentation string', () => {
            describe('and special characters', () => {
              it('succeeds', () => {});
            });

            describe('and variable interpolation', () => {
              it('ignores that', () => {});
            });

            describe('and math expression', () => {
              it('ignores that', () => {});
            });

            describe('and ternary expression', () => {
              it('ignores that', () => {});
            });
          });
        });

        describe('multi-line comment with single optional parameter', () => {
          describe('and no documentation', () => {
            it('generates that parameter', () => {});
          });

          describe('and documentation string', () => {
            describe('and special characters', () => {
              it('succeeds', () => {});
            });

            describe('and variable interpolation', () => {
              it('ignores that', () => {});
            });

            describe('and math expression', () => {
              it('ignores that', () => {});
            });

            describe('and ternary expression', () => {
              it('ignores that', () => {});
            });
          });
        });

        describe('multi-line comment with multiple parameters', () => {
          describe('all required', () => {
            it('generates those params', () => {});
          });

          describe('all optional', () => {
            it('generates those params', () => {});
          });

          describe('both required and optional', () => {
            it('generates those params', () => {});
          });
        });
      });
    });

    describe('template body', () => {
      describe('HTML', () => {
        describe('attributes', () => {
          describe('none', () => {
            it('succeeds', () => {});
          });

          describe('just one', () => {
            describe('boolean', () => {
              describe('with static name', () => {});

              describe('with generated name', () => {
                describe('from interpolating a variable', () => {});

                describe('from a function call', () => {});

                describe('from a ternary expression', () => {});

                describe('from an if expression', () => {});

                describe('from math expression', () => {});
              });
            });

            describe('key-value attribute', () => {
              describe('with static name and value', () => {});

              describe('with generated name and static value', () => {
                describe('from interpolating a variable', () => {});

                describe('from a function call', () => {});

                describe('from a ternary expression', () => {});

                describe('from an if expression', () => {});

                describe('from math expression', () => {});
              });

              describe('with generated name and value', () => {
                describe('from interpolating a variable', () => {});

                describe('from a function call', () => {});

                describe('from a ternary expression', () => {});

                describe('from an if expression', () => {});

                describe('from math expression', () => {});
              });
            });
          });

          describe('multiple', () => {
            describe('boolean', () => {});

            describe('key-value', () => {});

            describe('boolean and key-value', () => {})
          });
        });

        describe('interpolated tag name', () => {
          describe('self-closed tags', () => {
            describe('from interpolating a variable', () => {});

            describe('from a function call', () => {});

            describe('from a ternary expression', () => {});

            describe('from an if expression', () => {});

            describe('from math expression', () => {});
          });

          describe('pair tags', () => {
            describe('from interpolating a variable', () => {});

            describe('from a function call', () => {});

            describe('from a ternary expression', () => {});

            describe('from an if expression', () => {});

            describe('from math expression', () => {});
          });

          describe('pair closed tags', () => {
            describe('from interpolating a variable', () => {});

            describe('from a function call', () => {});

            describe('from a ternary expression', () => {});

            describe('from an if expression', () => {});

            describe('from math expression', () => {});
          });

          describe('pair unclosed tags', () => {
            describe('from interpolating a variable', () => {});

            describe('from a function call', () => {});

            describe('from a ternary expression', () => {});

            describe('from an if expression', () => {});

            describe('from math expression', () => {});
          });
        });

        describe('top-level', () => {
          describe('single element', () => {
            describe('self-closed tag', () => {});

            describe('pair tag', () => {});

            describe('pair closed tag', () => {});

            describe('pair unclosed tag', () => {});
          });

          describe('multiple elements', () => {
            describe('self-closed tags', () => {});

            describe('pair tags', () => {});

            describe('pair closed tags', () => {});

            describe('pair unclosed tags', () => {});
          });
        });

        describe('children', () => {
          describe('variable interpolation', () => {
            describe('simple', () => {});

            describe('with filters', () => {
              describe('just one', () => {
                describe('with no parameters', () => {
                  it('passes', () => {});
                });

                describe('with single parameter', () => {
                  describe('number', () => {
                    describe('integer', () => {});

                    describe('float', () => {});
                  });

                  describe('variable value', () => {});

                  describe('function call result', () => {});

                  describe('if expression', () => {});
                });

                describe('with multiple parameters', () => {
                  describe('number', () => {
                    describe('integer', () => {});

                    describe('float', () => {});
                  });

                  describe('variable value', () => {});

                  describe('function call result', () => {});

                  describe('if expression', () => {});
                });
              });

              describe('multiple', () => {
                describe('with no parameters', () => {
                  it('passes', () => {});
                });

                describe('with single parameter', () => {
                  describe('number', () => {
                    describe('integer', () => {});

                    describe('float', () => {});
                  });

                  describe('variable value', () => {});

                  describe('function call result', () => {});

                  describe('if expression', () => {});
                });

                describe('with multiple parameters', () => {
                  describe('number', () => {
                    describe('integer', () => {});

                    describe('float', () => {});
                  });

                  describe('string', () => {
                    describe('single-quoted', () => {
                      describe('with interpolation', () => {
                        describe('number', () => {
                          describe('integer', () => {});

                          describe('float', () => {});
                        });

                        describe('variable value', () => {});

                        describe('function call result', () => {});

                        describe('if expression', () => {});
                      });
                    });

                    describe('double-quoted', () => {
                      describe('with interpolation', () => {
                        describe('number', () => {
                          describe('integer', () => {});

                          describe('float', () => {});
                        });

                        describe('variable value', () => {});

                        describe('function call result', () => {});

                        describe('if expression', () => {});
                      });
                    });
                  });

                  describe('variable value', () => {});

                  describe('function call result', () => {});

                  describe('if expression', () => {});
                });
              });
            });
          });

          describe('let block', () => {
            describe('with simple value', () => {
              describe('number', () => {
                describe('integer', () => {});

                describe('float', () => {});
              });

              describe('variable value', () => {});

              describe('function call result', () => {});
            });

            describe('with compound value', () => {
              describe('HTML', () => {});

              describe('template call', () => {});

              describe('number', () => {
                describe('integer', () => {});

                describe('float', () => {});
              });

              describe('variable value', () => {});

              describe('function call result', () => {});

              describe('if expression', () => {});

              describe('for expression', () => {});

              describe('foreach expression', () => {});
            });
          });

          describe('if expression', () => {
            describe('with no else branch', () => {
              describe('with expression', () => {
                describe('simple', () => {
                  describe('variable value', () => {});

                  describe('function call', () => {});

                  describe('variable / math expression', () => {});

                  describe('logical NOT operator', () => {});
                });

                describe('compound', () => {
                  describe('logical operator', () => {
                    describe('AND', () => {});

                    describe('NOT AND', () => {});

                    describe('AND NOT', () => {});

                    describe('OR', () => {});

                    describe('NOT OR', () => {});

                    describe('OR NOT', () => {});
                  });
                });
              });
            });

            describe('with else branch', () => {});
          });

          describe('for expression', () => {
            describe('iterating over', () => {
              describe('variable value', () => {});

              describe('function call result', () => {});

              describe('static value', () => {
                describe('list', () => {});

                describe('map', () => {});
              });
            });
          });

          describe('foreach expression', () => {
            describe('iterating over', () => {
              describe('variable value', () => {});

              describe('function call result', () => {});

              describe('static value', () => {
                describe('list', () => {});

                describe('map', () => {});
              });
            });

            describe('with ifempty section', () => {});
          });

          describe('function call', () => {
            describe('plain function', () => {});

            describe('object method', () => {});
          });

          describe('template call', () => {
            describe('from the same namespace', () => {});

            describe('from the different namespace', () => {});
          });

          describe('SOY special characters', () => {
            describe('space', () => {});

            describe('indentation', () => {});

            describe('caret return', () => {});

            describe('newline', () => {});

            describe('nil', () => {});
          });

          describe('HTML entities', () => {
            it('passes', () => {});
          });

          describe('plain text', () => {
            describe('ASCII characters', () => {});

            describe('UTF-8 characters', () => {});
          });
        });
      });
    });
  });
});
