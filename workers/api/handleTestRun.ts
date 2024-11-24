import { sql } from "drizzle-orm";
import { error } from "itty-router";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { tests, testRuns } from "~/database/schema";
import * as schema from "~/database/schema";

interface Content {
  branch: string;
  passed: [string];
  failed: [string];
}

export async function handleTestRun(
  content: Content,
  db: DrizzleD1Database<typeof schema>,
) {
  // First save all tests
  const allTests = new Set<{ name: string }>();
  content.passed.forEach((test) => allTests.add({ name: test }));
  content.failed.forEach((test) => allTests.add({ name: test }));
  if (allTests.size === 0) {
    return error(422, "No tests provided");
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
  return {
    success: true,
    passed: passedTests.length,
    failed: failedTests.length,
  };
}
