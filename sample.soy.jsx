ServiceDesk.Templates.Agent.Reports.Kb = (
    {
        selectedTimescale,
        timescales
    }
) => {
    let __attributes1 = {};
    let __attributes2 = {};
    __attributes1["value"] = timescale.id;

    if (selectedTimescale.id == timescale.id)
        __attributes1["selected"] = true;

    __attributes2["class"] = "aui sd-report-timescales";

    if (moo > 2)
        __attributes2["foo"] = "12";

    return <form {...__attributes2}><select class="hidden js-timescales" id="report-timescales">{timescales.map(timescale => {
                return <option {...__attributes1}>{timescale.name}</option>;
            })}</select></form>, <div class="sd-custom-date-range-container" />;
};