---
title: Get File content from FileType Dataverse columns
---

![](/assets/images/get-file-content-from-filetype-dataverse-columns/01-3374952f.jpeg)

There are 2 ways to download the Files from FileType Dataverse columns.

1. Download file or image content
2. Using Unbound actions

# 1. Download file or image content

Follow these steps to add the Download a file or an image action to your flow. You can use the downloaded file contents in suitable actions later in the flow.

- Select New step to add an action to your flow.
- Enter download a file into the Search connectors and actions search box on the Choose an operation card.
- Select Microsoft Dataverse.
- Select the Download a file or an image action.

![](/assets/images/get-file-content-from-filetype-dataverse-columns/02-75f4f5e5.png)

- Select the table from which you want to download the file or image content or enter your own custom value for the table name.
- In Row ID, enter the row ID of the row in the table that you just selected.
- The list of supported file and image columns for the table you selected earlier will be populated in the Column name list.
- From Column name, select the column that holds the file or image content that you want to download

![](/assets/images/get-file-content-from-filetype-dataverse-columns/03-ab0d65a1.png)

# 2. Using Unbound actions

There are cases where on using the first method, we would be getting below error

> "Downloading in multiple chunks is not supported for the files stored in the database"

We can use below Unbound actions in together in order to download the File as a block from Dataverse
[InitializeFileBlocksDownload](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/reference/initializefileblocksdownload?view=dataverse-latest)
[DownloadBlock](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/reference/downloadblock?view=dataverse-latest)

## InitializeFileBlocksDownload

### Parameters

#### Target

**Description**: Table name with GUID

**Sample Value**: /lmn\_users(3333dde7-1271-41c1-a65a-33888cc4d6a8)

#### FileAttributeName

**Description**: File Type column Name.

**Sample Value**: lmn\_userdata

#### DataSource

**Description**: Source of the data (Relevant if stored in filestore: can be left blank)

## DownloadBlock

### Parameters

#### Offset

**Description :** The offset (in bytes) from the beginning of the block to the first byte of data in the block.
**Usage :** Initialise a integer variable with no value and use it here. (This is to dynamically set null value since the power automate considers it a mandatory value in client render.)

#### BlockLength

**Description :** The size of the block in bytes.
**Usage :** Use value from previous step output from InitializeFileBlocksDownload

#### FileContinuationToken

**Description :** A token that uniquely identifies a sequence of related data blocks.
**Usage :** Use value from previous step output from InitializeFileBlocksDownload
