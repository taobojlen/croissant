import { database } from "~/database/context";
import { Route } from "../../api/v1/+types/results";
import { testRuns, tests } from "~/database/schema";
import { sql } from "drizzle-orm";

interface Content {
  branch: string;
  passed: [string];
  failed: [string];
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const db = database();
  const content = (await request.json()) as Content;

  // First save all tests
  const allTests = new Set<{ name: string }>();
  content.passed.forEach((test) => allTests.add({ name: test }));
  content.failed.forEach((test) => allTests.add({ name: test }));
  if (allTests.size === 0) {
    return jsonResponse({ error: "No tests provided" }, 422);
  }
  await db.insert(tests).values(Array.from(allTests)).onConflictDoNothing();
  // Get PKs of all tests
  const testIds = (
    await db.query.tests
      .findMany({ columns: { id: true, name: true } })
      .execute()
  ).reduce((acc: Record<string, number>, test) => {
    acc[test.name] = test.id;
    return acc;
  }, {});

  const passedTests = content.passed.map((test) => ({
    testId: testIds[test],
    branch: content.branch,
    passed: 1,
    failed: 0,
  }));
  const failedTests = content.failed.map((test) => ({
    testId: testIds[test],
    branch: content.branch,
    passed: 0,
    failed: 1,
  }));
  if (passedTests.length > 0) {
    await db
      .insert(testRuns)
      .values(passedTests)
      .onConflictDoUpdate({
        target: [testRuns.testId, testRuns.branch, testRuns.date],
        set: {
          passed: sql.raw(`${testRuns.passed.name} + 1`),
        },
      });
  }
  if (failedTests.length > 0) {
    await db
      .insert(testRuns)
      .values(failedTests)
      .onConflictDoUpdate({
        target: [testRuns.testId, testRuns.branch, testRuns.date],
        set: {
          failed: sql.raw(`${testRuns.failed.name} + 1`),
        },
      });
  }

  return jsonResponse({
    success: true,
    passed: passedTests.length,
    failed: failedTests.length,
  });
}
