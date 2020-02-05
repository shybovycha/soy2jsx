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
          it('is parsed correctly', () => {});
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
          it('is parsed correctly', () => {});
        });

        describe('one-line comment', () => {
          describe('with required parameter declaration', () => {
            it('ignores parameter declaration', () => {});
          });

          describe('with optional parameter declaration', () => {
            it('ignores parameter declaration', () => {});
          });

          describe('with special characters', () => {
            it('is parsed correctly', () => {});
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
            it('is parsed correctly', () => {});
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
              it('is parsed correctly', () => {});
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
              it('is parsed correctly', () => {});
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
            it('is parsed correctly', () => {});
          });

          describe('just one', () => {
            describe('boolean', () => {
              describe('with static name', () => {
                it('is parsed correctly', () => {});
              });

              describe('with generated name', () => {
                describe('from interpolating a variable', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from a function call', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from a ternary expression', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from an if expression', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from math expression', () => {
                  it('is parsed correctly', () => {});
                });
              });
            });

            describe('key-value attribute', () => {
              describe('with static name and value', () => {
                it('is parsed correctly', () => {});
              });

              describe('with generated name and static value', () => {
                describe('from interpolating a variable', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from a function call', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from a ternary expression', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from an if expression', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from math expression', () => {
                  it('is parsed correctly', () => {});
                });
              });

              describe('with generated name and value', () => {
                describe('from interpolating a variable', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from a function call', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from a ternary expression', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from an if expression', () => {
                  it('is parsed correctly', () => {});
                });

                describe('from math expression', () => {
                  it('is parsed correctly', () => {});
                });
              });
            });
          });

          describe('multiple', () => {
            describe('boolean', () => {
              it('is parsed correctly', () => {});
            });

            describe('key-value', () => {
              it('is parsed correctly', () => {});
            });

            describe('boolean and key-value', () => {
              it('is parsed correctly', () => {});
            })
          });
        });

        describe('interpolated tag name', () => {
          describe('self-closed tags', () => {
            describe('from interpolating a variable', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('pair tags', () => {
            describe('from interpolating a variable', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('pair closed tags', () => {
            describe('from interpolating a variable', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('pair unclosed tags', () => {
            describe('from interpolating a variable', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              it('is parsed correctly', () => {});
            });
          });
        });

        describe('top-level', () => {
          describe('single element', () => {
            describe('self-closed tag', () => {
              it('is parsed correctly', () => {});
            });

            describe('pair tag', () => {
              it('is parsed correctly', () => {});
            });

            describe('pair closed tag', () => {
              it('is parsed correctly', () => {});
            });

            describe('pair unclosed tag', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('multiple elements', () => {
            describe('self-closed tags', () => {
              it('is parsed correctly', () => {});
            });

            describe('pair tags', () => {
              it('is parsed correctly', () => {});
            });

            describe('pair closed tags', () => {
              it('is parsed correctly', () => {});
            });

            describe('pair unclosed tags', () => {
              it('is parsed correctly', () => {});
            });
          });
        });

        describe('children', () => {
          describe('variable interpolation', () => {
            describe('simple', () => {
              it('is parsed correctly', () => {});
            });

            describe('with filters', () => {
              describe('just one', () => {
                describe('with no parameters', () => {
                  it('is parsed correctly', () => {});
                });

                describe('with single parameter', () => {
                  describe('number', () => {
                    describe('integer', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('float', () => {
                      it('is parsed correctly', () => {});
                    });
                  });

                  describe('variable value', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('function call result', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('if expression', () => {
                    it('is parsed correctly', () => {});
                  });
                });

                describe('with multiple parameters', () => {
                  describe('number', () => {
                    describe('integer', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('float', () => {
                      it('is parsed correctly', () => {});
                    });
                  });

                  describe('variable value', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('function call result', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('if expression', () => {
                    it('is parsed correctly', () => {});
                  });
                });
              });

              describe('multiple', () => {
                describe('with no parameters', () => {
                  it('is parsed correctly', () => {});
                });

                describe('with single parameter', () => {
                  describe('number', () => {
                    describe('integer', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('float', () => {
                      it('is parsed correctly', () => {});
                    });
                  });

                  describe('variable value', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('function call result', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('if expression', () => {
                    it('is parsed correctly', () => {});
                  });
                });

                describe('with multiple parameters', () => {
                  describe('number', () => {
                    describe('integer', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('float', () => {
                      it('is parsed correctly', () => {});
                    });
                  });

                  describe('string', () => {
                    describe('single-quoted', () => {
                      describe('with interpolation', () => {
                        describe('number', () => {
                          describe('integer', () => {
                            it('is parsed correctly', () => {});
                          });

                          describe('float', () => {
                            it('is parsed correctly', () => {});
                          });
                        });

                        describe('variable value', () => {
                          it('is parsed correctly', () => {});
                        });

                        describe('function call result', () => {
                          it('is parsed correctly', () => {});
                        });

                        describe('if expression', () => {
                          it('is parsed correctly', () => {});
                        });
                      });
                    });

                    describe('double-quoted', () => {
                      describe('with interpolation', () => {
                        describe('number', () => {
                          describe('integer', () => {
                            it('is parsed correctly', () => {});
                          });

                          describe('float', () => {
                            it('is parsed correctly', () => {});
                          });
                        });

                        describe('variable value', () => {
                          it('is parsed correctly', () => {});
                        });

                        describe('function call result', () => {
                          it('is parsed correctly', () => {});
                        });

                        describe('if expression', () => {
                          it('is parsed correctly', () => {});
                        });
                      });
                    });
                  });

                  describe('variable value', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('function call result', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('if expression', () => {
                    it('is parsed correctly', () => {});
                  });
                });
              });
            });
          });

          describe('let block', () => {
            describe('with simple value', () => {
              describe('number', () => {
                describe('integer', () => {
                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  it('is parsed correctly', () => {});
                });
              });

              describe('variable value', () => {
                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                it('is parsed correctly', () => {});
              });
            });

            describe('with compound value', () => {
              describe('HTML', () => {
                it('is parsed correctly', () => {});
              });

              describe('template call', () => {
                it('is parsed correctly', () => {});
              });

              describe('number', () => {
                describe('integer', () => {
                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  it('is parsed correctly', () => {});
                });
              });

              describe('variable value', () => {
                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                it('is parsed correctly', () => {});
              });

              describe('if expression', () => {
                it('is parsed correctly', () => {});
              });

              describe('for expression', () => {
                it('is parsed correctly', () => {});
              });

              describe('foreach expression', () => {
                it('is parsed correctly', () => {});
              });
            });
          });

          describe('if expression', () => {
            describe('with no else branch', () => {
              describe('with expression', () => {
                describe('simple', () => {
                  describe('variable value', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('function call', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('variable / math expression', () => {
                    it('is parsed correctly', () => {});
                  });

                  describe('logical NOT operator', () => {
                    it('is parsed correctly', () => {});
                  });
                });

                describe('compound', () => {
                  describe('logical operator', () => {
                    describe('AND', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('NOT AND', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('AND NOT', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('OR', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('NOT OR', () => {
                      it('is parsed correctly', () => {});
                    });

                    describe('OR NOT', () => {
                      it('is parsed correctly', () => {});
                    });
                  });
                });
              });
            });

            describe('with else branch', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('for expression', () => {
            describe('iterating over', () => {
              describe('variable value', () => {
                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                it('is parsed correctly', () => {});
              });

              describe('static value', () => {
                describe('list', () => {
                  it('is parsed correctly', () => {});
                });

                describe('map', () => {
                  it('is parsed correctly', () => {});
                });
              });
            });
          });

          describe('foreach expression', () => {
            describe('iterating over', () => {
              describe('variable value', () => {
                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                it('is parsed correctly', () => {});
              });

              describe('static value', () => {
                describe('list', () => {
                  it('is parsed correctly', () => {});
                });

                describe('map', () => {
                  it('is parsed correctly', () => {});
                });
              });
            });

            describe('with ifempty section', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('function call', () => {
            describe('plain function', () => {
              it('is parsed correctly', () => {});
            });

            describe('object method', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('template call', () => {
            describe('from the same namespace', () => {
              it('is parsed correctly', () => {});
            });

            describe('from the different namespace', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('SOY special characters', () => {
            describe('space', () => {
              it('is parsed correctly', () => {});
            });

            describe('indentation', () => {
              it('is parsed correctly', () => {});
            });

            describe('caret return', () => {
              it('is parsed correctly', () => {});
            });

            describe('newline', () => {
              it('is parsed correctly', () => {});
            });

            describe('nil', () => {
              it('is parsed correctly', () => {});
            });
          });

          describe('HTML entities', () => {
            it('is parsed correctly', () => {});
          });

          describe('plain text', () => {
            describe('ASCII characters', () => {
              it('is parsed correctly', () => {});
            });

            describe('UTF-8 characters', () => {
              it('is parsed correctly', () => {});
            });
          });
        });
      });
    });
  });
});
