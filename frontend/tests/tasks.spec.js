import { test, expect } from "@playwright/test";

async function choose(page, name, option) {
  await page.getByLabel(name, { exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

test.beforeEach(async ({ page, request }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("taskly-name")) {
      localStorage.setItem("taskly-name", "Alex Morgan");
    }
  });
  const response = await request.get("/api/tasks");
  for (const task of await response.json())
    await request.delete(`/api/tasks/${task.id}`);
});

test("real API lifecycle, validation, details, statistics, confirmation and empty state", async ({
  page,
}) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "No tasks yet" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create task", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(page.getByText("Give your task a title.")).toBeVisible();
  await expect(
    page.getByText("Add a description for your task."),
  ).toBeVisible();
  await page.getByLabel("Task title").fill("Review the dashboard layout");
  await page
    .getByLabel("Description", { exact: false })
    .fill("Check desktop and mobile layouts with the live API.");
  await choose(page, "Priority", "High");
  await page.getByLabel("Due date", { exact: false }).fill("2026-10-28");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Task created successfully.")).toBeVisible();
  await expect(page.getByText("0 of 1 tasks completed (0%).")).toBeVisible();
  await page
    .getByRole("button", { name: /Review the dashboard layout Check/ })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Task ID", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText("Oct 28, 2026", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit task", exact: true }).click();
  await expect(page.getByLabel("Task title")).toHaveValue(
    "Review the dashboard layout",
  );
  await page.getByLabel("Task title").fill("Dashboard reviewed");
  await choose(page, "Status", "Completed");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("All tasks completed")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await page
    .getByRole("button", { name: "Delete Dashboard reviewed", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep task" }).click();
  await expect(
    page.getByRole("button", {
      name: "Delete Dashboard reviewed",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Dashboard reviewed", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No tasks yet" }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test("search, filters, sorting, pagination and completed navigation", async ({
  page,
  request,
}) => {
  for (let i = 1; i <= 8; i++)
    await request.post("/api/tasks", {
      data: {
        title: `Task ${i}`,
        description: `Description ${i}`,
        status: i % 2 ? "pending" : "completed",
        priority: i === 1 ? "high" : "low",
        dueDate: `2026-11-0${i}`,
      },
    });
  await page.goto("/");
  await expect(page.getByText("Showing 1–6 of 8 tasks")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Showing 7–8 of 8 tasks")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search tasks" })
    .fill("Description 1");
  await expect(page.getByText("Showing 1–1 of 1 tasks")).toBeVisible();
  await page.getByRole("textbox", { name: "Search tasks" }).fill("");
  await choose(page, "Filter by priority", "High");
  await expect(page.getByText("Showing 1–1 of 1 tasks")).toBeVisible();
  await choose(page, "Filter by priority", "All priorities");
  await choose(page, "Sort tasks", "Due soonest");
  await expect(page.locator("tbody tr").first()).toContainText("Task 1");
  await page.getByRole("button", { name: "Pending", exact: true }).click();
  await expect(page.getByText("Showing 1–4 of 4 tasks")).toBeVisible();
  await page.getByRole("link", { name: /Completed/ }).click();
  await expect(page).toHaveURL(/completed/);
  await expect(page.getByText("Showing 1–4 of 4 tasks")).toBeVisible();
  await expect(page.locator("tbody tr").first()).toContainText("Completed");
});

test("status, priority, and sort apply together", async ({ page, request }) => {
  await request.post("/api/tasks", {
    data: {
      title: "Older high pending",
      description: "Created first",
      status: "pending",
      priority: "high",
    },
  });
  await request.post("/api/tasks", {
    data: {
      title: "Pending low task",
      description: "Different priority",
      status: "pending",
      priority: "low",
    },
  });
  await request.post("/api/tasks", {
    data: {
      title: "Completed high task",
      description: "Already done",
      status: "completed",
      priority: "high",
    },
  });
  await request.post("/api/tasks", {
    data: {
      title: "Newer high pending",
      description: "Created last",
      status: "pending",
      priority: "high",
    },
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Pending", exact: true }).click();
  await choose(page, "Filter by priority", "High");
  await choose(page, "Sort tasks", "Newest first");
  await expect(
    page.getByText("Pending · High priority · Newest first"),
  ).toBeVisible();
  const rows = page.locator("tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("Newer high pending");
  await expect(rows.nth(0)).toContainText("Pending");
  await expect(rows.nth(0)).toContainText(/high/i);
  await expect(rows.nth(1)).toContainText("Older high pending");
  await expect(
    page.getByRole("button", { name: "Pending low task" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Completed high task" }),
  ).toHaveCount(0);
  await choose(page, "Sort tasks", "Oldest first");
  await expect(rows.nth(0)).toContainText("Older high pending");
  await expect(rows.nth(1)).toContainText("Newer high pending");
});

test("network failure and retry", async ({ page }) => {
  await page.route("**/api/tasks", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByText("Connection issue")).toBeVisible();
  await page.unroute("**/api/tasks");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "No tasks yet" }),
  ).toBeVisible();
});

test("mobile layout and task workflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Create your first task" }).click();
  await page.getByLabel("Task title").fill("Mobile task");
  await page
    .getByLabel("Description", { exact: false })
    .fill("Created on a small screen.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(page.locator(".mobile-task")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Mobile task", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByText("Created on a small screen.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "Delete Mobile task", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No tasks yet" }),
  ).toBeVisible();
});

test("editing every field, clearing due date, and fetching full details", async ({
  page,
  request,
}) => {
  const response = await request.post("/api/tasks", {
    data: {
      title: "Original task",
      description: "Original description",
      priority: "high",
      dueDate: "2026-10-05",
    },
  });
  const original = await response.json();
  await page.goto("/");
  await page
    .getByRole("button", { name: "Edit Original task", exact: true })
    .click();
  await page.getByLabel("Task title").fill("Updated task");
  await page
    .getByLabel("Description", { exact: false })
    .fill("The complete revised description.");
  await choose(page, "Status", "In progress");
  await choose(page, "Priority", "Low");
  await page.getByLabel("Due date", { exact: false }).fill("");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /Updated task The complete/ }).click();
  const details = page.getByRole("dialog");
  await expect(details.getByText("No due date")).toBeVisible();
  await expect(details.getByText("In progress", { exact: true })).toBeVisible();
  await expect(details.getByText("Low", { exact: true })).toBeVisible();
  const saved = await (await request.get(`/api/tasks/${original.id}`)).json();
  expect(saved).toMatchObject({
    title: "Updated task",
    description: "The complete revised description.",
    status: "in_progress",
    priority: "low",
    dueDate: null,
    createdAt: original.createdAt,
  });
  expect(saved.updatedAt > original.updatedAt).toBe(true);
});

test("failed creation and deletion preserve data and support retry", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create your first task" }).click();
  await page.getByLabel("Task title").fill("Keep my work");
  await page
    .getByLabel("Description", { exact: false })
    .fill("Do not lose this form when saving fails.");
  await page.route("**/api/tasks", (route) =>
    route.request().method() === "POST"
      ? route.fulfill({
          status: 500,
          json: { message: "Temporary server failure" },
        })
      : route.continue(),
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Temporary server failure");
  await expect(page.getByLabel("Task title")).toHaveValue("Keep my work");
  expect(await (await request.get("/api/tasks")).json()).toHaveLength(0);
  await page.unroute("**/api/tasks");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create task", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.route("**/api/tasks/*", (route) =>
    route.request().method() === "DELETE"
      ? route.fulfill({
          status: 500,
          json: { message: "Unable to delete right now" },
        })
      : route.continue(),
  );
  await page
    .getByRole("button", { name: "Delete Keep my work", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Unable to delete right now",
  );
  expect(await (await request.get("/api/tasks")).json()).toHaveLength(1);
  await page.unroute("**/api/tasks/*");
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No tasks yet" }),
  ).toBeVisible();
});

test("creating during initial loading reconciles existing tasks", async ({
  page,
  request,
}) => {
  await request.post("/api/tasks", {
    data: { title: "Existing task", description: "Already on the backend." },
  });
  let holdInitialReads = true;
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const pending = [];
  await page.route("**/api/tasks", async (route) => {
    if (route.request().method() === "GET" && holdInitialReads) {
      const work = (async () => {
        const response = await route.fetch();
        await gate;
        await route.fulfill({ response });
      })();
      pending.push(work);
      await work;
    } else await route.continue();
  });
  try {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Loading tasks" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Create task", exact: true })
      .first()
      .click();
    await page.getByLabel("Task title").fill("Created while loading");
    await page
      .getByLabel("Description", { exact: false })
      .fill("The original task must remain visible.");
    holdInitialReads = false;
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Create task", exact: true })
      .click();
    await expect(page.getByText("Showing 1–2 of 2 tasks")).toBeVisible();
    release();
    await Promise.all(pending);
    await expect(page.locator("tbody")).toContainText("Existing task");
    await expect(page.locator("tbody")).toContainText("Created while loading");
  } finally {
    release();
  }
});

test("all sort modes, clearing empty search, and deleting the last page", async ({
  page,
  request,
}) => {
  for (let i = 1; i <= 7; i++)
    await request.post("/api/tasks", {
      data: {
        title: `Item ${i}`,
        description: `Item description ${i}`,
        priority: i === 3 ? "high" : "low",
        dueDate: i === 1 ? null : `2026-11-0${i}`,
      },
    });
  await page.goto("/");
  await expect(page.locator("tbody tr").first()).toContainText("Item 7");
  await choose(page, "Sort tasks", "Oldest first");
  await expect(page.locator("tbody tr").first()).toContainText("Item 1");
  await choose(page, "Sort tasks", "Due latest");
  await expect(page.locator("tbody tr").first()).toContainText("Item 7");
  await choose(page, "Sort tasks", "Due soonest");
  await expect(page.locator("tbody tr").first()).toContainText("Item 2");
  await page.getByRole("textbox", { name: "Search tasks" }).fill("unmatched");
  await expect(page.getByText("No matching tasks")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.getByRole("textbox", { name: "Search tasks" })).toHaveValue(
    "",
  );
  await expect(page.getByText("Showing 1–6 of 7 tasks")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Showing 7–7 of 7 tasks")).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Item 1", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await expect(page.getByText("Showing 1–6 of 6 tasks")).toBeVisible();
});

test("responsive layouts, long content and keyboard dialog dismissal", async ({
  page,
  request,
}) => {
  await request.post("/api/tasks", {
    data: {
      title: "Long task title ".repeat(10),
      description: "Detailed description ".repeat(150),
    },
  });
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByText("Showing 1–1 of 1 tasks")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (width <= 700) await expect(page.locator(".mobile-task")).toBeVisible();
    else
      await expect(
        page.getByRole("columnheader", { name: "Created", exact: true }),
      ).toBeVisible();
  }
  const create = page
    .getByRole("button", { name: "Create task", exact: true })
    .first();
  await create.click();
  await expect(page.getByRole("dialog").getByLabel("Task title")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("welcome asks for a name and personalizes the workspace", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("taskly-welcome-cleared")) {
      localStorage.removeItem("taskly-name");
      sessionStorage.setItem("taskly-welcome-cleared", "1");
    }
  });
  await page.goto("/");
  const welcome = page.getByRole("dialog");
  await expect(
    welcome.getByRole("heading", { name: "Welcome to Taskly" }),
  ).toBeVisible();
  await welcome.getByRole("button", { name: "Continue" }).click();
  await expect(welcome.getByText("Enter your name to continue.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(welcome).toBeVisible();
  await welcome.getByLabel("Your name").fill("  Sam Rivera  ");
  await welcome.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Hello, Sam" })).toBeVisible();
  await expect(page.getByText("Welcome, Sam.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Hello, Sam" })).toBeVisible();
  await page
    .getByRole("button", { name: /Signed in as Sam Rivera/ })
    .first()
    .click();
  await page.getByRole("textbox", { name: "Your name" }).fill("Sam R.");
  await page.getByRole("button", { name: "Save name" }).click();
  await expect(page.getByText("Name updated.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hello, Sam" })).toBeVisible();
});

test("quick completion marks a task completed", async ({ page, request }) => {
  await request.post("/api/tasks", {
    data: {
      title: "Fix Mobile Navigation",
      description: "Resolve sidebar responsiveness",
    },
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Mark Fix Mobile Navigation as completed" })
    .click();
  await expect(page.getByText("Task marked as completed.")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Mark Fix Mobile Navigation as completed",
    }),
  ).toHaveCount(0);
  await expect(page.locator(".status-completed").first()).toBeVisible();
});

test("dark mode toggle persists across reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("button", { name: "Switch to light mode" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
