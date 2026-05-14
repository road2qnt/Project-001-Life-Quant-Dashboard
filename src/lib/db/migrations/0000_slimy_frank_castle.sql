CREATE TABLE `agent_memory` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `correlations` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_a_id` text NOT NULL,
	`domain_b_id` text NOT NULL,
	`pearson_r` real,
	`lag_days` integer DEFAULT 0,
	`sample_size` integer,
	`significance` real,
	`computed_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`domain_a_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`domain_b_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_correlations_pair` ON `correlations` (`domain_a_id`,`domain_b_id`,`lag_days`);--> statement-breakpoint
CREATE TABLE `domains` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`icon` text,
	`unit` text,
	`type` text DEFAULT 'numeric' NOT NULL,
	`min_value` real DEFAULT 0,
	`max_value` real DEFAULT 10,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`archived` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`value` real NOT NULL,
	`note` text,
	`source` text DEFAULT 'manual',
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_events_domain_date` ON `events` (`domain_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `weekly_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_id` text NOT NULL,
	`week_start` text NOT NULL,
	`consistency` real,
	`total_value` real,
	`num_events` integer,
	`trend` text,
	`metadata` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_snapshots_domain_week` ON `weekly_snapshots` (`domain_id`,`week_start`);