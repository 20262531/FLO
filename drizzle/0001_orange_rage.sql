CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`name` text NOT NULL,
	`actor` text NOT NULL,
	`at` text NOT NULL,
	`mime` text NOT NULL
);
