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

            it('is parsed correctly', () => {});
          });

          describe('which is invalid because', () => {
            describe('it starts with a digit', () => {
              const source = `
{namespace 1Something}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
            });

            describe('it starts with a special character', () => {
              const source = `
{namespace ?Something}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
            });

            describe('it starts with a dot', () => {
              const source = `
{namespace .Something}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
            });

            describe('it ends with a special character', () => {
              const source = `
{namespace Something?}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
            });

            describe('it ends with a dot', () => {
              const source = `
{namespace Something.}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
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

              it('fails', () => {});
            });

            describe('it contains space character', () => {
              const source = `
{namespace Something Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
            });

            describe('it contains special character', () => {
              const source = `
{namespace Something!Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
            });

            describe('it contains namespace part starting with digit', () => {
              const source = `
{namespace Something.1Else}

{template .tpl}
{/template}
            `;

              it('fails', () => {});
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

          it('is parsed correctly', () => {});
        });

        describe('which is invalid because', () => {
          describe('it contains multiple consequitive dots', () => {
            const source = `
{namespace Something}

{template .tem..pla.te}
{/template}
            `;

            it('fails', () => {});
          });

          describe('it contains special characters', () => {
            const source = `
{namespace Something}

{template .tem?pla!te}
{/template}
            `;

            it('fails', () => {});
          });

          // TODO: is this really invalid?
          describe('it starts with a letter', () => {
            const source = `
{namespace Something}

{template tpl}
{/template}
            `;

            it('fails', () => {});
          });

          describe('it starts with a digit', () => {
            const source = `
{namespace Something}

{template 1tpl}
{/template}
            `;

            it('fails', () => {});
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

          it('is parsed correctly', () => {});
        });

        describe('one-line comment', () => {
          describe('with required parameter declaration', () => {
            const source = `
{namespace Something}

// @param message Greeting message
{template .tpl}
{/template}
            `;

            it('ignores parameter declaration', () => {});
          });

          describe('with optional parameter declaration', () => {
            const source = `
{namespace Something}

// @param? message Greeting message
{template .tpl}
{/template}
            `;

            it('ignores parameter declaration', () => {});
          });

          describe('with special characters', () => {
            const source = `
{namespace Something}

// this^ is? awesome!
{template .tpl}
{/template}
            `;

            it('is parsed correctly', () => {});
          });

          describe('with variable interpolation', () => {
            const source = `
{namespace Something}

// hello {$world}
{template .tpl}
{/template}
            `;

            it('ignores that', () => {});
          });

          describe('with math expression', () => {
            const source = `
{namespace Something}

// hello {3+4}
{template .tpl}
{/template}
            `;

            it('ignores that', () => {});
          });

          describe('with ternary expression', () => {
            const source = `
{namespace Something}

// hello {$a ? $b : $c}
{template .tpl}
{/template}
            `;

            it('ignores that', () => {});
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

            it('is parsed correctly', () => {});
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

            it('ignores that', () => {});
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

            it('ignores that', () => {});
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

            it('ignores that', () => {});
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

            it('generates that parameter', () => {});
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

              it('is parsed correctly', () => {});
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

              it('ignores that', () => {});
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

              it('ignores that', () => {});
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

              it('ignores that', () => {});
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

            it('generates that parameter', () => {});
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

              it('is parsed correctly', () => {});
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

              it('ignores that', () => {});
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

              it('ignores that', () => {});
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

              it('ignores that', () => {});
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

            it('generates those params', () => {});
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

            it('generates those params', () => {});
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

            it('generates those params', () => {});
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

            it('is parsed correctly', () => {});
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

                it('is parsed correctly', () => {});
              });

              describe('with generated name', () => {
                describe('from interpolating a variable', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$disabled} />
{/template}
                  `;

                  it('is parsed correctly', () => {});
                });

                describe('from a function call', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {getDisabled()} />
{/template}
                  `;

                  it('is parsed correctly', () => {});
                });

                describe('from a ternary expression', () => {
const source = `
{namespace Something}

{template .tpl}
  <input {$isDisabled ? 'disabled' : ''} />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from an if expression', () => {
                  describe('with no else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isDisabled}disabled{/if} />
{/template}
            `;

                    it('is parsed correctly', () => {});
                  });

                  describe('with else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isDisabled}disabled{else}enabled{/if} />
{/template}
            `;

                    it('is parsed correctly', () => {});
                  });
                });

                describe('from math expression', () => {
const source = `
{namespace Something}

{template .tpl}
  <input {'dis' + 'a' + 'bled'} />
{/template}
            `;

                  it('is parsed correctly', () => {});
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

                it('is parsed correctly', () => {});
              });

              describe('with generated name and static value', () => {
                describe('from interpolating a variable', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholderAttr}="name" />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from a function call', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {getPlaceholderName()}="name" />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from a ternary expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholder ? 'placeholder' : 'title'}="name" />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from an if expression', () => {
                  describe('with no else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isPlaceholderSupported}place{/if}holder="name" />
{/template}
            `;

                    it('is parsed correctly', () => {});
                  });

                  describe('with else branch', () => {
                    const source = `
{namespace Something}

{template .tpl}
  <input {if $isPlaceholderSupported}placeholder{else}value{/if}="name" />
{/template}
            `;

                    it('is parsed correctly', () => {});
                  });
                });

                describe('from math expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {'place' + 'holder'}="name" />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('with generated name and value', () => {
                describe('from interpolating a variable', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$placeholder}={$name} />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from a function call', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {getAttribute()}={getValue()} />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from a ternary expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {$isPlaceholder ? 'placeholder' : 'value'}={$isPlaceholder ? 'hint' : 'real value'} />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from an if expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {if $isPlaceholder}placeholder{else}value{/if}={if $isPlaceholder}"Enter name"{else}{$value}{/if} />
{/template}
            `;

                  it('is parsed correctly', () => {});
                });

                describe('from math expression', () => {
                  const source = `
{namespace Something}

{template .tpl}
  <input {'place' + 'holder'}="{'name' + 'placeholder'}" />
{/template}
            `;

                  it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
            });

            describe('key-value', () => {
              const source = `
{namespace Something}

{template .tpl}
  <input placeholder="enter name" id="name" />
{/template}
            `;

              it('is parsed correctly', () => {});
            });

            describe('boolean and key-value', () => {
              const source = `
{namespace Something}

{template .tpl}
  <input enabled autofocus placeholder="enter name" id="myName" />
{/template}
            `;

              it('is parsed correctly', () => {});
            })
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

              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{getValue('tag')} />
{/template}
            `;

              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$isInput ? 'input' : 'div'} />
{/template}
            `;

              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{if $isInput}input{else}div{/if} />
{/template}
            `;

              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$namespacePrefix + 'input'} />
{/template}
              `;

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{getTagName()}>hello</{getTagName()}>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{not $isInline ? 'div' : 'span'}>hello</{$isInline ? 'span' : 'div'}>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{if $isInline}span{else}div{/if}>hello</{if $isInline}span{else}div{/if}>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$namespace + $tagName}>hello</{$namespace + $tagName}>
{/template}
              `;

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
            });

            describe('from a function call', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{getTagName()}>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('from a ternary expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{not $isInline ? 'div' : 'span'}>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('from an if expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{if $isDivider}hr{else}br{/if}>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('from math expression', () => {
              const source = `
{namespace Something}

{template .tpl}
  <{$namespace + $tagName}>
{/template}
              `;

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
            });

            describe('pair tags', () => {
              const source = `
{namespace Something}

{template .tpl}
  <div>hello</div>
  <span>world</span>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('pair unclosed tags', () => {
              const source = `
{namespace Something}

{template .tpl}
  <img>
  <input>
{/template}
              `;

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

            it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

          it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:0.14}
{/template}
          `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$opacity}
{/template}
          `;

                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:getOpacity()}
{/template}
          `;

                it('is parsed correctly', () => {});
              });

              describe('ternary expression', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$transparent ? 0 : 1}
{/template}
          `;

                it('is parsed correctly', () => {});
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

                        it('is parsed correctly', () => {});
                      });

                      describe('float', () => {
                        const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{3.2}'}
{/template}
          `;

                        it('is parsed correctly', () => {});
                      });
                    });

                    describe('variable value', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{$tint}'}
{/template}
          `;

                      it('is parsed correctly', () => {});
                    });

                    describe('function call result', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{getTint()}'}
{/template}
          `;

                      it('is parsed correctly', () => {});
                    });

                    describe('if expression', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:'blue-{$tint < 0.4 ? 0.4 : 0.6}'}
{/template}
          `;

                      it('is parsed correctly', () => {});
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

                        it('is parsed correctly', () => {});
                      });

                      describe('float', () => {
                        const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{0.6}"}
{/template}
          `;

                        it('is parsed correctly', () => {});
                      });
                    });

                    describe('variable value', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{$tint}"}
{/template}
          `;

                      it('is parsed correctly', () => {});
                    });

                    describe('function call result', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{getTint()}"}
{/template}
          `;

                      it('is parsed correctly', () => {});
                    });

                    describe('ternary expression', () => {
                      const source = `
{namespace Something}

{template .tpl}
  {$content|color:"blue-{$tint < 0.4 ? 0.4 : 0.6}"}
{/template}
          `;

                      it('is parsed correctly', () => {});
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

                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:1.0|relevancy:0.4}
{/template}
          `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$opacity|tabs:$tabWidth|indent:$indentationWidth}
{/template}
          `;

                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:getOpacity()|indent:getIndentationWidth()}
{/template}
          `;

                it('is parsed correctly', () => {});
              });

              describe('ternary expression', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|opacity:$opacity < 0 ? 0 : 1.0|tabs:$opacity > 0 ? 4 : 0}
{/template}
          `;

                it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:0.1:0.4|transition:1.2:3.4}
{/template}
          `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('variable value', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:$gradientFrom:$gradientTo|transition:$transitionFrom:$transitionTo}
{/template}
          `;

                it('is parsed correctly', () => {});
              });

              describe('function call result', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:getGradientFrom():getGradientTo()|transition:getTransitionFrom():getTransitionTo()}
{/template}
          `;

                it('is parsed correctly', () => {});
              });

              // TODO: this might be actually invalid - how do we get where it is the ternary colon or filter param' colon?
              describe('ternary expression', () => {
                const source = `
{namespace Something}

{template .tpl}
  {$content|gradient:$a < 0.1 ? 0.2:0.4|transition:1.2:3.4}
{/template}
          `;

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
              const source = `
{namespace Something}

{template .tpl}
  {let $tabWidth: 4}
{/template}
          `;

              it('is parsed correctly', () => {});
            });

            describe('float', () => {
              const source = `
{namespace Something}

{template .tpl}
  {let $gradient: 0.4}
{/template}
          `;

              it('is parsed correctly', () => {});
            });
          });

          describe('variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $tabWidth: $otherVar}
{/template}
          `;

            it('is parsed correctly', () => {});
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $tabWidth: getOtherVar()}
{/template}
          `;

            it('is parsed correctly', () => {});
          });

          describe('boolean expression', () => {
            const source = `
{namespace Something}

{template .tpl}
  {let $isBlue: $isEnabled and not $isSelected or $somethingElse}
{/template}
          `;

            it('is parsed correctly', () => {});
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

            it('is parsed correctly', () => {});
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

                it('is parsed correctly', () => {});
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

                  it('is parsed correctly', () => {});
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

                it('is parsed correctly', () => {});
                });

                describe('mixed', () => {
                  const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message isInfo message=getMessage() }
  {/let}
{/template}
                `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('with body parameter', () => {
                const source = `
{namespace Something}

{template .tpl}
  {let $info}
    {call .message }
      <b>this is a warning</b>
    {/call}
  {/let}
{/template}
              `;

                it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

              it('is parsed correctly', () => {});
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

            it('is parsed correctly', () => {});
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

            it('is parsed correctly', () => {});
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

            it('is parsed correctly', () => {});
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

            it('is parsed correctly', () => {});
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
{/for}
{/let}
{/template}
              `;

            it('is parsed correctly', () => {});
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
<div>
{if $variable}
  hello
{/if}
</div>
{/template}
              `;

                it('is parsed correctly', () => {});
              });

              describe('function call', () => {
                const source = `
{namespace Something}

{template .tpl}
<div>
{if isCondition()}
  hello
{/if}
</div>
{/template}
              `;

                it('is parsed correctly', () => {});
              });
            });

            describe('compound', () => {
              describe('logical operator', () => {
                describe('AND', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 and $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('NOT AND', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if not $variable1 and $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('AND NOT', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 and not $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('OR', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 or $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('NOT OR', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if not $variable1 or $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('OR NOT', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 or not $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('comparison operator', () => {
                describe('less', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 < $variable2}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('less or equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 <= getValue()}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 == 'something'}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('not equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 != -3.14}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('greater or equal', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 >= someOtherValue()}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('greater', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 > complexCall($variable2)}
  hello
{/if}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });
              });
            });
          });
        });

        describe('with else branch', () => {
          const source = `
{namespace Something}

{template .tpl}
<div>
{if $variable1 and $variable2}
  hello
{else}
  goodbye
{/if}
</div>
{/template}
              `;

          it('is parsed correctly', () => {});
        });
      });

      describe('for expression', () => {
        describe('iterating over', () => {
          describe('variable value', () => {
            const source = `
{namespace Something}

{template .tpl}
<div>
{for $it in $list}
  hello-{$it}
{/for}
</div>
{/template}
              `;

            it('is parsed correctly', () => {});
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
<div>
{for $it in getList()}
  hello-{$it}
{/for}
</div>
{/template}
              `;

            it('is parsed correctly', () => {});
          });

          describe('static value', () => {
            describe('list', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{for $it in [1,2,5,7]}
  hello-{$it}
{/for}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('map', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{for $it in ["key1": "value1", "key2": "value2"]}
  hello-{$it}
{/for}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
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
<div>
{foreach $it in $list}
  hello-{$it}
{/foreach}
</div>
{/template}
              `;

            it('is parsed correctly', () => {});
          });

          describe('function call result', () => {
            const source = `
{namespace Something}

{template .tpl}
<div>
{foreach $it in getList()}
  hello-{$it}
{/foreach}
</div>
{/template}
              `;

            it('is parsed correctly', () => {});
          });

          describe('static value', () => {
            describe('list', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{foreach $it in ['moo', 'foo', 'bar']}
  hello-{$it}
{/foreach}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('map', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{foreach $it in ['moo': -3.14, 'foo': 2.22]}
  hello-{$it}
{/foreach}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });
          });
        });

        describe('with ifempty section', () => {
          const source = `
{namespace Something}

{template .tpl}
<div>
{foreach $it in getList()}
  hello-{$it}
{ifempty}
  goodbye
{/foreach}
</div>
{/template}
              `;

          it('is parsed correctly', () => {});
        });
      });

      describe('function call', () => {
        describe('plain function', () => {
          describe('without parameters', () => {
            const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml()}
</div>
{/template}
              `;

            it('is parsed correctly', () => {});
          });

          describe('with parameters', () => {
            describe('variable value', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml($var1, $var2)}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('function call result', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml(getParam1(), getParam2())}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('static value', () => {
              describe('number', () => {
                describe('integer', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml(1, 42, -7)}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml(3.14, -2.22)}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('string', () => {
                describe('single-quoted', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml('some', 'string')}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('double-quoted', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml("other", "string")}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('list', () => {
                const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml([ 2, 4, 6 ])}
</div>
{/template}
              `;

                it('is parsed correctly', () => {});
              });

              describe('map', () => {
                const source = `
{namespace Something}

{template .tpl}
<div>
{getHtml([ "key1": 12, "key2": -2 ])}
</div>
{/template}
              `;

                it('is parsed correctly', () => {});
              });
            });
          });
        });

        describe('object method', () => {
          describe('without parameters', () => {
            const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml()}
</div>
{/template}
              `;

            it('is parsed correctly', () => {});
          });

          describe('with parameters', () => {
            describe('variable value', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml($x, $y, $z)}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('function call result', () => {
              const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml(otherFunc())}
</div>
{/template}
              `;

              it('is parsed correctly', () => {});
            });

            describe('static value', () => {
              describe('number', () => {
                describe('integer', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml(-14)}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('float', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml(-3.14)}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('string', () => {
                describe('single-quoted', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml('hello objects')}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });

                describe('double-quoted', () => {
                  const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml("hello objects")}
</div>
{/template}
              `;

                  it('is parsed correctly', () => {});
                });
              });

              describe('list', () => {
                const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml([ 1, 2, 3] )}
</div>
{/template}
              `;

                it('is parsed correctly', () => {});
              });

              describe('map', () => {
                const source = `
{namespace Something}

{template .tpl}
<div>
{obj1.getHtml([ "elements": $elts ])}
</div>
{/template}
              `;

                it('is parsed correctly', () => {});
              });
            });
          });
        });
      });

      describe('template call', () => {
        describe('from the same namespace', () => {
          const source = `
{namespace Something}

{template .tpl}
<div>
{call .otherTpl /}
</div>
{/template}
              `;

          it('is parsed correctly', () => {});
        });

        describe('from the different namespace', () => {
          const source = `
{namespace Something}

{template .tpl}
<div>
{call Some.Other.Namespace.otherTpl /}
</div>
{/template}
              `;

          it('is parsed correctly', () => {});
        });
      });
    });
  });
});
