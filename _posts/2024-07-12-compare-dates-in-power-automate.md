---
title: Compare dates in Power Automate
---

In Power Automate, datetime values are represented as string timestamps in ISO format. While the sortable format allows for value comparisons, input parameters often come as dates without time parts, leading to potential mismatches, such as missing a birthday when compared to `utcNow()`.

Datetime values include both time and timezone indicators, complicating comparisons. Today in one timezone can be yesterday or tomorrow in another, with time differences reaching up to 25 hours. Comparing dates without considering seconds is often more practical.

To simplify, follow these rules:

1. Align timestamps to the same timezone.
2. Extract and compare only the date portion.

The following functions are essential for managing date and time in Power Automate:

| Function | Description | Example |
| --- | --- | --- |
| formatDateTime(date, 'yyyy-MM-dd') | Extracts the date portion. | formatDateTime(utcNow(), 'yyyy-MM-dd') |
| substring(datetime, 0, 10) | Extracts the date portion. | substring(utcNow(), 0, 10) |
| convertFromUtc(datetime, 'India Standard Time', 'yyyy-MM-dd') | Converts UTC datetime to a specific timezone and extracts the date. | convertFromUtc(utcNow(), 'India Standard Time', 'yyyy-MM-dd') |
| convertTimeZone(datetime, 'UTC-11', 'India Standard Time', 'yyyy-MM-dd') | Converts datetime between timezones and extracts the date. | convertTimeZone(utcNow(), 'UTC-11', 'India Standard Time', 'yyyy-MM-dd') |

Handling timezones can be complex. For a comprehensive list, refer to the [Default Time Zones | Microsoft Learn](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones).

By using these functions, you can manage date and time more effectively in Power Automate, ensuring accurate and consistent comparisons across different timezones.

![](/assets/images/compare-dates-in-power-automate/01-aa72ea0c.png)
