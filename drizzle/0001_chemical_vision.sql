CREATE TABLE `appointment_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`appointment_id` text NOT NULL,
	`status` text NOT NULL,
	`actor_user_id` text,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medical_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`storage_key` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`source` text DEFAULT 'patient-uploaded' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medical_records` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`details` text,
	`occurred_at` text,
	`source` text DEFAULT 'patient-entered' NOT NULL,
	`clinician_locked` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `patient_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`location` text,
	`postal_code` text,
	`specialty` text,
	`radius_miles` real DEFAULT 100 NOT NULL,
	`format` text DEFAULT 'Either' NOT NULL,
	`preferred_days_json` text,
	`time_range` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`patient_id`) REFERENCES `patient_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `clinics` ADD `address` text;--> statement-breakpoint
ALTER TABLE `clinics` ADD `postal_code` text;--> statement-breakpoint
ALTER TABLE `clinics` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `clinics` ADD `longitude` real;--> statement-breakpoint
ALTER TABLE `clinics` ADD `directory_source` text;--> statement-breakpoint
ALTER TABLE `clinics` ADD `verified_at` text;