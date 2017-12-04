ServiceDesk.Templates.Agent.Reports.seriesForm = (
    {
        seriesCategories,
        colors,
        series
    }
) => {
    let __attributes1 = {};
    let __attributes2 = {};
    __attributes1["value"] = seriesType.typeKey;
    __attributes1["title"] = seriesType.typeName;

    if (series && series.seriesKey == seriesType.typeKey)
        __attributes1["selected"] = "selected";

    __attributes2["id"] = "series-label";
    __attributes2["name"] = "series-label";
    __attributes2["type"] = "text";
    __attributes2["class"] = "text";

    if (series)
        __attributes2["value"] = series.label;

    return <form class="aui series-form"><div class="field-group"><label for="series-type">{getText("sd.report.series.add.seriestype.label")}</label><select id="series-type" class="hidden" name="series-type">{seriesCategories.map(seriesCategory => {
                    return (
                        <optgroup label={seriesCategory.name}>{seriesCategory.seriesTypes.map(seriesType => {
                                return <option {...__attributes1}>{seriesType.typeName}</option>;
                            })}</optgroup>
                    );
                })}</select><div class="errors s-type" /></div><div class="field-group"><label for="series-label">{getText("sd.report.series.add.label.label")}</label><input {...__attributes2} /><div class="errors s-label" /></div><div class="field-group"><label for="series-colour">{getText("sd.report.series.add.label.colour")}</label><div name="series-colour">{colors.map(color => {
                    return (
                        <div class="series-set-container"><ServiceDesk.Templates.Agent.Reports.seriesColour
                                {...{
                                    color: color.full,
                                    series: series
                                }} /><ServiceDesk.Templates.Agent.Reports.seriesColour
                                {...{
                                    color: color.half,
                                    series: series
                                }} /></div>
                    );
                })}</div><div class="errors s-colour" /></div><div id="sd-filter-panel" class="js-filter-panel sd-filter-panel" /></form>, <div class="series-errors" />;
};