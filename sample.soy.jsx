ServiceDesk.Project.Notifications.OutgoingEmail.Templates = (
    {
        outgoingEmailRules,
        defaultRuleUrlSuffix
    }
) => {
    if (outgoingEmailRules.length < "1") return outgoingEmailRules.map(rule => {
        return (
            <tr><td
                    class={`col-name ${(rule.enabled == "false" ? "outgoing-rule-disabled" : null)}`}><p class="col-text-content">{rule.ruleName}{(rule.enabled == "false" ? <span class="aui-lozenge aui-lozenge-subtle">{getText("sd.admin.outgoing.email.rules.table.disabled")}</span> : null)}</p></td><td
                    class={`col-name ${(rule.enabled == "false" ? "outgoing-rule-disabled" : null)}`}><p class="col-text-content">{rule.ruleDescription}</p></td><td class="col-actions"><a
                        href={`${defaultRuleUrlPrefix}/${rule.id}${defaultRuleUrlSuffix}`}
                        class="js-outgoing-email-rule-edit-link"
                        analytics-suffix={(rule.analyticsSuffix ? rule.analyticsSuffix : "custom")}>{getText("sd.common.words.edit")}</a></td></tr>
        );
    });
    else
        return <tr><td colspan="3" class="rules-not-found">{getText("sd.admin.outgoing.email.rules.not.found")}</td></tr>;

    return null;
};