---
title: Filter a Lookup field in Dynamics 365
---

## Power Platform Tip: Filtering Lookup Fields Made Easy

Have you ever needed to filter a Lookup field in Power Platform to ensure users see only the most relevant records? Here is a straightforward method to achieve this.

### The Scenario

Consider a situation where you need the Contact lookup on a custom form to display only Contacts related to a specific Account, Role, or Status.

### The Solution

You can apply a custom filter dynamically by utilizing JavaScript and the `addPreSearch()` method directly on your form.

> **Note:** You can also dynamically pass GUIDs, roles, or custom attributes to adapt to your specific business logic.


```
function filterContacts(executionContext) {
    var formContext = executionContext.getFormContext();

    formContext.getControl("your_lookup_field").addPreSearch(function() {
        formContext.getControl("your_lookup_field").addCustomFilter(
            `<filter type='and'>
                <condition attribute='statuscode' operator='eq' value='1' />
            </filter>`,
            "contact"
        );
    });
}
```
