---
title: Open a Custom Page either in a dialog or full screen within a Model-Driven App.
---

Upon clicking a Ribbon (Command Bar) button, the objective is to open a Custom Page either in a dialog or full screen within a Model-Driven App.
🔹 \*\*Prerequisites:\*\*
1. Ensure a Custom Page is constructed and integrated into your solution.
2. Have the capability to modify the Ribbon/Command Bar using the Modern Command Designer or Ribbon Workbench.
3. Ability to include and enlist JavaScript web resources for functionality.

To achieve this, utilize the 'navigateTo()' client API in conjunction with a JavaScript web resource linked to the button. This combination enables the seamless opening of the desired Custom Page based on user interaction.

 JavaScript Code to Open a Custom Page

//CRM Crate - JavaScript Snippet.

function callMethod(executionContext) {

formContext = executionContext.getFormContext();

var recordId = formContext.data.entity.getId();

//Initiating Web Resource Parameter.

var pageInput = {

pageType: "custom", // Set pageType as "custom"

name: "cc\_assignercustompage\_96e63", // Custom Page Name

entityName: "cc\_subscriber", // Entity Name

recordId: recordId // Input Parameter For Custom Page

};

//Declaring HTML Page Dimensions.

var navigationOptions = {

target: 2,

position: 1,

height: 720,

width: 600,

title: "CRM Crate Custom Page" // Enter Title Of Your Choice

};

//Using navigateTo Client API.

Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(

function success() {

// Run code on success

formContext.data.refresh();

},

function error() {

// Handle errors

formContext.data.refresh();

}

);

}
