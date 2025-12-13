CREATE TABLE IF NOT EXISTS "saved_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"country" varchar,
	"admin1" varchar,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"temperature_unit" varchar(1) DEFAULT 'C' NOT NULL,
	"email_alerts_enabled" boolean DEFAULT false NOT NULL,
	"alert_email" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weather_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_name" varchar NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"temperature" real NOT NULL,
	"humidity" real NOT NULL,
	"heat_index" real NOT NULL,
	"risk_level" varchar NOT NULL,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_weather_history_location" ON "weather_history" USING btree ("latitude","longitude");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_weather_history_recorded_at" ON "weather_history" USING btree ("recorded_at");
--> statement-breakpoint
ALTER TABLE "user_preferences" DROP CONSTRAINT IF EXISTS "user_preferences_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_locations" DROP CONSTRAINT IF EXISTS "saved_locations_user_id_users_id_fk";
--> statement-breakpoint
DROP TABLE IF EXISTS "sessions" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "users" CASCADE;
