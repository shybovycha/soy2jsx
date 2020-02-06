const parser = require('../src/grammar/SOY.js');

describe('parser', () => {
  describe('#parse', () => {
    describe('template declarations', () => {
      describe('namespace', () => {
        describe('simple path', () => {
          describe('which is valid', () => {
            const source = `
{namespace Something}

{template .tpl}
{/template}
            `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('which is invalid because', () => {
            describe('it starts with a digit', () => {
              const source = `
{namespace 1Something}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it starts with a special character', () => {
              const source = `
{namespace ?Something}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it starts with a dot', () => {
              const source = `
{namespace .Something}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it ends with a special character', () => {
              const source = `
{namespace Something?}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it ends with a dot', () => {
              const source = `
{namespace Something.}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });
          });
        });

        describe('complex path', () => {
          describe('which is invalid because', () => {
            describe('it contains multiple consequent dots', () => {
              const source = `
{namespace Something..Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it contains space character', () => {
              const source = `
{namespace Something Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it contains special character', () => {
              const source = `
{namespace Something!Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('it contains namespace part starting with digit', () => {
              const source = `
{namespace Something.1Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });
          });
        });
      });

      describe('template name', () => {
        describe('which is valid', () => {
          const source = `
{namespace Something}

{template .tem.pla.te}
{/template}
            `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });

        describe('which is invalid because', () => {
          describe('it contains multiple consequitive dots', () => {
            const source = `
{namespace Something}

{template .tem..pla.te}
{/template}
            `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });

          describe('it contains special characters', () => {
            const source = `
{namespace Something}

{template .tem?pla!te}
{/template}
            `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });

          // TODO: is this really invalid?
          describe('it starts with a letter', () => {
            const source = `
{namespace Something}

{template tpl}
{/template}
            `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });

          describe('it starts with a digit', () => {
            const source = `
{namespace Something}

{template 1tpl}
{/template}
            `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });
        });
      });

      describe('template comment', () => {
        describe('no comment', () => {
          const source = `
{namespace Something}

{template .tpl}
{/template}
            `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });

        describe('one-line comment', () => {
          describe('with required parameter declaration', () => {
            const source = `
{namespace Something}

// @param message Greeting message
{template .tpl}
{/template}
            `;

            it('ignores parameter declaration', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with optional parameter declaration', () => {
            const source = `
{namespace Something}

// @param? message Greeting message
{template .tpl}
{/template}
            `;

            it('ignores parameter declaration', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with special characters', () => {
            const source = `
{namespace Something}

// this^ is? awesome!
{template .tpl}
{/template}
            `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with variable interpolation', () => {
            const source = `
{namespace Something}

// hello {$world}
{template .tpl}
{/template}
            `;

            it('ignores that', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with math expression', () => {
            const source = `
{namespace Something}

// hello {3+4}
{template .tpl}
{/template}
            `;

            it('ignores that', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with ternary expression', () => {
            const source = `
{namespace Something}

// hello {$a ? $b : $c}
{template .tpl}
{/template}
            `;

            it('ignores that', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });

        describe('multi-line comment with no parameters', () => {
          describe('with special characters', () => {
            const source = `
{namespace Something}

/*
hello!!! world???
*/
{template .tpl}
{/template}
            `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with variable interpolation', () => {
            const source = `
{namespace Something}

/*
hello {$world}
*/
{template .tpl}
{/template}
            `;

            it('ignores that', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with math expression', () => {
            const source = `
{namespace Something}

/*
hello {3+4}
*/
{template .tpl}
{/template}
            `;

            it('ignores that', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with ternary expression', () => {
            const source = `
{namespace Something}

/*
hello {$world ? $a : 42}
*/
{template .tpl}
{/template}
            `;

            it('ignores that', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });

        describe('multi-line comment with single required parameter', () => {
          describe('and no documentation', () => {
            const source = `
{namespace Something}

/*
 * @param message
*/
{template .tpl}
{/template}
            `;

            it('generates that parameter', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('and documentation string', () => {
            describe('and special characters', () => {
              const source = `
{namespace Something}

/*
 * @param message Greetings! message?^
*/
{template .tpl}
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('and variable interpolation', () => {
              const source = `
{namespace Something}

/*
 * @param message {$message}
*/
{template .tpl}
{/template}
            `;

              it('ignores that', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('and math expression', () => {
              const source = `
{namespace Something}

/*
 * @param message {3+42}
*/
{template .tpl}
{/template}
            `;

              it('ignores that', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('and ternary expression', () => {
              const source = `
{namespace Something}

/*
 * @param message {$a ? $b : 42}
*/
{template .tpl}
{/template}
            `;

              it('ignores that', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });

        describe('multi-line comment with single optional parameter', () => {
          describe('and no documentation', () => {
            const source = `
{namespace Something}

/*
 * @param? message
*/
{template .tpl}
{/template}
            `;

            it('generates that parameter', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('and documentation string', () => {
            describe('and special characters', () => {
              const source = `
{namespace Something}

/*
 * @param? message Greetings! Santa?
*/
{template .tpl}
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('and variable interpolation', () => {
              const source = `
{namespace Something}

/*
 * @param? message something {$weird} is going on here
*/
{template .tpl}
{/template}
            `;

              it('ignores that', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('and math expression', () => {
              const source = `
{namespace Something}

/*
 * @param? message Because {42-3.14}
*/
{template .tpl}
{/template}
            `;

              it('ignores that', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('and ternary expression', () => {
              const source = `
{namespace Something}

/*
 * @param? message Since {$now ? 1942 : 2020}
*/
{template .tpl}
{/template}
            `;

              it('ignores that', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });

        describe('multi-line comment with multiple parameters', () => {
          describe('all required', () => {
            const source = `
{namespace Something}

/*
 * @param name Person to greet
 * @param greeting Greeting to show
*/
{template .tpl}
{/template}
            `;

            it('generates those params', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('all optional', () => {
            const source = `
{namespace Something}

/*
 * @param? name Name or 'world' otherwise
 * @param? greeting How to greet or 'hello' otherwise
*/
{template .tpl}
{/template}
            `;

            it('generates those params', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('both required and optional', () => {
            const source = `
{namespace Something}

/*
 * @param name Person to greet
 * @param? greeting Greeting or 'Hello' by default
*/
{template .tpl}
{/template}
            `;

            it('generates those params', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });
      });
    });

    describe('template body', () => {
      describe('HTML', () => {
        describe('attributes', () => {
          describe('none', () => {
            const source = `
{namespace Something}

{template .tpl}
  <div>Hello</div>
{/template}
            `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('just one', () => {
            describe('boolean', () => {
              describe('with static name', () => {
                const source = `
{namespace Something}

{template .tpl}
  <input disabled />
{/template}
                `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('with generated name', () => {
                describe('from interpolating a variable', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$disabled} />
{/template}
                  `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('from a function call', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {getDisabled()} />
{/template}
                  `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('from a ternary expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$isDisabled ? 'disabled' : ''} />
{/template}
            `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('from an if expression', () => {
                  describe('with no else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isDisabled}disabled{/if} />
{/template}
            `;

                    it('is parsed correctly', () => {
                      expect(parser.parse(source)).toMatchObject({});
                    });
                  });

                  describe('with else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isDisabled}disabled{else}enabled{/if} />
{/template}
            `;

                    it('is parsed correctly', () => {
                      expect(parser.parse(source)).toMatchObject({});
                    });
                  });
                });

                describe('from math expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {'dis' + 'a' + 'bled'} />
{/template}
            `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });
            });

            describe('key-value attribute', () => {
              describe('with static name and value', () => {
                const source = `
{namespace Something}

{template .tpl}
  <input placeholder="name" />
{/template}
            `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('with generated name and static value', () => {
                describe('from interpolating a variable', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholderAttr}="name" />
{/template}
            `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('from a function call', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {getPlaceholderName()}="name" />
{/template}
            `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('from a ternary expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholder ? 'placeholder' : 'title'}="name" />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from an if expression', () => {
                  describe('with no else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isPlaceholderSupported}place{/if}holder="name" />
{/template}
            `;

                    it('is parsed correctly', () => {
                      expect(parser.parse(source)).toMatchObject({});
                    });
                  });

                  describe('with else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isPlaceholderSupported}placeholder{else}value{/if}="name" />
{/template}
            `;

                    it('is parsed correctly', () => {
                      expect(parser.parse(source)).toMatchObject({});
                    });
                  });
                });

                describe('from math expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {'place' + 'holder'}="name" />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });
              });

              describe('with generated name and value', () => {
                describe('from interpolating a variable', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholder}="{$name}" />
{/template}
            `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('from interpolating a variable outside a string', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholder}={$name} />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from a function call', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {getAttribute()}={getValue()} />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from a ternary expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$isPlaceholder ? 'placeholder' : 'value'}={$isPlaceholder ? 'hint' : 'real value'} />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from an if expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {if $isPlaceholder}placeholder{else}value{/if}={if $isPlaceholder}"Enter name"{else}{$value}{/if} />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from math expression as name', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$prefix + $suffix}="{$preValue}" />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from math expression as value', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$attrName}="{$preValue + $postValue}" />
{/template}
            `;

                  it('fails', () => {
                    expect(() => parser.parse(source)).toThrow();
                  });
                });

                describe('from string interpolation as value', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$attrName}="{$attrPreValue}-value" />
{/template}
            `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });
            });
          });

          describe('multiple', () => {
            describe('boolean', () => {
              const source = `
{namespace Something}

{template .tpl}
  <input enabled autofocus />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('key-value', () => {
              const source = `
{namespace Something}

{template .tpl}
  <input placeholder="enter name" id="name" />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('boolean and key-value', () => {
              const source = `
{namespace Something}

{template .tpl}
  <input enabled autofocus placeholder="enter name" id="myName" />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });

        describe('interpolated tag name', () => {
          describe('self-closed tags', () => {
            describe('from interpolating a variable', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$tagName} />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from a function call', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{getValue('tag')} />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from a ternary expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$isInput ? 'input' : 'div'} />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from an if expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{if $isInput}input{else}div{/if} />
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from math expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$namespacePrefix + 'input'} />
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });

          describe('pair tags', () => {
            describe('from interpolating a variable', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$tagName}>hello</{$tagName}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from a function call', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{getTagName()}>hello</{getTagName()}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from a ternary expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{not $isInline ? 'div' : 'span'}>hello</{$isInline ? 'span' : 'div'}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from an if expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{if $isInline}span{else}div{/if}>hello</{if $isInline}span{else}div{/if}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from math expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$namespace + $tagName}>hello</{$namespace + $tagName}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });

          describe('pair unclosed tags', () => {
            describe('from interpolating a variable', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$tagName}>hello</{$tagName}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from a function call', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{getTagName()}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from a ternary expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{not $isInline ? 'div' : 'span'}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from an if expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{if $isDivider}hr{else}br{/if}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('from math expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$namespace + $tagName}>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });

        describe('top-level', () => {
          describe('multiple elements', () => {
            describe('self-closed tags', () => {
              const source = `
{namespace Something}

{template .tpl}
  <input />
  <calendar />
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('pair tags', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>hello</div>
  <span>world</span>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('pair unclosed tags', () => {
              const source = `
{namespace Something}

{template .tpl}
  <img>
  <input>
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });

        describe('children', () => {
          describe('SOY special characters', () => {
            describe('space', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    {sp}
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('indentation', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    {\\t}
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('caret return', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    {\\r}
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('newline', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    {\\n}
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('nil', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    {nil}
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });

          describe('HTML entities', () => {
            const source = `
{namespace Something}

{template .tpl}
  <div>
    &nbsp;
  </div>
{/template}
                  `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('plain text', () => {
            describe('ASCII characters', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    hello world
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('UTF-8 characters', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>
    zürück śliwkę ze słupsku 友達
  </div>
{/template}
                  `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });
      });

      describe('variable interpolation', () => {
        describe('simple', () => {
          const source = `
{namespace Something}

{template .tpl}
  {$content}
{/template}
          `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });

        describe('with filters', () => {
          describe('just one', () => {
            describe('with no parameters', () => {
              const source = `
{namespace Something}

{template .tpl}
  {$content|htmlSafe}
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('with single parameter', () => {
              describe('number', () => {
                describe('integer', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|indent:4}
{/template}
                  `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:0.14}
{/template}
          `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$opacity}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('function call result', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:getOpacity()}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('ternary expression', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$transparent ? 0 : 1}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('string', () => {
                describe('single-quoted', () => {
                  describe('with interpolation', () => {
                    describe('number', () => {
                      describe('integer', () => {
                        const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{4}'}
{/template}
          `;

                        it('is parsed correctly', () => {
                          expect(parser.parse(source)).toMatchObject({});
                        });
                      });

                      describe('float', () => {
                        const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{3.2}'}
{/template}
          `;

                        it('is parsed correctly', () => {
                          expect(parser.parse(source)).toMatchObject({});
                        });
                      });
                    });

                    describe('variable value', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{$tint}'}
{/template}
          `;

                      it('is parsed correctly', () => {
                        expect(parser.parse(source)).toMatchObject({});
                      });
                    });

                    describe('function call result', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{getTint()}'}
{/template}
          `;

                      it('is parsed correctly', () => {
                        expect(parser.parse(source)).toMatchObject({});
                      });
                    });

                    describe('if expression', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{$tint < 0.4 ? 0.4 : 0.6}'}
{/template}
          `;

                      it('is parsed correctly', () => {
                        expect(parser.parse(source)).toMatchObject({});
                      });
                    });
                  });
                });

                describe('double-quoted', () => {
                  describe('with interpolation', () => {
                    describe('number', () => {
                      describe('integer', () => {
                        const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{4}"}
{/template}
          `;

                        it('is parsed correctly', () => {
                          expect(parser.parse(source)).toMatchObject({});
                        });
                      });

                      describe('float', () => {
                        const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{0.6}"}
{/template}
          `;

                        it('is parsed correctly', () => {
                          expect(parser.parse(source)).toMatchObject({});
                        });
                      });
                    });

                    describe('variable value', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{$tint}"}
{/template}
          `;

                      it('is parsed correctly', () => {
                        expect(parser.parse(source)).toMatchObject({});
                      });
                    });

                    describe('function call result', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{getTint()}"}
{/template}
          `;

                      it('is parsed correctly', () => {
                        expect(parser.parse(source)).toMatchObject({});
                      });
                    });

                    describe('ternary expression', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{$tint < 0.4 ? 0.4 : 0.6}"}
{/template}
          `;

                      it('is parsed correctly', () => {
                        expect(parser.parse(source)).toMatchObject({});
                      });
                    });
                  });
                });
              });
            });

            describe('with multiple parameters', () => {
              describe('number', () => {
                describe('integer', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|indent:4|tabWidth:8}
{/template}
          `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:1.0|relevancy:0.4}
{/template}
          `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$opacity|tabs:$tabWidth|indent:$indentationWidth}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('function call result', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:getOpacity()|indent:getIndentationWidth()}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('ternary expression', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$opacity < 0 ? 0 : 1.0|tabs:$opacity > 0 ? 4 : 0}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });
          });

          describe('multiple', () => {
            describe('with no parameters', () => {
              const source = `
{namespace Something}

{template .tpl}
  {$content|transparent|escaped}
{/template}
          `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('with multiple parameters', () => {
              describe('number', () => {
                describe('integer', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|tab:4:2|indent:2:8}
{/template}
          `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:0.1:0.4|transition:1.2:3.4}
{/template}
          `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:$gradientFrom:$gradientTo|transition:$transitionFrom:$transitionTo}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('function call result', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:getGradientFrom():getGradientTo()|transition:getTransitionFrom():getTransitionTo()}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              // TODO: this might be actually invalid - how do we get where it is the ternary colon or filter param' colon?
              describe('ternary expression', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:$a < 0.1 ? 0.2:0.4|transition:1.2:3.4}
{/template}
          `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });
          });
        });
      });

      describe('let block', () => {
        describe('with simple value', () => {
          describe('number', () => {
            describe('integer', () => {
              const source = `
{namespace Something}

{template .tpl}
  {let $tabWidth: 4 /}
{/template}
          `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('float', () => {
              const source = `
{namespace Something}

{template .tpl}
  {let $gradient: 0.4 /}
{/template}
          `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });

          describe('variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $tabWidth: $otherVar /}
{/template}
          `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $tabWidth: getOtherVar() /}
{/template}
          `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('boolean expression', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $isBlue: $isEnabled and not $isSelected or $somethingElse /}
{/template}
          `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });

        describe('with compound value', () => {
          describe('HTML', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $info}
    <div class="info">{$message}</div>
  {/let}
{/template}
          `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('template call', () => {
            describe('from same namespace', () => {
              describe('with no parameters', () => {
                const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message /}
  {/let}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('with inline parameters', () => {
                describe('boolean', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message isInfo isPopup /}
  {/let}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('key-value', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message type="info" message=$mesage /}
  {/let}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('mixed', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message isInfo message=getMessage() /}
  {/let}
{/template}
                `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('with body parameters', () => {
                describe('inline boolean param', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message }
      {param body /}
    {/call}
  {/let}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('inline key-value param', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message }
      {param body: 12 /}
    {/call}
  {/let}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('multiline param', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message }
      {param body}
      <b>this is a warning</b>
      {/param}
    {/call}
  {/let}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });
            });

            describe('from other namespace', () => {
              const source = `
{namespace Something}

{template .tpl}
{let $info}
{call Some.Other.Namespace.message /}
{/let}
{/template}
            `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });

          describe('number', () => {
            describe('integer', () => {
              const source = `
{namespace Something}

{template .tpl}
{let $info}
{4}
{/let}
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('float', () => {
              const source = `
{namespace Something}

{template .tpl}
{let $info}
{-3.14}
{/let}
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });

          describe('variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
{let $info}
{$bigVariable}
{/let}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
{let $info}
{getBigVariable()}
{/let}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('if expression', () => {
            const source = `
{namespace Something}

{template .tpl}
{let $info}
{if $isBig}
<h1>Big message</h1>
{else}
<b>small message</b>
{/if}
{/let}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('for expression', () => {
            const source = `
{namespace Something}

{template .tpl}
{let $info}
{for $it in $var}
  <div>{$it}</div>
{/for}
{/let}
{/template}
              `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });

          describe('foreach expression', () => {
            const source = `
{namespace Something}

{template .tpl}
{let $info}
{foreach $it in $var}
  <div>{$it}</div>
{ifempty}
  <div>nothing here</div>
{/foreach}
{/let}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });
      });

      describe('if expression', () => {
        describe('with no else branch', () => {
          describe('with expression', () => {
            describe('simple', () => {
              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
{if $variable}
  hello
{/if}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('function call', () => {
                const source = `
{namespace Something}

{template .tpl}
{if isCondition()}
  hello
{/if}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });

            describe('compound', () => {
              describe('logical operator', () => {
                describe('AND', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 and $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('NOT AND', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if not $variable1 and $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('AND NOT', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 and not $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('OR', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 or $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('NOT OR', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if not $variable1 or $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('OR NOT', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 or not $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('comparison operator', () => {
                describe('less', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 < $variable2}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('less or equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 <= getValue()}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 == 'something'}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('not equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 != -3.14}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('greater or equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 >= someOtherValue()}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('greater', () => {
                  const source = `
{namespace Something}

{template .tpl}
{if $variable1 > complexCall($variable2)}
  hello
{/if}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });
            });
          });
        });

        describe('with else branch', () => {
          const source = `
{namespace Something}

{template .tpl}
{if $variable1 and $variable2}
  hello
{else}
  goodbye
{/if}
{/template}
              `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });
      });

      describe('switch expression', () => {
        describe('with condition', () => {
          describe('as static value', () => {
            describe('number', () => {
              describe('integer', () => {
                const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
{case 4}
  resuslt1
{/switch}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('float', () => {
                const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
  {case -3.14}
  resuslt1
{/switch}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });

            describe('string', () => {
              describe('single-quoted', () => {
                const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
{case 'case 1'}
  resuslt1
{/switch}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('double-quoted', () => {
                const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
  {case "base case"}
  resuslt1
{/switch}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });
          });

          describe('as variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
  {case -993}
  resuslt1
{/switch}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('as function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
{switch getMyValue()}
  {case 42}
  resuslt1
{/switch}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('as math expression', () => {
            const source = `
{namespace Something}

{template .tpl}
{switch 4 + $x}
  {case 12}
  resuslt1
{/switch}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('as logical expression', () => {
            const source = `
{namespace Something}

{template .tpl}
{switch $variable1 and not $variable2 or $boolVar}
  {case 4}
  resuslt1
{/switch}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });

        describe('with one case', () => {
          describe('with simple result', () => {
            const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
  {case 4}
  resuslt1
{/switch}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with multi-line result', () => {
            const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
  {case 4}
  resuslt1
  it is still this result
{/switch}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });
        });

        describe('with multiple cases', () => {
          const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
{case 1}
  resuslt1
{case 2}
  resuslt2
{/switch}
{/template}
              `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });

        describe('with default case', () => {
          const source = `
{namespace Something}

{template .tpl}
{switch $variable1}
  {case 4}
  resuslt1
  {default}
  default value
{/switch}
{/template}
              `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });
      });

      describe('for expression', () => {
        describe('iterating over', () => {
          describe('variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
{for $it in $list}
  hello-{$it}
{/for}
{/template}
              `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
{for $it in getList()}
  hello-{$it}
{/for}
{/template}
              `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });

          describe('static value', () => {
            describe('list', () => {
              const source = `
{namespace Something}

{template .tpl}
{for $it in [1,2,5,7]}
  hello-{$it}
{/for}
{/template}
              `;

              it('fails', () => {
                expect(() => parser.parse(source)).toThrow();
              });
            });

            describe('range', () => {
              describe('with start, end and step params', () => {
                const source = `
{namespace Something}

{template .tpl}
{for $it in range(3, 10, 2)}
  hello-{$it}
{/for}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('with start and end params', () => {
                const source = `
{namespace Something}

{template .tpl}
{for $it in range(3, 10)}
  hello-{$it}
{/for}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('with end param only', () => {
                const source = `
{namespace Something}

{template .tpl}
{for $it in range(10)}
  hello-{$it}
{/for}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });
          });
        });
      });

      describe('foreach expression', () => {
        describe('iterating over', () => {
          describe('variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
{foreach $it in $list}
  hello-{$it}
{/foreach}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
{foreach $it in getList()}
  hello-{$it}
{/foreach}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('static value', () => {
            describe('list', () => {
              const source = `
{namespace Something}

{template .tpl}
{foreach $it in ['moo', 'foo', 'bar']}
  hello-{$it}
{/foreach}
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('map', () => {
              const source = `
{namespace Something}

{template .tpl}
{foreach $it in ['moo': -3.14, 'foo': 2.22]}
  hello-{$it}
{/foreach}
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });
          });
        });

        describe('with ifempty section', () => {
          const source = `
{namespace Something}

{template .tpl}
{foreach $it in getList()}
  hello-{$it}
{ifempty}
  goodbye
{/foreach}
{/template}
              `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });
      });

      describe('function call', () => {
        describe('plain function', () => {
          describe('without parameters', () => {
            const source = `
{namespace Something}

{template .tpl}
{getHtml()}
{/template}
              `;

            it('is parsed correctly', () => {
              expect(parser.parse(source)).toMatchObject({});
            });
          });

          describe('with parameters', () => {
            describe('variable value', () => {
              const source = `
{namespace Something}

{template .tpl}
{getHtml($var1, $var2)}
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('function call result', () => {
              const source = `
{namespace Something}

{template .tpl}
{getHtml(getParam1(), getParam2())}
{/template}
              `;

              it('is parsed correctly', () => {
                expect(parser.parse(source)).toMatchObject({});
              });
            });

            describe('static value', () => {
              describe('number', () => {
                describe('integer', () => {
                  const source = `
{namespace Something}

{template .tpl}
{getHtml(1, 42, -7)}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
{getHtml(3.14, -2.22)}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('string', () => {
                describe('single-quoted', () => {
                  const source = `
{namespace Something}

{template .tpl}
{getHtml('some', 'string')}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });

                describe('double-quoted', () => {
                  const source = `
{namespace Something}

{template .tpl}
{getHtml("other", "string")}
{/template}
              `;

                  it('is parsed correctly', () => {
                    expect(parser.parse(source)).toMatchObject({});
                  });
                });
              });

              describe('list', () => {
                const source = `
{namespace Something}

{template .tpl}
{getHtml([ 2, 4, 6 ])}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });

              describe('map', () => {
                const source = `
{namespace Something}

{template .tpl}
{getHtml([ "key1": 12, "key2": -2 ])}
{/template}
              `;

                it('is parsed correctly', () => {
                  expect(parser.parse(source)).toMatchObject({});
                });
              });
            });
          });
        });

        describe('object method', () => {
          describe('without parameters', () => {
            const source = `
{namespace Something}

{template .tpl}
{obj1.getHtml()}
{/template}
              `;

            it('fails', () => {
              expect(() => parser.parse(source)).toThrow();
            });
          });
        });
      });

      describe('template call', () => {
        describe('from the same namespace', () => {
          const source = `
{namespace Something}

{template .tpl}
{call .otherTpl /}
{/template}
              `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });

        describe('from the different namespace', () => {
          const source = `
{namespace Something}

{template .tpl}
{call Some.Other.Namespace.otherTpl /}
{/template}
              `;

          it('is parsed correctly', () => {
            expect(parser.parse(source)).toMatchObject({});
          });
        });
      });
    });
  });
});
