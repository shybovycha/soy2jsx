let __namespace__;
__namespace__ = {};

__namespace__.reportMainView = (
    {
        projectKey,
        projectName,
        selectedReport,
        selectedTimescale,
        canEditReports,
        isEditing,
        showHelpBubble
    }
) => <div id="sd-report-content">{(isEditing ? <div class="sdr-editing"><div class="sdr-edit-form-container js-edit-report-form"></div><div class="js-report-graph sd-graph-container"></div><div class="js-graph-options-container sd-graph-options-container"></div><div class="js-report-drilldown"></div></div> : <ServiceDesk.Templates.InternalApi.Panel.panel
        title={selectedReport.name}
        includeHelpBubbleContainer={showHelpBubble}
        actionsContent={<div class="sdr-actions aui-buttons">{(canEditReports && selectedReport ? <a
                href={sdProjectUrl(projectKey, "/reports/custom/" + (selectedReport.id + "/edit"))}
                class="aui-button sd-edit-reports"><span class="aui-icon aui-icon-small aui-iconfont-edit"></span>{getText("sd.common.words.edit")}</a> : null)}</div>}
        bodyContent={(<h3 class="sd-print-only sd-print-only-h2 sd-project-name">{projectName}</h3>, <h4 class="sd-print-only sd-print-only-h3 sd-timescale-name">{selectedTimescale.name}</h4>, <div class="js-report-graph sd-graph-container"></div>, <div
            class="js-graph-options-container sd-graph-options-container {if isFeatureFlagEnabled('sd.report.custom.date.range')}sd-custom-date-range-enabled{/if}"></div>, <div class="js-report-drilldown"></div>)} />)}</div>;

__namespace__.helpBubbleContents = ({}) => {
    return <h2 class="aui-nav-heading">{getText("sd.project.sidebar.reports")}</h2>, <p>{getText("sd.renaissance.page.bubble.report")}</p>, <p><ServiceDesk.Templates.Shared.Utils.helpLinkStart
            helpLinkKey="setting.up.reports"
            analyticsKey="page.view.onboarding.bubble.reports"
            newTab={true} />{getText("sd.renaissance.page.bubble.report.doc.link")}<ServiceDesk.Templates.Shared.Utils.helpLinkEnd /></p>;
};

__namespace__.editReportForm = (
    {
        selectedReport
    }
) => <form class="aui top-label sdr-edit-form">{(selectedReport.isNew ? <h2>{getText("sd.report.new")}</h2> : null)}{let targetValue = (selectedReport.target && selectedReport.target > 0 ? selectedReport.target : "80\n        ");}<div class="field-group"><label for="report-name">{getText("sd.report.field.name")}</label><input
            class="text js-name-field"
            type="text"
            id="report-name"
            name="name"
            value={selectedReport.name} /><span class="report-name-errors"></span></div><div class="js-sd-graph-summary-container sd-graph-summary-container"></div><div class="buttons-container"><div class="buttons"><span class="sd-report-actions"><button class="aui-button sd-new-series js-new-series" type="button"><span class="aui-icon aui-icon-small aui-iconfont-add" data-unicode="UTF+E002">{"Add"}</span>{getText("sd.report.series.add.button.text")}</button><span class="sd-target-fields"><input
                        id="sd-report-target-checkbox"
                        class="checkbox"
                        type="checkbox"
                        value="hasTarget" />{getText("sd.report.target.label")}<input
                        id="sd-report-target"
                        class="text"
                        name="target"
                        value={targetValue}
                        type="number"
                        min="0"
                        max="100" />{"%\n                "}</span></span><span class="sd-form-actions"><button type="submit" class="aui-button aui-button-primary" id="d-save-btn1">{(selectedReport.isNew ? getText("sd.common.words.create") : getText("sd.common.words.save"))}</button><a
                    class="cancel js-cancel"
                    data-replace-state="true"
                    href={(selectedReport.isNew ? href : selectedReport.href)}>{getText("sd.common.words.cancel")}</a><span class="sd-progress"></span></span></div></div></form>;

__namespace__.editStatistic = (
    {
        index,
        statistic,
        color,
        label
    }
) => <div class="sdr-statistic-container sdr-edit-container"><div class="sdr-statistic" style="color: {$color};">{statistic.value}{(statistic.units ? <span class="sdr-units">{statistic.units}</span> : null)}</div><div class="sdr-reporttype">{label}</div><span class="sdr-series-ops"><a
            href="#"
            class="sdr-edit-series-link js-edit-series"
            data-series-index={index}>{getText("sd.common.words.edit")}</a><a
            href="#"
            class="sdr-delete-series-link js-delete-series"
            data-series-index={index}>{getText("sd.common.words.remove")}</a></span></div>;

__namespace__.seriesFormContainer = ({}) => <div class="series-form-container"></div>;

__namespace__.seriesForm = (
    {
        seriesCategories,
        colors,
        series
    }
) => {
    return <form class="aui series-form"><div class="field-group"><label for="series-type">{getText("sd.report.series.add.seriestype.label")}</label><select id="series-type" class="hidden" name="series-type">{seriesCategories.map(
                    seriesCategory => <optgroup label={seriesCategory.name}>{seriesCategory.seriesTypes.map(
                            seriesType => <option value={seriesType.typeKey} title={seriesType.typeName}>{seriesType.typeName}</option>
                        )}</optgroup>
                )}</select><div class="errors s-type"></div></div><div class="field-group"><label for="series-label">{getText("sd.report.series.add.label.label")}</label><input id="series-label" name="series-label" type="text" class="text" /><div class="errors s-label"></div></div><div class="field-group"><label for="series-colour">{getText("sd.report.series.add.label.colour")}</label><div name="series-colour">{colors.map(
                    color => <div class="series-set-container"><__namespace__.seriesColour color={color.full} series={series} /><__namespace__.seriesColour color={color.half} series={series} /></div>
                )}</div><div class="errors s-colour"></div></div><div id="sd-filter-panel" class="js-filter-panel sd-filter-panel"></div></form>, <div class="series-errors"></div>;
};

__namespace__.seriesFilter = (
    {
        canFilterByGoal,
        goals,
        selectedGoalId,
        jql
    }
) => <div class="field-group"><label for="sd-series-filter-radio-group">{getText("sd.report.series.filter.label")}</label>{(canFilterByGoal && length(goals) > 0 ? <div
        class="radio sd-series-filter-radio-group"
        id="sd-series-filter-radio-group"><label for="sd-series-filter-jql" class="sd-series-filter-option-label">{getText("sd.report.series.add.label.specific.issues")}</label><input
            name="sd-series-filter-radio"
            value="filter-by-jql"
            id="sd-series-filter-jql"
            class="radio js-series-filter-option js-filter-by-jql"
            type="radio" /><div class="sd-radio-option-container"><div id="series-jql" name="series-jql" data-value={jql}></div><div class="errors s-jql"></div></div><label for="sd-series-filter-goal" class="sd-series-filter-option-label">{getText("sd.report.series.add.label.goal")}</label><input
            name="sd-series-filter-radio"
            value="filter-by-goal"
            id="sd-series-filter-goal"
            class="radio js-series-filter-option js-filter-by-goal"
            type="radio" /><div class="sd-radio-option-container"><select id="series-goal" class="hidden" name="series-goal">{goals.map(
                    goal => <option value={goal.id}>{goal.displayName}{"({$goal.calendarName})"}</option>
                )}</select><div class="errors s-goal"></div></div></div> : (<div id="series-jql" name="series-jql" data-value={jql}></div>, <div class="errors s-jql"></div>))}</div>;

__namespace__.seriesColour = (
    {
        color,
        series
    }
) => <div
    class="series-colour {if $series and $color == $series.color}colour-selected{/if}"
    style="background-color:{$color}"
    data-value={color}></div>;

__namespace__.error = (
    {
        errors
    }
) => {
    return errors.map(
        error => <div class="aui-message error shadowed"><p class="title">{getText("sd.form.error.header")}</p><span class="aui-icon icon-error"></span><p>{error.errorMessage}</p></div>
    );
};

__namespace__.inlineError = (
    {
        errors
    }
) => {
    return errors.map(error => <div class="error">{error.errorMessage}</div>);
};

__namespace__.deleteSeriesConfirmation = ({}) => {
    return <h2 class="dialog-title">{getText("sd.report.series.remove.confirm.title")}</h2>, <form class="aui" action="#" method="post"><div class="form-body"><p>{getText("sd.report.series.remove.confirm.body")}</p></div><div class="form-footer buttons-container"><div class="buttons"><input
                    type="button"
                    class="aui-button aui-button-primary sd-confirm-series-remove"
                    value={``} /><a href="#" class="cancel">{getText("sd.common.words.cancel")}</a></div></div></form>;
};

__namespace__.viewIssue = ({}) => <div id="issue-container"></div>;

__namespace__.issueError = ({}) => {
    return <h2 class="dialog-title">{getText("sd.project.reports.issue.error.title")}</h2>, <form class="aui" action="#" method="post"><div class="form-body"><div class="aui-message error"><span class="aui-icon icon-error"></span><p>{getText("sd.project.reports.issue.error.desc")}</p></div></div><div class="form-footer buttons-container"><div class="buttons"><button type="button" class="aui-button cancel">{getText("sd.common.words.acknowledge")}</button></div></div></form>;
};

__namespace__.customDateRange = (
    {
        minDate,
        fromDate
    }
) => <form class="aui"><div class="sd-custom-date-range-date-field-group"><label for="sd-custom-date-range-from">{getText("sd.project.reports.customdate.from")}</label><input
            id="sd-custom-date-range-from"
            class="aui-date-picker text"
            type="date"
            value={``}
            min={``}
            max={``} /><span class="aui-icon aui-icon-small aui-iconfont-calendar"></span></div><div class="sd-custom-date-range-date-field-group"><label id="sd-custom-date-range-to-label" for="sd-custom-date-range-to">{getText("sd.project.reports.customdate.to")}</label><input
            id="sd-custom-date-range-to"
            class="aui-date-picker text"
            type="date"
            value={``}
            min={``}
            max={``} /><span class="aui-icon aui-icon-small aui-iconfont-calendar"></span></div><div
        class="sd-custom-date-range-split-field-group js-custom-date-range-split-field-group"></div><button
        id="sd-custom-date-range-update-button"
        class="aui-button aui-button-primary"
        aria-disabled="true">{getText("sd.common.words.update")}</button></form>;

__namespace__.splitBySelector = (
    {
        options
    }
) => {
    return <label
        id="sd-custom-date-range-split-by-label"
        for="sd-custom-date-range-split-by">{getText("sd.project.reports.customdate.splitby")}</label>, <select
        id="sd-custom-date-range-split-by"
        name="sd-custom-date-range-split-by"
        class="select">{options.map(option => <option value={option.name}>{option.name}</option>)}</select>;
};

ServiceDesk.Templates.Agent.Reports = __namespace__;