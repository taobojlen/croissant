CREATE TABLE `testRun` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`testId` integer NOT NULL,
	`branch` text NOT NULL,
	`date` integer NOT NULL,
	`passed` integer DEFAULT 0 NOT NULL,
	`failed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`testId`) REFERENCES `test`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `testRun_testId_branch_date_unique` ON `testRun` (`testId`,`branch`,`date`);--> statement-breakpoint
CREATE TABLE `test` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `test_name_unique` ON `test` (`name`);