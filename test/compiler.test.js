const { compileCode } = require('../src/compiler');

describe('#compileCode', () => {
  describe('for simple SOY templates', () => {
    it('does not fail', () => {
      const template = `
{namespace ServiceDesk.Internal.VariableSubstitution.Feature.Variables.Status.Formatted}

/**
 * Renders the content section of a batched notification in html
 * @param authorName the author of the comment
 * @param authorDate the time of the comment creation
 * @param status the translated status to render
 * @param isResolved true, if the issue is resolved
 */
{template .html}
    <b>{$authorName}</b> <span class="formatted-variable-label-color">{getText('sd.notifications.rendering.status.formatted.label')}</span>
    {sp}<span class="aui-lozenge aui-lozenge-{if not $isResolved}current{else}success{/if}">{$status}</span>
    <br><span class="formatted-variable-time-color">{$authorDate}</span>
{/template}
      `;

      expect.assertions(0);
      compileCode(template).catch(e => expect(e).toBeFalsy());
    });
  });
});
