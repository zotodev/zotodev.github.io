---
title: 'Custom API Wrapper : A Single Gateway for Dataverse Custom APIs (Actions & Functions)'
---

*A production-focused design for organizations that forbid direct Dataverse Web API calls from apps. Applications call a single Java (or similar) gateway — **zap-api** — which invokes Dataverse Custom APIs (Actions and Functions) using a privileged service account.*

## 1. Problem

Power Apps code apps, React clients, and external systems often need to run server-side business operations defined as **Dataverse Custom APIs** (for example optimistic updates, filtered counts, or partner callbacks). In many enterprises:

- Browsers and apps **must not** call Dataverse (`/api/data/v9.2/...`) directly.
- Only a controlled middle tier (here: a Java service) may use the Dataverse Web API with a service account.
- You do not want a new Java controller for every Custom API you add.

You need **one allowlisted gateway** that can invoke any approved Custom API — Action or Function — with a predictable contract.

## 2. Design goals

- **Single entry** for all Custom APIs used by the app.
- **Clear split** between Actions (side effects) and Functions (read/compute).
- **Pass-through parameters** — names and shapes match Dataverse; no magic type conversion.
- **Allowlist** — unknown API names never reach Dataverse.
- **Uniform request/response** for the React (or other) client.
- **Focused** — no impersonation options, no open OData proxy, no CRUD multiplexing on this route.

## 3. Endpoint specification

Base path: `/v1/dataverse`

| Kind | Client → zap-api | Purpose |
| --- | --- | --- |
| Action | `POST /v1/dataverse/actions/{apiName}` | Mutating Custom APIs (`Is Function = No`) |
| Function | `POST /v1/dataverse/functions/{apiName}` | Non-mutating Custom APIs (`Is Function = Yes`) |

`{apiName}` is the Dataverse Custom API **Unique Name** (for example `zap_MutateWithHistory`, `zap_GetCountByStatus`). It is case-sensitive and must match Dataverse exactly, including the publisher prefix.

**Why the client always uses POST to zap-api**
One client shape: JSON body with nested or large parameters. Query strings are a poor fit for Entity-typed parameters and long payloads. The *path* (`/actions` vs `/functions`) carries the kind; the Java layer maps that to the correct Dataverse HTTP verb underneath.

## 4. Request body

Same for Actions and Functions:


```
{
  "parameters": {
    "StatusCode": 1,
    "RowVersion": "12345",
    "Event": "FormSave"
  }
}
```


| Field | Required | Description |
| --- | --- | --- |
| `parameters` | Yes (may be `{}`) | Object whose keys are **exact** Custom API request parameter names. Values are JSON types that match the parameter (string, number, boolean, object for Entity, etc.). |

No `method`, `impersonateUserId`, or free-form OData URL in the body.

## 5. Response body

**Success**


```
{
  "data": {
    "Count": 42
  }
}
```


`data` contains the Custom API response properties (flat object). If the API has no output properties, return `"data": {}` or `"data": null` consistently — pick one and stick to it (recommended: `{}`).

**Failure** (example)


```
{
  "data": null,
  "error": {
    "code": "ConcurrencyVersionMismatch",
    "message": "Record was changed by someone else. Reload and try again."
  }
}
```


Suggested HTTP statuses:

- `200` — success
- `400` — bad body, kind mismatch (Action called under `/functions`), invalid parameters
- `403` — API name not allowlisted
- `409` — concurrency / business conflict from plugin
- `502` — Dataverse upstream failure

## 6. Allowlist

Environment configuration (illustration):


```
{
  "actions": ["zap_MutateWithHistory", "zap_SiriusResponse"],
  "functions": ["zap_GetCountByStatus", "zap_GetCaseSummary"]
}
```


If `{apiName}` is not in the matching list for that path, return **403** and do not call Dataverse.

Optionally verify against Dataverse metadata: an API marked Function must only be callable under `/functions`, and Actions only under `/actions`.

## 7. How Java maps to Dataverse (GET vs POST)

The **app always POSTs to zap-api**. The Java layer chooses Dataverse’s verb from the path (and metadata):

| zap-api request | Dataverse call |
| --- | --- |
| `POST /v1/dataverse/actions/{apiName}` | `POST /api/data/v9.2/{apiName}` with JSON body = `parameters` |
| `POST /v1/dataverse/functions/{apiName}` | `GET /api/data/v9.2/{apiName}(...)` with parameters encoded for an OData function |

Pass-through rule: **do not invent types**. A GUID string stays a GUID. An Entity parameter must be supplied by the client as an Entity JSON object (including `@odata.type` when required). The gateway does not wrap a bare GUID into `Microsoft.Dynamics.CRM.*` automatically.

## 8. Worked examples

### 8.1 Action — optimistic update with history

Custom API `zap_MutateWithHistory` is an **Action** (updates a row, may write history).

**App → zap-api**


```
POST /v1/dataverse/actions/zap_MutateWithHistory
Content-Type: application/json

{
  "parameters": {
    "Target": {
      "@odata.type": "Microsoft.Dynamics.CRM.zap_case",
      "zap_caseid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "zap_name": "Acme"
    },
    "RowVersion": "12345",
    "Event": "FormSave",
    "WriteHistory": true
  }
}
```


**Java → Dataverse**


```
POST https://{org}.crm.dynamics.com/api/data/v9.2/zap_MutateWithHistory
Authorization: Bearer {service-account-token}
Content-Type: application/json

{
  "Target": {
    "@odata.type": "Microsoft.Dynamics.CRM.zap_case",
    "zap_caseid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "zap_name": "Acme"
  },
  "RowVersion": "12345",
  "Event": "FormSave",
  "WriteHistory": true
}
```


Dataverse HTTP method: **POST** (Action).

### 8.2 Function — count by status (primitive params)

Custom API `zap_GetCountByStatus` is a **Function** with an integer input and integer output.

**App → zap-api**


```
POST /v1/dataverse/functions/zap_GetCountByStatus
Content-Type: application/json

{
  "parameters": {
    "StatusCode": 1
  }
}
```


**Java → Dataverse**


```
GET https://{org}.crm.dynamics.com/api/data/v9.2/zap_GetCountByStatus(StatusCode=1)
Authorization: Bearer {service-account-token}
```


Dataverse HTTP method: **GET** (Function). Java copies each entry in `parameters` into the OData function parameter list using the types declared on the Custom API.

**zap-api → app**


```
{
  "data": {
    "Count": 42
  }
}
```


### 8.3 Function — GUID parameter (no Entity magic)

If `CaseId` is defined as **Guid** on the Custom API:

**App**


```
POST /v1/dataverse/functions/zap_GetCaseSummary

{
  "parameters": {
    "CaseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
}
```


**Java → Dataverse**


```
GET .../zap_GetCaseSummary(CaseId=3fa85f64-5717-4562-b3fc-2c963f66afa6)
```


If the parameter were an **Entity** instead, the app would send an Entity object under `parameters`; Java would forward that object. It would not convert a string GUID into `@odata.type` / `zap_caseid` on its own.

### 8.4 Rejected — wrong kind


```
POST /v1/dataverse/functions/zap_MutateWithHistory
```


`zap_MutateWithHistory` is an Action → zap-api returns **400** (kind mismatch). No Dataverse call.

### 8.5 Rejected — not allowlisted


```
POST /v1/dataverse/actions/zap_SecretInternalApi
```


Not in the actions allowlist → **403**.

## 9. Client helper (conceptual)


```
// kind is chosen by the developer to match the Custom API definition
await zapApi.dataverse.action('zap_MutateWithHistory', parameters)
await zapApi.dataverse.function('zap_GetCountByStatus', parameters)

// or
await zapApi.dataverse.invoke({ kind: 'action', apiName: 'zap_MutateWithHistory', parameters })
```


In a Power Apps code app, this helper calls your Java base URL (connector or approved HTTP path to zap-api)—never Dataverse directly.

## 10. Out of scope (keep separate)

- Table CRUD (`get` / `create` / `update` / `delete`) — use existing zap-api data routes or generated Dataverse services where policy allows; do not overload this Custom API gateway.
- Arbitrary OData URLs supplied by the client (open proxy).
- User impersonation flags on this contract.

## 11. Implementation checklist

1. Expose `POST /v1/dataverse/actions/{apiName}` and `POST /v1/dataverse/functions/{apiName}`.
2. Accept body `{ "parameters": { } }` only.
3. Allowlist by kind; reject unknown names with 403.
4. Validate Action vs Function against Dataverse metadata when possible.
5. Map Action → Dataverse **POST**; Function → Dataverse **GET**.
6. Forward parameters by name; no silent Entity wrapping.
7. Return uniform `{ "data": … }` / error payload.
8. Authenticate the caller to zap-api; Dataverse is called only with the service account.

**Takeaway:** Apps speak one language to zap-api (POST + `parameters`). The path chooses Action vs Function. Java translates that into the correct Dataverse Web API call so every Custom API in the product can share a single, allowlisted gateway.

*Labels / tags for Blogger: Power Platform, Dataverse, Custom API, API Gateway, Code Apps, Architecture*
