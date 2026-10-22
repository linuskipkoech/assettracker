CREATE TABLE `beneficiaries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`parent_beneficiary_id` text,
	`name` text NOT NULL,
	`relationship` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`notes` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_beneficiary_id`) REFERENCES `beneficiaries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `checkin_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`beneficiary_id` text,
	`purpose` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiaries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `checkin_tokens_token_hash_unique` ON `checkin_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `escalation_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`beneficiary_id` text,
	`type` text NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`beneficiary_id`) REFERENCES `beneficiaries`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
ALTER TABLE `users` ADD `last_login_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `inactivity_threshold_days` integer DEFAULT 90 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `checkin_grace_days` integer DEFAULT 14 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `beneficiary_grace_days` integer DEFAULT 14 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `escalation_status` text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `escalation_deadline_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `current_beneficiary_id` text;