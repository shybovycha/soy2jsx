const { compileFile } = require('../src/compiler');

describe('#compileFile', () => {
  describe('for simple SOY templates', () => {
    it('does not fail', () => {
      expect(compileFile('test/sample_data/sample.soy')).resolves.not.toBeNull();
    });
  });
});
