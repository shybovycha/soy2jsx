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
  });
});
