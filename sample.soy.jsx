let __namespace__;
__namespace__ = {};

__namespace__.content = (
    {
        showInviteForm,
        errorContent
    }
) => (<div class="sd-invite-customer-wrapper-dialog"><div class="js-error-wrapper"></div>(showInviteForm ? (<aui.form.form
        action="#"
        isTopLabels={true}
        extraClasses="js-invite-customer sd-invite-customer"
        content=(<__namespace__.dialogContent
            errorContentHtml={errorContent.html}
            successCount={errorContent.successCount}
            failedCount={errorContent.failedCount} />, 
                        ) />, 
            ) : null)</div>, 
);

ServiceDesk.Templates.Agent.People.Customers.Pagination.InviteCustomerDialog = __namespace__;