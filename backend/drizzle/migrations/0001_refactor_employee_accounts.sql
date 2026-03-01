CREATE TYPE "public"."assignment_status" AS ENUM('assigned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."shift_type" AS ENUM('morning', 'afternoon', 'night', 'weekend');--> statement-breakpoint
ALTER TYPE "public"."boarding_status" ADD VALUE 'pending' BEFORE 'boarded';--> statement-breakpoint
ALTER TYPE "public"."boarding_status" ADD VALUE 'dropped' BEFORE 'missed';--> statement-breakpoint
ALTER TYPE "public"."trip_type" ADD VALUE 'both';--> statement-breakpoint
CREATE TABLE "driver_shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"shift_type" "shift_type" NOT NULL,
	"day_of_week" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"effective_from" date NOT NULL,
	"effective_until" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roster_assignment_employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roster_assignment_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roster_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"date" date NOT NULL,
	"shift_type" "shift_type" NOT NULL,
	"trip_type" "trip_type" DEFAULT 'pickup',
	"scheduled_time" time,
	"status" "assignment_status" DEFAULT 'assigned' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rotation_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driver_id" uuid NOT NULL,
	"month" date NOT NULL,
	"weekend_count" integer DEFAULT 0 NOT NULL,
	"night_shift_count" integer DEFAULT 0 NOT NULL,
	"total_shifts" integer DEFAULT 0 NOT NULL,
	"last_weekend_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "employees" DROP CONSTRAINT "employees_user_id_unique";--> statement-breakpoint
ALTER TABLE "drivers" DROP CONSTRAINT "drivers_current_vehicle_id_vehicles_id_fk";
--> statement-breakpoint
ALTER TABLE "rosters" DROP CONSTRAINT "rosters_employee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "trip_boarding_logs" DROP CONSTRAINT "trip_boarding_logs_employee_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "trip_boarding_logs" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "owner" text DEFAULT 'RTS';--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "owner_phone" text;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "employee_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "driver_shifts" ADD CONSTRAINT "driver_shifts_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_assignment_employees" ADD CONSTRAINT "roster_assignment_employees_roster_assignment_id_roster_assignments_id_fk" FOREIGN KEY ("roster_assignment_id") REFERENCES "public"."roster_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_assignment_employees" ADD CONSTRAINT "roster_assignment_employees_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_assignments" ADD CONSTRAINT "roster_assignments_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_assignments" ADD CONSTRAINT "roster_assignments_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roster_assignments" ADD CONSTRAINT "roster_assignments_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rotation_tracking" ADD CONSTRAINT "rotation_tracking_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rosters" ADD CONSTRAINT "rosters_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_boarding_logs" ADD CONSTRAINT "trip_boarding_logs_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" DROP COLUMN "current_vehicle_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_employee_id_unique" UNIQUE("employee_id");