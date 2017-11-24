let __namespace__;
__namespace__ = {};

__namespace__.conversationalNotificationsContent = (
    {
        isNotificationDisabled
    }
) => {
    let linkStart = <ServiceDesk.Templates.Shared.Utils.helpLinkStart
        helpLinkKey="admin.notifications.config"
        analyticsKey="admin.notifications.config" />;

    let linkEnd = <ServiceDesk.Templates.Shared.Utils.helpLinkEnd />;

    return <h3>{getText("sd.admin.plugin.config.notifications.heading")}</h3>, <p>{getText("sd.admin.plugin.config.notifications.question")} {noAutoescape(getText(
            "sd.admin.plugin.config.notifications.description.conversational",
            linkStart,
            linkEnd
        ))}</p>, <form class="aui sd-settings-form"><div class="sd-radio-group"><div class="radio sd-radio-option"><input
                    type="radio"
                    id="notification-enabled"
                    class="radio js-notification-enabled"
                    name="sd-notification-state"></input><label for="notification-enabled">{getText("sd.admin.plugin.config.notifications.enabled")}</label></div><div class="radio sd-radio-option"><input
                    type="radio"
                    id="notification-disabled"
                    class="radio js-notification-disabled"
                    name="sd-notification-state"></input><label for="notification-disabled">{getText("sd.admin.plugin.config.notifications.disabled")}</label></div></div></form>;
};

__namespace__.customNotificationsContent = (
    {
        isNotificationDisabled
    }
) => {
    let linkStart = <ServiceDesk.Templates.Shared.Utils.helpLinkStart
        helpLinkKey="admin.notifications.config"
        analyticsKey="admin.notifications.config" />;

    let linkEnd = <ServiceDesk.Templates.Shared.Utils.helpLinkEnd />;

    return <h3>{getText("sd.admin.plugin.config.notifications.heading")}</h3>, <p>{getText("sd.admin.plugin.config.notifications.filterjira.question")} {noAutoescape(getText(
            "sd.admin.plugin.config.notifications.filterjira.description.helplink",
            linkStart,
            linkEnd
        ))}</p>, <form class="aui sd-settings-form"><div class="sd-radio-group"><div class="radio sd-radio-option"><input
                    type="radio"
                    id="notification-enabled"
                    class="radio js-notification-enabled"
                    name="sd-notification-state"></input><label for="notification-enabled">{getText("sd.admin.plugin.config.notifications.filterjira.enabled")}</label></div><div class="radio sd-radio-option"><input
                    type="radio"
                    id="notification-disabled"
                    class="radio js-notification-disabled"
                    name="sd-notification-state"></input><label for="notification-disabled">{getText("sd.admin.plugin.config.notifications.filterjira.disabled")}</label></div></div></form>;
};

__namespace__.helpCenter = (
    {
        canAgentsManageHelpCenterAnnouncement
    }
) => {
    let agentHelpCenterFeatureEnabled = isFeatureFlagEnabled("sd.customer.portal.help.center.agent.announcement");
    let customizePortalLink = "<a class=\"js-customize-portal-branding\" href=\"" + (contextPath() + "/servicedesk/customer/portals?customize=true\" target=\"_blank\">");

    return <div class="sd-plugin-config-branding"><h3>{getText("sd.admin.help.center.branding.title")}</h3><p>{(agentHelpCenterFeatureEnabled ? noAutoescape(getText(
                "sd.admin.plugin.config.help.center.and.announcement.branding.redirect",
                customizePortalLink,
                "</a>"
            )) : noAutoescape(getText(
                "sd.admin.plugin.config.help.center.branding.redirect",
                customizePortalLink,
                "</a>"
            )))}</p></div>, (agentHelpCenterFeatureEnabled ? (<p>{getText("sd.admin.plugin.config.announcement.by.agent.message")}</p>, <form class="aui sd-settings-form"><div class="sd-radio-group"><div class="radio sd-radio-option"><input
                    type="radio"
                    id="agent-announcements-enabled"
                    class="radio js-agent-announcements-enabled"
                    name="sd-agent-announcement-state"></input><label for="agent-announcements-enabled">{getText("sd.admin.plugin.config.announcement.by.agent.allowed")}</label></div><div class="radio sd-radio-option"><input
                    type="radio"
                    id="agent-announcements-disabled"
                    class="radio js-agent-announcements-disabled"
                    name="sd-agent-announcement-state"></input><label for="agent-announcements-disabled">{getText("sd.admin.plugin.config.announcement.by.agent.notallowed")}</label></div></div></form>) : null), (isFeatureFlagEnabled("sd.customer.portal.project.agent.announcement") ? <p>{getText("sd.admin.plugin.config.announcement.by.agent.portalmessage")}</p> : null);
};

__namespace__.organisationManagement = (
    {
        canAgentsManageOrganisations
    }
) => {
    return <h3>{getText("sd.admin.plugin.config.organisation.management.heading")}</h3>, <p>{getText("sd.admin.plugin.config.organisation.management.message")}</p>, <p>{getText("sd.admin.plugin.config.organisation.management.question")}</p>, <form class="aui sd-settings-form"><div class="sd-radio-group"><div class="radio sd-radio-option"><input
                    type="radio"
                    id="agent-manage-organisation-enabled"
                    class="radio js-agent-manage-organisation-enabled"
                    name="sd-manage-organisation-state"></input><label for="agent-manage-organisation-enabled">{getText("sd.admin.plugin.config.organisation.management.turn.on")}</label></div><div class="radio sd-radio-option"><input
                    type="radio"
                    id="agent-manage-organisation-disabled"
                    class="radio js-agent-manage-organisation-disabled"
                    name="sd-manage-organisation-state"></input><label for="agent-manage-organisation-disabled">{getText("sd.admin.plugin.config.organisation.management.turn.off")}</label></div></div></form>;
};

__namespace__.permissionOptionsManagement = (
    {
        shouldDismissAllPermissionWarnings
    }
) => {
    let linkStart = <ServiceDesk.Templates.Shared.Utils.helpLinkStart
        helpLinkKey="resolve.permission.scheme.errors"
        analyticsKey="admin.configurations.resolve.permission.error.misconfig" />;

    let linkEnd = <ServiceDesk.Templates.Shared.Utils.helpLinkEnd />;

    return <h3>{getText(
            "sd.agent.alert.permission.misconfig.dismiss.all.setting.management.heading"
        )}</h3>, <p>{noAutoescape(getText(
            "sd.agent.alert.permission.misconfig.dismiss.all.setting.management.message",
            linkStart,
            linkEnd
        ))}</p>, <p>{getText(
            "sd.agent.alert.permission.misconfig.dismiss.all.setting.management.question"
        )}</p>, <form class="aui sd-settings-form"><div class="sd-radio-group"><div class="radio sd-radio-option"><input
                    type="radio"
                    id="dismiss-warnings-enabled"
                    class="radio js-dismiss-warnings-enabled"
                    name="sd-dismiss-warnings-state"></input><label for="dismiss-warnings-enabled">{getText(
                        "sd.agent.alert.permission.misconfig.dismiss.all.setting.management.turn.on"
                    )}</label></div><div class="radio sd-radio-option"><input
                    type="radio"
                    id="dismiss-warnings-disabled"
                    class="radio js-dismiss-warnings-disabled"
                    name="sd-dismiss-warnings-state"></input><label for="dismiss-warnings-disabled">{getText(
                        "sd.agent.alert.permission.misconfig.dismiss.all.setting.management.turn.off"
                    )}</label></div></div></form>;
};

ServiceDesk.Templates.Admin.config = __namespace__;