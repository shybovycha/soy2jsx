ServiceDesk.Templates.HelpBubble.bubble = (
    {
        id,
        bubbleContents,
        alignment
    }
) => (<aui.icons.icon
    {...{
        useIconFont: "true",
        size: "small",
        icon: "info",

        extraAttributes: {
            "data-aui-trigger": "",
            "aria-controls": id,
            "tabindex": "0"
        }
    }} />, <aui-inline-dialog
    id={id}
    class={`sd-help-bubble sd-help-bubble-dialog2-${alignment}`}
    alignment={`bottom ${alignment}`}>noAutoescape(bubbleContents)</aui-inline-dialog>);

ServiceDesk.Templates.HelpBubble.container = (
    {
        after
    }
) => <div class={`sd-help-bubble-container${(after ? "-after" : null)}`} />;