CREATE TABLE `testRun` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`testId` integer NOT NULL,
	`date` integer NOT NULL,
	FOREIGN KEY (`testId`) REFERENCES `test`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `test` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `guestBook`;