ServiceDesk.Templates.Agent.Reports.Kb.hoverBox = (
    {
        formattedDateString,
        series
    }
) => [<div class="series-date"><span
        class="aui-icon aui-icon-small aui-iconfont-calendar"
        data-unicode="UTF+118">{getText("sd.project.reports.calendar")}</span><span>formattedDateString</span></div>, series.map(s => {
    return <div class={(s.highlighted ? "selected-series" : null)}><span class="series-colour-key" style={`background-color: ${s.color}`} /><span>{s.label}</span></div>;
})];

ServiceDesk.Internal.Approvals.Feature.CreateApproval.Templates.body = (
    {
        eligibleFields
    }
) => <aui.form.form
    {...{
        action: "#",
        isLongLabels: "true",

        content: <aui.dialog.dialog2Content
            {...{
                visible: "true",
                titleText: getText("sd.approval.create.title"),

                content: [(!length(eligibleFields) ? <aui.message.warning
                    {...{
                        content: getText("sd.approval.no.available.fields")
                    }} /> : null), <aui.form.fieldGroup
                    {...{
                        content: [<aui.form.label
                            {...{
                                content: getText("sd.approval.approvers.field.label"),
                                required: "true"
                            }} />, (!length(eligibleFields) ? <aui.form.select
                            {...{
                                name: "field",

                                extraAttributes: {
                                    "disabled": "disabled"
                                },

                                options: []
                            }} /> : <aui.form.select
                            {...{
                                name: "field",
                                id: "approver-field-picker",
                                extraClasses: "js-approver-field-picker",
                                options: eligibleFields
                            }} />)]
                    }} />, <aui.form.fieldset
                    {...{
                        isGroup: "true",
                        legendContent: getText("sd.approval.condition.label"),

                        content: [<div class="radio"><input
                                class="radio"
                                type="radio"
                                checked="checked"
                                name="condition"
                                value="percent"
                                id="condition-all" /><label for="condition-all">{getText("sd.approval.condition.all.label")}</label></div>, <div class="radio sd-partial-condition"><input
                                class="radio js-condition-partial"
                                type="radio"
                                name="condition"
                                value="number"
                                id="condition-partial" /><input
                                class="text js-partial-amount sd-partial-amount"
                                type="text"
                                name="partial-amount" /><label for="condition-partial">{getText("sd.approval.condition.partial.label")}</label></div>]
                    }} />],

                footerActionContent: <ServiceDesk.Templates.Shared.Form.submitButtons
                    {...{
                        submitExtraAttributes: (eligibleFields.length ? [] : {
                            "disabled": "disabled"
                        }),

                        submitExtraClasses: "aui-button-primary",
                        submitButtonLabel: getText("sd.common.words.create"),
                        alignment: "right"
                    }} />
            }} />
    }} />;