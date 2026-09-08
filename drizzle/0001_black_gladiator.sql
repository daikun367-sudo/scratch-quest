CREATE TABLE `chapter_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`course` text NOT NULL,
	`chapter` integer NOT NULL,
	`kind` text NOT NULL,
	`file_id` text NOT NULL,
	`visible` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `stored_files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chapter_resource_slot_unique` ON `chapter_resources` (`course`,`chapter`,`kind`);--> statement-breakpoint
CREATE TABLE `stored_files` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`original_name` text NOT NULL,
	`size` integer NOT NULL,
	`summary_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stored_files_key_unique` ON `stored_files` (`object_key`);--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`course` text NOT NULL,
	`chapter` integer,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`project_url` text DEFAULT '' NOT NULL,
	`file_id` text,
	`feedback` text DEFAULT '' NOT NULL,
	`reviewed` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`file_id`) REFERENCES `stored_files`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `submissions_student_updated` ON `submissions` (`student_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `submissions_updated` ON `submissions` (`updated_at`);