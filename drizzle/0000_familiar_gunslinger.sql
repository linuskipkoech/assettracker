CREATE TABLE `advisors` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`specialty` text NOT NULL,
	`bio` text NOT NULL,
	`years_experience` integer,
	`hourly_rate_kes` real,
	`county` text,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `advisors_user_id_unique` ON `advisors` (`user_id`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`current_value` real NOT NULL,
	`currency` text DEFAULT 'KES' NOT NULL,
	`acquisition_value` real,
	`acquisition_date` integer,
	`location` text,
	`county` text,
	`latitude` real,
	`longitude` real,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `business_details` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`industry` text,
	`ownership_percent` real,
	`monthly_revenue` real,
	`monthly_expenses` real,
	`employee_count` integer,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_details_asset_id_unique` ON `business_details` (`asset_id`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `consultation_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`advisor_id` text NOT NULL,
	`asset_id` text,
	`topic` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`preferred_date` integer,
	`advisor_note` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`advisor_id`) REFERENCES `advisors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `farm_details` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`size_acres` real,
	`primary_crop` text,
	`secondary_crop` text,
	`soil_type` text,
	`irrigation` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `farm_details_asset_id_unique` ON `farm_details` (`asset_id`);--> statement-breakpoint
CREATE TABLE `land_details` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`size_acres` real,
	`title_deed_number` text,
	`zoning` text,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `land_details_asset_id_unique` ON `land_details` (`asset_id`);--> statement-breakpoint
CREATE TABLE `livestock_details` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`species` text,
	`breed` text,
	`head_count` integer,
	`average_age_months` integer,
	`purpose` text,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `livestock_details_asset_id_unique` ON `livestock_details` (`asset_id`);--> statement-breakpoint
CREATE TABLE `property_details` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`property_type` text,
	`bedrooms` integer,
	`monthly_rental_income` real,
	`occupied` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `property_details_asset_id_unique` ON `property_details` (`asset_id`);--> statement-breakpoint
CREATE TABLE `stock_details` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`ticker_symbol` text,
	`exchange` text,
	`quantity` real,
	`price_per_unit` real,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_details_asset_id_unique` ON `stock_details` (`asset_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'USER' NOT NULL,
	`phone` text,
	`county` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `valuation_history` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_id` text NOT NULL,
	`value` real NOT NULL,
	`note` text,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE cascade
);
