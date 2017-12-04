ServiceDesk.Templates.Agent.Reports.Kb.hoverBox = (
    {
        formattedDateString,
        series
    }
) => [<div class="series-date"><span
        class="aui-icon aui-icon-small aui-iconfont-calendar"
        data-unicode="UTF+118">{getText("sd.project.reports.calendar")}</span><span>formattedDateString</span></div>, series.map(s => {
    return <div class={(s.highlighted ? "selected-series" : null)}><span class="series-colour-key" style={`background-color: ${s.color}`} /><span>{s.label}</span></div>;
});];