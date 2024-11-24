import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { getTodaysTimestamp } from "../app/utils";

export const tests = sqliteTable("test", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const testRelations = relations(tests, ({ many }) => ({
  testRuns: many(testRuns),
}));

export const testRuns = sqliteTable("testRun", {
  id: integer().primaryKey({ autoIncrement: true }),
  testId: integer()
    .references(() => tests.id, { onDelete: "cascade" })
    .notNull(),
  date: integer().$default(getTodaysTimestamp).notNull(),
});

export const testRunsRelations = relations(testRuns, ({ one }) => ({
  test: one(tests, {
    fields: [testRuns.testId],
    references: [tests.id],
  }),
}));
