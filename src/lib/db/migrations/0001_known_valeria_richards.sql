PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agent_memory` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_agent_memory`("id", "type", "content", "metadata", "created_at") SELECT "id", "type", "content", "metadata", "created_at" FROM `agent_memory`;--> statement-breakpoint
DROP TABLE `agent_memory`;--> statement-breakpoint
ALTER TABLE `__new_agent_memory` RENAME TO `agent_memory`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_config`("key", "value", "updated_at") SELECT "key", "value", "updated_at" FROM `config`;--> statement-breakpoint
DROP TABLE `config`;--> statement-breakpoint
ALTER TABLE `__new_config` RENAME TO `config`;--> statement-breakpoint
CREATE TABLE `__new_correlations` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_a_id` text NOT NULL,
	`domain_b_id` text NOT NULL,
	`pearson_r` real,
	`lag_days` integer DEFAULT 0,
	`sample_size` integer,
	`significance` real,
	`computed_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`domain_a_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`domain_b_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_correlations`("id", "domain_a_id", "domain_b_id", "pearson_r", "lag_days", "sample_size", "significance", "computed_at") SELECT "id", "domain_a_id", "domain_b_id", "pearson_r", "lag_days", "sample_size", "significance", "computed_at" FROM `correlations`;--> statement-breakpoint
DROP TABLE `correlations`;--> statement-breakpoint
ALTER TABLE `__new_correlations` RENAME TO `correlations`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_correlations_pair` ON `correlations` (`domain_a_id`,`domain_b_id`,`lag_days`);--> statement-breakpoint
CREATE TABLE `__new_domains` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`icon` text,
	`unit` text,
	`type` text DEFAULT 'numeric' NOT NULL,
	`min_value` real DEFAULT 0,
	`max_value` real DEFAULT 10,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`archived` integer DEFAULT false
);
--> statement-breakpoint
INSERT INTO `__new_domains`("id", "label", "icon", "unit", "type", "min_value", "max_value", "created_at", "archived") SELECT "id", "label", "icon", "unit", "type", "min_value", "max_value", "created_at", "archived" FROM `domains`;--> statement-breakpoint
DROP TABLE `domains`;--> statement-breakpoint
ALTER TABLE `__new_domains` RENAME TO `domains`;--> statement-breakpoint
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_id` text NOT NULL,
	`timestamp` text NOT NULL,
	`value` real NOT NULL,
	`note` text,
	`source` text DEFAULT 'manual',
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_events`("id", "domain_id", "timestamp", "value", "note", "source", "created_at") SELECT "id", "domain_id", "timestamp", "value", "note", "source", "created_at" FROM `events`;--> statement-breakpoint
DROP TABLE `events`;--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_events_domain_date` ON `events` (`domain_id`,`timestamp`);--> statement-breakpoint
CREATE TABLE `__new_weekly_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`domain_id` text NOT NULL,
	`week_start` text NOT NULL,
	`consistency` real,
	`total_value` real,
	`num_events` integer,
	`trend` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`domain_id`) REFERENCES `domains`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_weekly_snapshots`("id", "domain_id", "week_start", "consistency", "total_value", "num_events", "trend", "metadata", "created_at") SELECT "id", "domain_id", "week_start", "consistency", "total_value", "num_events", "trend", "metadata", "created_at" FROM `weekly_snapshots`;--> statement-breakpoint
DROP TABLE `weekly_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_weekly_snapshots` RENAME TO `weekly_snapshots`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_snapshots_domain_week` ON `weekly_snapshots` (`domain_id`,`week_start`);