---
title: Power Query | A must have skill
---

# Objectives

- Learn some the basics of Power Query
- Know where your can use it
- Understand where it can be of value for your solutions

## What is Power Query

Power Query is an ETL (Extract, Transform, Load) engine. ETL is a three-staged process.

### 1. Extract

During data extraction, data is loaded in from potentially various sources. These data sources can be in different formats. The goal is to pull in all relevant data into a central location for further processing.

Power Query has [various connectors](https://learn.microsoft.com/en-us/power-query/connectors/) for the extract phase. Some examples are SharePoint, Dataverse, SQL, Excel, and OData. Note that these connectors are different to the connectors we know from Power Platform.

### 2. Transform

At this stage, the pulled data is transformed. This can be a range of different manipulations. Some basic examples are removing columns, filtering rows, and sorting. It can also do more complex transformations like merging queries, adding conditional columns, and extracting information from an object type.

This part is where Power Query really shines. Loading in data and writing it to a different source is what we know from connectors in Power Platform. Transforming the data isn't always as easy. In this challenge we will show some of the possibilities Power Query has to offer in more detail.

### 3. Load

Once the data is cleaned an in the format that the target system can handle, we can load it into the target system. The options we have are a full load, or an incremental refresh.

The target where Power Query can load data into are Azure Data Lake Storage, Dataverse, Power BI, and good-old Excel. Dataverse and Power BI are obviously part of Power Platform, but having the ability to load it into Excel also opens some possibilities as described in the intro.

## Use Power Query

Now that we know a bit on what it is an can do, let's dive into creating some Power Queries. We will start with Power Query in Excel, as this will show the Extract and Transform phases. A nice thing about using it in Excel is also that you can directly see the full output of your query, as it will create a query table in your Excel file. You will see that in a minute.

We will focus on the transform stage, as this is Power Query's unique selling point. We will load in data from Dataverse and show some of the available options for data transformation. We will start simple and move our way up.

We do need some actual data to transform. Luckily, Dataverse has the option to load in sample data. To install it to your developer environment, you can [follow the instructions](https://learn.microsoft.com/en-us/power-platform/admin/add-remove-sample-data).

![](/assets/images/power-query-a-must-have-skill/01-6e401ab0.png)

### ETL with Excel and Power Automate

1. Once the sample data has been loaded, Open an Excel workbook.
2. On the Data tab, select Get Data > From Power Platform > From Dataverse
3. Log in with your account and expand the environment where you installed the Sample data.
4. Here you will see all the Dataverse tables available. Let's start with the Contact table.
5. Once selected, you will see you have a Load and Transform Data option. Load will mean you will get all data. With transform we can adjust our query with Power Query. You should know the option we will use.

Your screen will look something like the image below. On the right you will see your queries, in the ribbon you have all the Power Query options, in the middle you will see a sample of your query, and on the right side you can see the applied steps.

![](/assets/images/power-query-a-must-have-skill/02-9d2a10ea.png)

Those applied steps show a step-by-step approach that will run on your query. Those steps might remind you of Power Automate. It actually is kind of similar. Where Power Automate has actions based on APIs that will use input and deliver an output, these steps are data transformation actions that use the previous step as an input, and deliver a new output. This way it becomes quite easy to understand what you are doing step-by-step.

If you select the Advanced Editor, you will see all the full syntax. This is written in M. For super complex actions, you might need to learn M. The good news is that in the majority of the cases you don't. The ribbon makes so many functions a click of a button. Yes it will add some syntax to the complete M function, but we don't have to look at it.

Let's start with our first manipulation. As you can see, Dataverse has a LOT of columns. We want to get rid of a few. There are two options. We can select the columns we want to remove and select the Remove Columns button, or we can select the Choose Columns button. This will show a nice dialog that has all the columns available. Here we can deselect all columns and select only the once we want to use.

Select the following columns:

- contactid
- accountid
- fistname
- middlename
- lastname
- fullname
- birthdate
- emailaddress1

Once the step is completed, your table is readable. You can check the Advanced Editor again for fun to see what happened to the syntax.

Let's say we want to see which are younger than 60 years old. We can add a custom column that we can name **YoungerThan60**. We know we will need some sort of date function, so in the column formula, you can type in date. You will see many suggestions. I found the Date.IsInPreviousNYears() function that will do the trick. It needs a date as an input. You can insert that from the available columns section. Than you will only need to specify number for the Nyears and you are ready.

> Date.IsInPreviousNYears([birthdate], 60)

 Note that a new column has been added. You can also see that your applied steps now has 4 steps, where we started with two. If you select the previous step, you can directly get a previous of the output that step will give. This is to keep track of your work. The steps are named automatically, but you can adjust it when your query steps increase.

Now that we have a boolean column, we can simply select the column to filter on TRUE. This again will add a step to your query.

This might not sound like a big deal, but this query is dynamic. If we open this query tomorrow, the list of contacts might be different. Pretty cool.

![](/assets/images/power-query-a-must-have-skill/03-54f09a37.png)

Up until now, we could have also used Power Automate to get this information out. We would need some sort of OData filtering. This is not your and/or my every day language, but with the FetchXML builder we can quite easily get this out.

Where Power Query truly has an advantage is when we want to merge tables together. Imagine we want to know for which company our under 60 group works for. With Power Automate we would need to do an apply to each, which will iterate over the whole list to search for the related account. Imagine having a giant list. that won't be nice. Another issue would be when you need to span over different tables. The combination of these two would be horrible.

So, let's see how Power Query can come to the rescue.

On the ribbon, go to the Home Tab and select New Source. Make sure to select Power Platform and Dataverse again. Now we will add the account table. Once selected, you will see a second query in your Power Query editor.

This table is humongous as well, so let's remove everything but the accountid and the name. The preview pane should show only two columns. Now go back to your contact query and select the Merge Queries option. Again a dialog will be shown, but now to merge the queries.

The top section will show your contact table. you can select the account table for the bottom section. Now you can simply select the column that should be used to map these tables. This obviously is the accountid. Note thate there are multiple Join Kind options. This is really helpful for multiple use cases. For now, you can select Left Outer. The description is quite clear. All items from the first list will be shown, and the matching items from the account table will be joined to it. This means that if no account is know, it will be empty. Your dialog should look like the image below.

![](/assets/images/power-query-a-must-have-skill/04-33620baa.png)

This will again add a step to your contact query. The column added is a table containing the information from your account table. You need to click the small icon on the column to expand that data to your table. If not you won't be able to use that data easily. You can keep the original column name as a prefix. Do this for just the name field. This will add (again) a step to your query and now will show the

![](/assets/images/power-query-a-must-have-skill/05-f6c1b307.png)

You have just created a query with Power Query that combines data from different tables. Note that we we now using Dataverse for both the tables, but you could combine data from different sources with this method. Absolutely powerful stuff.

![](/assets/images/power-query-a-must-have-skill/06-34329fc3.png)

 You can do much more with Power Query than just filtering. but the custom column shows a bit if it's capabilities. The functions available in the ribbon are quite easy to use. Merging the queries took me the longest to understand what it does, and we have included that.

Save query, load it to your worksheet and save the Excel file to a SharePoint folder.

Up until this point is what I meant with my second suggestion in the challenge header. You can combine all different data sources, add the filtering, data manipulation and query merging (data transformation) that suits your scenario, and use Power Automate to iterate over that simplified query Excel file. The big advantage is that a user that opens the Excel file instantly can review the data by refreshing the queries (Data tab > Refresh All) before putting it in the desired system using Power Automate.

This is one way to do ETL, with ET (Extract, Transform) in Excel, and L (Load) using Power Automate. If Dataverse is your target data source, you can create a Dataflow that does it all.

### ETL with Dataflow

Dataflows Use the same Power Query for ET, but the L part is a bit different. We will focus on that part for now. Open another environment and navigate to Dataflows.

Go to a different environment than the one you installed the sample data to.

- Go to Dataflows
- Create a new dataflow
- Select blank query
- Copy the M syntax from the Advanced Editor in Excel
- Create a new connection when asked
- It will show an error. This is because you are missing the account query. Copy that query from Advanced Editor too in excel and name the queries as in the Excel

You should now see the exact same table in your Dataflow query. Easy, as we are still using Power Query. Need some direct help with M? Copilot can help you out. As mentioned, we will not dive into all the options there are available in Power Query, but in the L part of Dataflow, which is loading it into a Dataverse table.

We can click next. In excel the query file would load. In Dataflow, we can specify where we want to load the data into. We want to load the under 60 group into this environment. This is still the contact table.

Note that there is an option to delete the rows that no longer exist in the query output. This wat you can automatically remove items that are not required anymore. We could use this function, as people get older and we only want people under 60 in this environment. But be careful, as this will just permanently remove records, so think twice.

The next thing you need to select is a key. In our case we are loading data from Dataverse to Dataverse, so we can use the contactid. if you are loading it from a different source, you would probably want to create a column in Dataverse that will hold the ID from the source datasource and create an [alternate key](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/define-alternate-keys-entity). This will be the field the Dataflow will check to see if an item already exists to update it, or to create a new item. If the delete option is checked, the key is the thing that is leading in this. For now we can just select ContactId.

Now we only need to map the field from our query to our target. You can do this manually, but because we use the same data structure, the names are identical, so the auto map function in the top right will help you out. You can select Do not load for the account table for now, or map it as well. The key of this part is showing this mapping functionality.

![](/assets/images/power-query-a-must-have-skill/07-2c3744d4.png)

When you click on next, your get to set your refresh settings. You have multiple options. You can select manual to actually do it manually, or refresh it with the [Dataflow connector](https://learn.microsoft.com/en-us/connectors/dataflows/) for Power Automate. You can also schedule it on a given interval (e.g. every night). Note that when you choose automatically, you can still refresh it manually. Once you publish it, it will run directly. After refreshing, check your contact table to see that you people under 60 are added to your table.

![](/assets/images/power-query-a-must-have-skill/08-2fab27e7.png)

## Additional Information

Dataflows are user based. This means that working together on them is not as easy as you would like it to be.

Dataflows are [now (sort of) supported in solutions](https://learn.microsoft.com/en-us/power-query/dataflows/dataflow-solution-awareness#known-limitations). I have tried it, but it is still not ideal. You need to reset the connections after importing the solution, you can't use environment variables, incremental refresh must be manually set after importing, and application users can't deploy dataflows (no ALM Accelerator). WE ended up putting the Dataflows in a seperate solution, and importing that managed solution manually. Better than it used to be, but still room for improvement.
