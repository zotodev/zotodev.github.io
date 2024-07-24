---
title: Power of Nested Queries in Dataverse with Power Automate
---

![](/assets/images/power-of-nested-queries-in-dataverse-with-power-automate/01-cf45114e.png)

# Optimizing Dataverse Queries in Power Automate with Nested Queries

In Power Automate, querying data from Dataverse can be optimized by using nested queries with the `$expand` operator. This powerful feature allows us to retrieve related records in a single call, reducing the need for multiple actions and simplifying the workflow. Let’s explore this with an example.

## Example Scenario

Suppose we want to retrieve transaction records along with their associated currency and account details. Here’s a sample request that demonstrates the use of nested queries:

### Request JSON


```
{
    "host": "https://example.crm.dynamics.com",
    "operationId": "ListRecords",
    "connectionReferenceName": "shared_commondataserviceforapps",
    "parameters": {
        "entityName": "v01_totaltransactions",
        "$filter": "_v01_transaction_value eq '54d6b681-fc38-ef11-8409-00224805444a'",
        "$expand": "transactioncurrencyid($select=isocurrencycode,currencyname),v01_Transaction($select=v01_transactionid;$expand=v01_Account($select=v01_accountname,v01_accountid))"
    }
}
```


### Response JSON


```
{
    "body": {
        "value": [
            {
                "transactioncurrencyid": {
                    "isocurrencycode": "USD",
                    "currencyname": "USD"
                },
                "v01_Transaction": {
                    "v01_transactionid": "TXN-1000",
                    "v01_Account": {
                        "v01_accountname": "SAVINGS",
                        "v01_accountid": "SAV-122"
                    }
                }
            },
            {
                "transactioncurrencyid": {
                    "isocurrencycode": "INR",
                    "currencyname": "INR"
                },
                "v01_Transaction": {
                    "v01_transactionid": "TXN-2000",
                    "v01_Account": {
                        "v01_accountname": "CURRENT",
                        "v01_accountid": "CUR-101"
                    }
                }
            }
        ]
    }
}
```


## Explanation

1. **Single API Call:** Using the `$expand` operator, we retrieve transaction records and their related currency and account details in a single API call. This reduces the number of actions required in Power Automate.
2. **Efficient Data Retrieval:** By specifying the fields to select (`$select`), we limit the data returned to only what is needed, making the query more efficient.
3. **Handling Relationships:** The `$expand` operator allows us to handle relationships between entities seamlessly. In this example, the `transactioncurrencyid` and `v01_Transaction` relationships are expanded to include details from related entities.

## Benefits

- **Reduced Complexity:** Instead of chaining multiple actions to retrieve related data, a single call fetches all necessary information.
- **Improved Performance:** Fewer API calls mean reduced latency and faster execution of workflows.
- **Simplified Maintenance:** With less code and fewer actions, maintaining the workflow becomes easier.

## Conclusion

Using nested queries with the `$expand` operator in Dataverse actions within Power Automate significantly enhances the efficiency of data retrieval processes. It minimizes the need for multiple actions and handles relationships effectively, leading to streamlined and performant workflows.

By leveraging this feature, developers can create robust solutions that are easier to manage and scale, demonstrating the power and flexibility of Power Automate in handling complex data scenarios.
