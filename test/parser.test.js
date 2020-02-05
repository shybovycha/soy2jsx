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
    });
  });
});
