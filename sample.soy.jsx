ServiceDesk.Templates.Agent.Reports.reportMainView = (
    {
        projectKey,
        projectName,
        selectedReport,
        selectedTimescale,
        canEditReports,
        isEditing,
        showHelpBubble
    }
) => <div id="sd-report-content">{(isEditing ? <div class="sdr-editing"><div class="sdr-edit-form-container js-edit-report-form">{filter1(moo())}</div></div> : null)}</div>;