ServiceDesk.Templates.Components.Participants = (
    {
        displayedUsers,
        totalUsers,
        expanded,
        hasToggle
    }
) => {
    if (length(displayedUsers)) return <ServiceDesk.Templates.Components.Participants.participantList
        {...{
            users: displayedUsers
        }} />, (hasToggle ? (expanded ? <aui.buttons.button
        {...{
            extraClasses: "js-contract",
            type: "link",
            text: getText("sd.request.participants.contract")
        }} /> : <aui.buttons.button
        {...{
            extraClasses: "js-expand",
            type: "link",
            text: getText("sd.request.participants.expand", totalUsers)
        }} />) : null);

    return null;
};

ServiceDesk.Templates.Components.Participants = (
    {
        users
    }
) => <ul class="sd-participant-list">{users.map(user => {
        return (
            <li class="sd-participant" data-key={user.key}><ServiceDesk.Templates.Shared.Utils.userHover
                    {...{
                        displayName: user.displayName,
                        name: user.name,
                        avatarUrl: user.avatarUrls["24x24"],
                        avatarSize: "small"
                    }} /></li>
        );
    })}</ul>;

ServiceDesk.Templates.Components.Participants = (
    {
        icon,
        label,
        value
    }
) => <li class="sd-participant-lozenge" title={label}><ServiceDesk.Templates.Shared.Utils.user
        {...{
            displayName: label,
            name: value,
            avatarUrl: icon,
            avatarSize: "small"
        }} /><button
        type="button"
        class="js-remove aui-icon aui-icon-small aui-iconfont-delete"
        tabindex="-1" /></li>;

ServiceDesk.Templates.Components.Participants = ({}) => <div class="sd-limit-exceeded">{getText("sd.request.participants.matches.exceeded")}</div>;