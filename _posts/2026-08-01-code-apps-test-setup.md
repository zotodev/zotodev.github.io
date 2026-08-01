---
title: Code Apps Test Setup
---

## POWER APPS CODE APPS TESTING GUIDE

## Target stack

- Power Apps Code Apps using the new npm-based Power Apps CLI
- React + TypeScript + Vite
- TanStack Router
- TanStack Query
- React Hook Form
- Generated, type-safe Power Apps models and services
- Dataverse data sources and Power Automate flows
- Microsoft authentication with MFA/2FA
- Local Play, where the Power Apps host loads localhost inside an iframe

Last verified: 1 August 2026

## 1. IMPORTANT CORRECTION

Do not design the tests around the Dataverse Web API endpoint, such as:


```
/api/data/v9.x/...
```


That was the wrong assumption for this Code Apps setup.

The runtime architecture is:


```
Your React application
        |
        v
Generated models and generated services
        |
        v
@microsoft/power-apps client library
        |
        v
Power Apps host / Power Platform connector runtime
        |
        v
Dataverse, Power Automate flow, or another configured connector
```


The Power Apps host is also responsible for the signed-in user context and app loading.

Therefore:

1. Unit and React integration tests should mock an application-owned service/gateway that wraps the generated services.

1. Real integration/end-to-end tests must open the Power Apps Local Play host URL, not localhost directly.

1. Playwright must interact with the React app inside the localhost iframe.

1. Do not assert that a specific Dataverse Web API request occurred.

1. For a Dataverse operation, assert the observable result: - success or error UI - updated table/list/form state - value still present after reload - record available after navigating away and returning

1. For a generated cloud-flow service, assert the flow result or its observable business outcome rather than a guessed HTTP endpoint.

## 2. TESTING STRATEGY

Use three practical test levels.


```
+---------------------------+-------------------------------+------------------------------------------+
| Level                     | Tool                          | Purpose                                  |
+---------------------------+-------------------------------+------------------------------------------+
| Pure logic                | Vitest                        | Schemas, mapping, calculations           |
| React integration         | Vitest + Testing Library      | Forms, visibility, router, mocked SDK    |
| Real Code Apps integration| Playwright through Local Play | Host context, generated services, MFA    |
+---------------------------+-------------------------------+------------------------------------------+
```


Recommended distribution:

- 20% pure logic tests
- 65% React integration tests
- 15% real Playwright tests

Do not make every form variation a real Power Apps E2E test. That becomes slow and fragile. Use Playwright for critical workflows and use Vitest for the many UI states.

## 3. WHAT EACH LAYER SHOULD TEST

## Vitest + React Testing Library

Test:

- fields are visible or hidden for a status/selection
- default React Hook Form values
- validation messages
- dirty-state behavior
- values survive tab switches while the form remains mounted
- submit payload passed to the application gateway
- loading, success, and error states
- TanStack Router navigation
- TanStack Query invalidation and refresh behavior
- different generated-service results by mocking your gateway

Do not require:

- Power Apps host
- Microsoft login
- Local Play iframe
- a real Dataverse environment

## Playwright through Power Apps Local Play

Test:

- the app loads inside the Power Apps host
- the authenticated user has the expected access
- generated Dataverse service calls work in the host context
- generated Power Automate flow service calls work
- saved values remain after reload/navigation
- critical multi-page workflows
- permissions and role-sensitive UI
- failures visible only in the actual Power Apps runtime

## 4. RECOMMENDED PROJECT STRUCTURE


```
src/
|-- generated/                       # Generated; never manually edit
|   |-- models/
|   `-- services/
|
|-- services/                        # Some generated flow files may be here
|-- models/                          # Some generated flow models may be here
|
|-- platform/
|   `-- power-apps/
|       |-- requestGateway.ts        # Wrap generated Dataverse service
|       `-- approvalFlowGateway.ts   # Wrap generated flow service
|
|-- app/
|   |-- AppServices.ts
|   `-- AppServicesProvider.tsx
|
|-- features/
|   `-- requests/
|       |-- api/
|       |   `-- RequestPort.ts
|       |-- components/
|       |   |-- RequestForm.tsx
|       |   `-- RequestForm.test.tsx
|       |-- hooks/
|       |   |-- useCreateRequest.ts
|       |   `-- useCreateRequest.test.tsx
|       |-- pages/
|       |   `-- RequestEditPage.tsx
|       `-- tests/
|           `-- request-route.test.tsx
|
`-- test/
    |-- setup.ts
    |-- renderApp.tsx
    |-- createTestQueryClient.ts
    |-- factories/
    `-- fakes/

e2e/
|-- auth/
|   `-- create-powerapps-profile.ts
|-- fixtures/
|   `-- powerapps.fixture.ts
|-- support/
|   |-- PowerAppsLocalApp.ts
|   `-- diagnostics.ts
|-- pages/
|   |-- RequestListPage.ts
|   `-- RequestFormPage.ts
|-- requests/
|   |-- create-request.spec.ts
|   |-- edit-request.spec.ts
|   `-- run-approval-flow.spec.ts
`-- smoke/
    `-- app-loads.spec.ts

.playwright/
`-- powerapps-profile/               # Never commit

.env.e2e.local                       # Never commit
playwright.config.ts
vitest.config.ts
```


## 5. INSTALL TEST DEPENDENCIES


```
npm install -D \
  vitest \
  jsdom \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  @playwright/test \
  dotenv \
  tsx
```


Then install the Playwright Edge/Chromium browser support if needed:


```
npx playwright install msedge
```


If the msedge channel is already available on the machine, Playwright may use the installed Edge browser without downloading it.

## 6. ENVIRONMENT FILE

Create:


```
.env.e2e.local
```


Example:


```
POWERAPPS_LOCAL_PLAY_URL=https://apps.powerapps.com/play/your-local-play-url
CODE_APP_DEV_ORIGIN=http://localhost:3000
POWERAPPS_BROWSER_CHANNEL=msedge
POWERAPPS_HEADLESS=false
```


Important:

- POWERAPPS\_LOCAL\_PLAY\_URL is the URL labelled "Local Play" after npm run dev.
- Do not use localhost:3000 as the E2E test start page.
- CODE\_APP\_DEV\_ORIGIN identifies the child iframe that contains the React app.
- Keep this file out of Git.

Add to .gitignore:


```
.env.e2e.local
.playwright/
playwright-report/
test-results/
```


## 7. PLAYWRIGHT CONFIGURATION

File: playwright.config.ts


```
import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.e2e.local" });

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",

  // A persistent Chromium/Edge profile cannot be opened safely by
  // several workers at the same time.
  workers: 1,
  fullyParallel: false,

  retries: isCI ? 1 : 0,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // This URL is only a readiness check. Tests still navigate to the
  // Power Apps Local Play host URL.
  webServer: {
    command: "npm run dev",
    url: process.env.CODE_APP_DEV_ORIGIN ?? "http://localhost:3000",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
```


Notes:

- If npm run dev automatically launches another browser window, it is harmless but

inconvenient. You may instead run npm run dev manually and let reuseExistingServer

use the existing server.

- Do not set Playwright baseURL to localhost for the real Code Apps tests.

- Keep workers set to 1 when all tests share one persistent browser profile.

## 8. ONE-TIME MANUAL MICROSOFT LOGIN WITH MFA

Use a dedicated automation profile. Do not point Playwright at your normal Edge or

Chrome user-data directory.

File: e2e/auth/create-powerapps-profile.ts


```
import { chromium } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";

dotenv.config({ path: ".env.e2e.local" });

const localPlayUrl = process.env.POWERAPPS_LOCAL_PLAY_URL;
const channel = process.env.POWERAPPS_BROWSER_CHANNEL ?? "msedge";

if (!localPlayUrl) {
  throw new Error(
    "POWERAPPS_LOCAL_PLAY_URL is missing from .env.e2e.local",
  );
}

const profilePath = path.resolve(
  ".playwright/powerapps-profile",
);

const context = await chromium.launchPersistentContext(
  profilePath,
  {
    channel,
    headless: false,
    viewport: { width: 1440, height: 1000 },
  },
);

const page = context.pages()[0] ?? (await context.newPage());

await page.goto(localPlayUrl, {
  waitUntil: "domcontentloaded",
});

console.log(`
Complete these steps in the opened Edge window:

1. Sign in using your Microsoft work account.
2. Complete MFA/2FA manually.
3. Accept "Stay signed in" if your organisation permits it.
4. Grant Local Network Access if Edge asks for it.
5. Wait until the React Code App is visible inside Power Apps.
6. Return to this terminal and press Enter.
`);

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

await terminal.question("");
terminal.close();

// Closing the persistent context writes cookies, local storage,
// IndexedDB, session information, and browser permissions to the
// dedicated profile directory.
await context.close();
```


Run once:


```
npx tsx e2e/auth/create-powerapps-profile.ts
```


What gets reused:

- Microsoft authentication cookies
- Power Apps session data
- local storage
- IndexedDB
- browser-level Local Network Access permission
- other profile-scoped site settings

MFA is not bypassed. You complete it yourself. Later tests reuse the authenticated session until Microsoft Entra ID or your organisation expires/revokes the session.

You may need to run the authentication script again when:

- the Entra session expires
- Conditional Access requires a new sign-in
- your password changes
- your organisation enforces frequent MFA
- the browser profile is deleted
- access to the Power Platform environment changes

Never commit the profile directory. It contains sensitive authenticated session data.

## 9. POWER APPS LOCAL APP HELPER

The iframe can be recreated after reload or navigation. Therefore, do not save one

Frame object forever. Reacquire the correct localhost frame whenever an action starts.

File: e2e/support/PowerAppsLocalApp.ts


```
import {
  expect,
  type Frame,
  type Page,
} from "@playwright/test";

export class PowerAppsLocalApp {
  constructor(
    private readonly hostPage: Page,
    private readonly devOrigin: string,
  ) {}

  private matchesDevFrame(frame: Frame): boolean {
    try {
      const expected = new URL(this.devOrigin);
      const actual = new URL(frame.url());

      return actual.origin === expected.origin;
    } catch {
      return false;
    }
  }

  async frame(): Promise<Frame> {
    await expect
      .poll(
        () =>
          this.hostPage
            .frames()
            .some((frame) => this.matchesDevFrame(frame)),
        {
          message:
            `Waiting for Code App iframe at ${this.devOrigin}`,
          timeout: 60_000,
        },
      )
      .toBe(true);

    const frame = this.hostPage
      .frames()
      .find((item) => this.matchesDevFrame(item));

    if (!frame) {
      throw new Error(
        `Power Apps host loaded, but no iframe matched ${this.devOrigin}`,
      );
    }

    return frame;
  }

  async waitUntilReady(
    readyTestId = "app-shell",
  ): Promise<void> {
    const frame = await this.frame();
    await expect(frame.getByTestId(readyTestId)).toBeVisible();
  }

  page(): Page {
    return this.hostPage;
  }
}
```


Add a stable element to your React app shell:


```
export function AppShell() {
  return (
    <div data-testid="app-shell">
      {/* router outlet and application layout */}
    </div>
  );
}
```


Use test IDs only for stable technical anchors where an accessible role/name is not sufficient. For normal controls, prefer getByRole and getByLabel.

## 10. CUSTOM PLAYWRIGHT FIXTURE

File: e2e/fixtures/powerapps.fixture.ts


```
import {
  chromium,
  expect,
  test as base,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

import { PowerAppsLocalApp } from
  "../support/PowerAppsLocalApp";

dotenv.config({ path: ".env.e2e.local" });

type TestFixtures = {
  powerAppsPage: Page;
  codeApp: PowerAppsLocalApp;
};

type WorkerFixtures = {
  powerAppsContext: BrowserContext;
};

export const test = base.extend<
  TestFixtures,
  WorkerFixtures
>({
  powerAppsContext: [
    async ({}, use) => {
      const channel =
        process.env.POWERAPPS_BROWSER_CHANNEL ?? "msedge";

      const headless =
        process.env.POWERAPPS_HEADLESS === "true";

      const profilePath = path.resolve(
        ".playwright/powerapps-profile",
      );

      const context =
        await chromium.launchPersistentContext(
          profilePath,
          {
            channel,
            headless,
            viewport: { width: 1440, height: 1000 },
          },
        );

      await use(context);
      await context.close();
    },
    { scope: "worker" },
  ],

  powerAppsPage: async (
    { powerAppsContext },
    use,
  ) => {
    const localPlayUrl =
      process.env.POWERAPPS_LOCAL_PLAY_URL;

    if (!localPlayUrl) {
      throw new Error(
        "POWERAPPS_LOCAL_PLAY_URL is missing",
      );
    }

    const page = await powerAppsContext.newPage();

    await page.goto(localPlayUrl, {
      waitUntil: "domcontentloaded",
    });

    await use(page);
    await page.close();
  },

  codeApp: async ({ powerAppsPage }, use) => {
    const devOrigin =
      process.env.CODE_APP_DEV_ORIGIN ??
      "http://localhost:3000";

    const codeApp = new PowerAppsLocalApp(
      powerAppsPage,
      devOrigin,
    );

    // This confirms that Microsoft authentication, the host,
    // local-network permission, and the localhost iframe all work.
    await codeApp.waitUntilReady();

    await use(codeApp);
  },
});

export { expect } from "@playwright/test";
```


## 11. PAGE OBJECTS THAT REACQUIRE THE IFRAME

File: e2e/pages/RequestFormPage.ts


```
import { expect } from "@playwright/test";
import type { PowerAppsLocalApp } from
  "../support/PowerAppsLocalApp";

export class RequestFormPage {
  constructor(
    private readonly app: PowerAppsLocalApp,
  ) {}

  async openNew(): Promise<void> {
    const frame = await this.app.frame();

    await frame
      .getByRole("link", { name: "Requests" })
      .click();

    await frame
      .getByRole("button", { name: "New request" })
      .click();

    await expect(
      frame.getByRole("heading", {
        name: "New request",
      }),
    ).toBeVisible();
  }

  async fillTitle(value: string): Promise<void> {
    const frame = await this.app.frame();
    await frame.getByLabel("Title").fill(value);
  }

  async fillDescription(value: string): Promise<void> {
    const frame = await this.app.frame();
    await frame.getByLabel("Description").fill(value);
  }

  async save(): Promise<void> {
    const frame = await this.app.frame();
    await frame
      .getByRole("button", { name: "Save" })
      .click();
  }

  async expectSaved(): Promise<void> {
    const frame = await this.app.frame();
    await expect(
      frame.getByText("Request saved"),
    ).toBeVisible();
  }

  async expectTitle(value: string): Promise<void> {
    const frame = await this.app.frame();
    await expect(frame.getByLabel("Title")).toHaveValue(
      value,
    );
  }
}
```


## 12. SMOKE TEST

File: e2e/smoke/app-loads.spec.ts


```
import {
  expect,
  test,
} from "../fixtures/powerapps.fixture";

test("loads through Power Apps Local Play", async ({
  powerAppsPage,
  codeApp,
}) => {
  const frame = await codeApp.frame();

  await expect(
    frame.getByTestId("app-shell"),
  ).toBeVisible();

  // The top-level page is the Power Apps host, not localhost.
  expect(powerAppsPage.url()).not.toContain(
    "localhost:3000",
  );
});
```


This is the first test to run after creating the profile. It verifies the complete host/iframe/authentication chain.

## 13. DATAVERSE GENERATED-SERVICE E2E TEST

Do not wait for a guessed /api/data/v9 request. Verify persistence through the UI.

File: e2e/requests/create-request.spec.ts


```
import {
  expect,
  test,
} from "../fixtures/powerapps.fixture";
import { RequestFormPage } from
  "../pages/RequestFormPage";

test("creates a request using the generated service", async ({
  powerAppsPage,
  codeApp,
}) => {
  const form = new RequestFormPage(codeApp);
  const uniqueTitle = `PW-${Date.now()}`;

  await form.openNew();
  await form.fillTitle(uniqueTitle);
  await form.fillDescription(
    "Created from Power Apps Local Play",
  );
  await form.save();
  await form.expectSaved();

  // Reloading the Power Apps host may recreate the iframe.
  // The page object reacquires it before the next assertion.
  await powerAppsPage.reload({
    waitUntil: "domcontentloaded",
  });

  await codeApp.waitUntilReady();

  const frame = await codeApp.frame();
  await frame
    .getByRole("link", { name: "Requests" })
    .click();

  await frame
    .getByRole("row", { name: new RegExp(uniqueTitle) })
    .click();

  await form.expectTitle(uniqueTitle);
});
```


This proves more than a network assertion:

- the Power Apps host was available
- the signed-in session was valid
- the generated service could execute
- the connector/runtime accepted the operation
- Dataverse persisted the record
- the app could retrieve it again

## 14. CLOUD FLOW GENERATED-SERVICE E2E TEST

Official generated flow services expose a typed Run method. The exact parameter and result types depend on the flow OpenAPI definition.

Test the business result, not an assumed HTTP endpoint.

File: e2e/requests/run-approval-flow.spec.ts


```
import {
  expect,
  test,
} from "../fixtures/powerapps.fixture";

test("runs the approval flow", async ({ codeApp }) => {
  const frame = await codeApp.frame();

  await frame
    .getByRole("link", { name: "Requests" })
    .click();

  await frame
    .getByRole("row", { name: /PW-/ })
    .first()
    .click();

  await frame
    .getByRole("button", {
      name: "Submit for approval",
    })
    .click();

  // Cloud flows can take longer than ordinary UI actions.
  await expect(
    frame.getByText("Submitted for approval"),
  ).toBeVisible({ timeout: 90_000 });

  // Stronger assertion: confirm the business state changed.
  await expect(
    frame.getByText("Pending approval"),
  ).toBeVisible({ timeout: 90_000 });
});
```


If the flow produces an ID or response value, show it in the UI and assert it. If the flow updates Dataverse, reload and assert the new Dataverse-backed status.

## 15. REACT HOOK FORM E2E TEST

Test values as a user sees them.


```
test("preserves unsaved form values across tabs", async ({
  codeApp,
}) => {
  const frame = await codeApp.frame();

  await frame
    .getByRole("button", { name: "New request" })
    .click();

  await frame.getByLabel("Title").fill("Draft value");
  await frame.getByLabel("Amount").fill("1250");

  await frame
    .getByRole("tab", { name: "Summary" })
    .click();

  await frame
    .getByRole("tab", { name: "Main" })
    .click();

  await expect(frame.getByLabel("Title")).toHaveValue(
    "Draft value",
  );

  await expect(frame.getByLabel("Amount")).toHaveValue(
    "1250",
  );
});
```


Important React Hook Form rule:

- If tab switching only hides content and keeps the form mounted, values should remain.
- If route/tab switching unmounts the form, React Hook Form state is destroyed unless

you deliberately store it in a parent provider, route context, external store,

session storage, or the backend.

The test should reflect your intended product behavior.

## 16. SERVICE WRAPPER FOR FAST VITEST TESTS

Generated files can be regenerated. Do not spread direct imports throughout the UI.

Create an application-owned port and adapter.

File: src/features/requests/api/RequestPort.ts


```
export type CreateRequestInput = {
  title: string;
  description?: string;
};

export type CreatedRequest = {
  id: string;
  title: string;
};

export interface RequestPort {
  create(
    input: CreateRequestInput,
  ): Promise<CreatedRequest>;

  get(id: string): Promise<CreatedRequest | null>;
}
```


## Production adapter using generated Dataverse service

The exact model, fields, result shape, and import path must match your generated files.

Do not manually edit those generated files.

File: src/platform/power-apps/requestGateway.ts


```
import type {
  CreateRequestInput,
  CreatedRequest,
  RequestPort,
} from "@/features/requests/api/RequestPort";

import type { Requests } from
  "@/generated/models/RequestsModel";
import { RequestsService } from
  "@/generated/services/RequestsService";

export const powerAppsRequestGateway: RequestPort = {
  async create(
    input: CreateRequestInput,
  ): Promise<CreatedRequest> {
    const record = {
      cr_title: input.title,
      cr_description: input.description,
    };

    const result = await RequestsService.create(
      record as Omit<Requests, "cr_requestid">,
    );

    if (!result.data) {
      throw new Error(
        "Generated RequestsService returned no data",
      );
    }

    return {
      id: result.data.cr_requestid,
      title: result.data.cr_title,
    };
  },

  async get(
    id: string,
  ): Promise<CreatedRequest | null> {
    const result = await RequestsService.get(id);

    if (!result.data) {
      return null;
    }

    return {
      id: result.data.cr_requestid,
      title: result.data.cr_title,
    };
  },
};
```


## Production adapter using generated flow service

File: src/platform/power-apps/approvalFlowGateway.ts


```
// Use the actual generated import path in your project.
import { ApprovalWorkflowService } from
  "@/services/ApprovalWorkflowService";

export type RunApprovalInput = {
  requestId: string;
  requester: string;
};

export async function runApprovalFlow(
  input: RunApprovalInput,
) {
  const result = await ApprovalWorkflowService.Run({
    requestId: input.requestId,
    requester: input.requester,
  });

  if (!result.success) {
    throw result.error ?? new Error("Approval flow failed");
  }

  return result.data;
}
```


The generated Run signature may differ. Open the generated service and use its exact typed input/output contract.

## 17. APP SERVICES PROVIDER

File: src/app/AppServices.ts


```
import type { RequestPort } from
  "@/features/requests/api/RequestPort";

export type AppServices = {
  requests: RequestPort;
};
```


File: src/app/AppServicesProvider.tsx


```
import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";

import type { AppServices } from "./AppServices";

const AppServicesContext =
  createContext<AppServices | null>(null);

type Props = PropsWithChildren<{
  services: AppServices;
}>;

export function AppServicesProvider({
  services,
  children,
}: Props) {
  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);

  if (!services) {
    throw new Error(
      "useAppServices must be used inside AppServicesProvider",
    );
  }

  return services;
}
```


Production bootstrap:


```
import { AppServicesProvider } from
  "@/app/AppServicesProvider";
import { powerAppsRequestGateway } from
  "@/platform/power-apps/requestGateway";

const services = {
  requests: powerAppsRequestGateway,
};

root.render(
  <AppServicesProvider services={services}>
    <RouterProvider router={router} />
  </AppServicesProvider>,
);
```


## 18. TANSTACK QUERY HOOK

File: src/features/requests/hooks/useCreateRequest.ts


```
import { useMutation } from "@tanstack/react-query";
import { useAppServices } from "@/app/AppServicesProvider";

export function useCreateRequest() {
  const { requests } = useAppServices();

  return useMutation({
    mutationFn: requests.create,
  });
}
```


The React component does not know whether the service is generated, mocked, or a fake.

That makes tests stable even when generated files are refreshed.

## 19. VITEST FORM TEST WITH MOCKED GENERATED-SERVICE ADAPTER

File: src/features/requests/components/RequestForm.test.tsx


```
import { QueryClientProvider } from
  "@tanstack/react-query";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from
  "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppServicesProvider } from
  "@/app/AppServicesProvider";
import { createTestQueryClient } from
  "@/test/createTestQueryClient";
import { RequestForm } from "./RequestForm";

describe("RequestForm", () => {
  it("submits visible RHF values to the request gateway", async () => {
    const user = userEvent.setup();

    const create = vi.fn().mockResolvedValue({
      id: "REQ-1001",
      title: "Test request",
    });

    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AppServicesProvider
          services={{
            requests: {
              create,
              get: vi.fn(),
            },
          }}
        >
          <RequestForm />
        </AppServicesProvider>
      </QueryClientProvider>,
    );

    await user.type(
      screen.getByLabelText("Title"),
      "Test request",
    );

    await user.type(
      screen.getByLabelText("Description"),
      "Created in a component test",
    );

    expect(screen.getByLabelText("Title")).toHaveValue(
      "Test request",
    );

    await user.click(
      screen.getByRole("button", { name: "Save" }),
    );

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith({
        title: "Test request",
        description: "Created in a component test",
      });
    });
  });
});
```


This test is intentionally not using the real generated service. The real generated service needs the Power Apps host/runtime context and is covered by Local Play E2E.

## 20. TEST QUERY CLIENT

File: src/test/createTestQueryClient.ts


```
import { QueryClient } from "@tanstack/react-query";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
```


Disabling retries makes failures deterministic and keeps tests fast.

## 21. DIAGNOSTICS WITHOUT ASSUMING DATAVERSE HTTP ENDPOINTS

Collect browser/runtime failures without asserting a specific Dataverse network URL.

The cleanest implementation is an automatic Playwright fixture.

Extend the fixture types in e2e/fixtures/powerapps.fixture.ts:


```
type TestFixtures = {
  powerAppsPage: Page;
  codeApp: PowerAppsLocalApp;
  runtimeDiagnostics: void;
};
```


Add this fixture inside base.extend(...):


```
runtimeDiagnostics: [
  async ({ powerAppsPage }, use, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];

    const onConsole = (message: import("@playwright/test").ConsoleMessage) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    };

    const onPageError = (error: Error) => {
      pageErrors.push(error.stack ?? error.message);
    };

    const onRequestFailed = (
      request: import("@playwright/test").Request,
    ) => {
      failedRequests.push(
        `${request.method()} ${request.url()} :: ` +
          `${request.failure()?.errorText ?? "unknown"}`,
      );
    };

    powerAppsPage.on("console", onConsole);
    powerAppsPage.on("pageerror", onPageError);
    powerAppsPage.on("requestfailed", onRequestFailed);

    await use();

    powerAppsPage.off("console", onConsole);
    powerAppsPage.off("pageerror", onPageError);
    powerAppsPage.off("requestfailed", onRequestFailed);

    await testInfo.attach("console-errors", {
      body: Buffer.from(consoleErrors.join("\n")),
      contentType: "text/plain",
    });

    await testInfo.attach("page-errors", {
      body: Buffer.from(pageErrors.join("\n")),
      contentType: "text/plain",
    });

    await testInfo.attach("failed-requests", {
      body: Buffer.from(failedRequests.join("\n")),
      contentType: "text/plain",
    });
  },
  { auto: true },
],
```


The host Page receives console, page-error, and request-failure events associated with its child frames as well. This is useful for debugging, but do not fail a test only because the Power Apps host logs an unrelated warning. Assert the expected business behavior and inspect these attachments or the Playwright trace when a test fails.

The fixture intentionally records all failed requests without assuming that generated

Dataverse or flow services use a public URL that your test should know about.

## 22. TEST DATA AND CLEANUP

Use a dedicated Power Platform test environment whenever possible.

Recommended conventions:

- Prefix records with PW- or E2E-.
- Add a unique timestamp or random suffix.
- Store the created record ID when the UI exposes it.
- Delete test records through a supported UI action after the test.
- Use try/finally for cleanup when practical.
- Never run destructive E2E tests against production.

Example:


```
const title = `E2E-${Date.now()}`;
```


For cleanup, prefer one of these:

1. Delete through the application UI.
2. Use a dedicated admin/test screen in the test environment that invokes the same generated service.
3. Run a separate solution-aware cleanup flow in the test environment.
4. Periodically remove records with the E2E- prefix.

Avoid bypassing the application with an unrelated direct Dataverse Web API client if your purpose is specifically to test the Code Apps generated-service path.

## 23. PACKAGE SCRIPTS

Add to package.json:


```
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:e2e:auth": "tsx e2e/auth/create-powerapps-profile.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```


Recommended first-time sequence:


```
npm run dev
```


Copy the Local Play URL into .env.e2e.local, then:


```
npm run test:e2e:auth
npm run test:e2e -- e2e/smoke/app-loads.spec.ts
npm run test:e2e
```


Later runs normally need only:


```
npm run test:e2e
```


## 24. HANDLING AN EXPIRED MICROSOFT SESSION

Common symptoms:

- Playwright remains on login.microsoftonline.com
- the Power Apps host loads but the localhost iframe never appears
- the app asks for MFA again
- an access-denied page is displayed

Resolution:

1. Close every Edge instance using .playwright/powerapps-profile.
2. Run:


```
npm run test:e2e:auth
```


1. Sign in and complete MFA.
2. Confirm the Local Play app renders.
3. Run the smoke test again.

Do not automate the password or MFA challenge. Manual authentication is appropriate for this local developer setup.

## 25. LOCAL NETWORK ACCESS PERMISSION

The Power Apps host is a public origin and your app is a localhost origin. Modern Edge and Chrome can require explicit Local Network Access permission.

Grant the permission in the dedicated Playwright profile during the one-time auth setup. This is another reason a persistent profile is preferable to only saving a storageState JSON file.

If the host loads but the iframe fails:

- verify localhost:3000 is running
- open the Local Play URL in the dedicated profile
- check for the Local Network Access prompt
- verify corporate browser policies do not block local-network access
- verify CODE\_APP\_DEV\_ORIGIN matches the actual Vite origin and port

## 26. PERSISTENT PROFILE VS STORAGESTATE


```
+----------------------+-----------------------------------+----------------------------------+
| Feature              | Persistent profile                | storageState JSON                |
+----------------------+-----------------------------------+----------------------------------+
| Cookies              | Yes                               | Yes                              |
| Local storage        | Yes                               | Yes                              |
| IndexedDB            | Yes                               | Supported when captured          |
| Browser permissions  | Yes                               | Not reliably complete            |
| Edge profile settings| Yes                               | No                               |
| Best for Local Play  | Yes                               | Secondary option                 |
+----------------------+-----------------------------------+----------------------------------+
```


For this local Power Apps + MFA + iframe + localhost scenario, use a persistent profile.

Constraints:

- only one browser process can use the profile directory at a time
- keep Playwright workers at 1
- do not open the same profile manually while tests run
- do not use your everyday browser profile
- do not commit the profile

## 27. TANSTACK ROUTER TESTING GUIDANCE

For React integration tests, create the router with memory history and inject a test

QueryClient and fake services.

Conceptual setup:


```
createMemoryHistory({
  initialEntries: ["/requests/new"],
});
```


Test route-level behavior such as:

- route loader renders the correct screen
- status-specific forms appear
- cancel returns to the list
- save navigates to the record route
- route params are used to retrieve a record
- query invalidation refreshes the summary tab

For Playwright, navigate using the actual UI where possible. Directly setting the child iframe URL may bypass Power Apps host initialization and should not be the default.

## 28. WHAT NOT TO DO

Do not:

- open localhost:3000 for tests that need generated Power Apps services
- expect generated services to work in a plain unauthenticated browser tab
- depend on a /api/data/v9.x request URL
- automate your MFA code
- reuse your everyday Chrome/Edge profile
- commit the persistent profile
- run several workers against one persistent profile
- edit generated model/service files manually
- make every form state a slow E2E test
- use E2E tests against production records
- keep a stale Frame object after host reloads

## 29. FINAL RECOMMENDED WORKFLOW

During normal development:

1. Run fast Vitest tests continuously.
2. Mock your application-owned ports/gateways.
3. Test all RHF conditions, validation, and payload mapping in Vitest.

Before merging an important workflow:

1. Start npm run dev.
2. Run Playwright against the Local Play host URL.
3. Use the persistent authenticated Edge profile.
4. Locate and interact with the localhost iframe.
5. Test the real generated Dataverse/flow service path.
6. Confirm persisted business outcomes after reload/navigation.
7. Review Playwright trace on failure.

This produces a maintainable test suite without incorrectly treating Code Apps as a normal SPA that directly calls the Dataverse Web API.

## 30. VERIFIED PRIMARY SOURCES

Microsoft Learn - Code apps architecture https://learn.microsoft.com/en-us/power-apps/developer/code-apps/architecture

Key point: Code Apps runtime consists of your code, the Power Apps client library, generated models/services, and the Power Apps host. Generated services perform data requests through Power Platform connectors; the host manages authentication and app loading.

Microsoft Learn - Connect your code app to Dataverse https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse

Key point: Adding Dataverse generates model and service files with create, get, getAll, update, and delete methods.

Microsoft Learn - Add Power Automate flows to a code app https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/add-flows

Key point: The npm CLI generates strongly typed flow models/services. Generated flow services expose a typed static Run method whose exact signature comes from the flow's

OpenAPI definition.

Microsoft Learn - Quickstart with npm CLI https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/npm-quickstart

Key point: npm run dev provides a Local Play URL, and it must be opened in the same browser profile as the Power Platform tenant. Local-network permission may be needed.

Playwright - BrowserType.launchPersistentContext https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context

Key point: a persistent user-data directory retains browser session data. Multiple browser instances cannot use the same directory simultaneously, and the normal browser profile should not be automated.

Playwright - Authentication https://playwright.dev/docs/auth

Key point: authenticated state can be reused until it expires and should be kept out of source control.

Microsoft PowerAppsCodeApps repository https://github.com/microsoft/PowerAppsCodeApps

Key point: official Code Apps templates and samples use React/TypeScript/Vite and the repository includes Playwright tests for templates. Those template tests target plain preview builds; your generated-service Local Play tests additionally require the Power

Apps host and authenticated iframe setup described in this guide.
