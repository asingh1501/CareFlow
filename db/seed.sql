-- CareFlow AR fictional demo data. Never replace with real patient information.
PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO users (id, email, role) VALUES
('u-jordan','jordan@example.demo','patient'),('u-avery','avery@example.demo','patient'),('u-samira','samira@example.demo','patient'),
('u-noah','noah@example.demo','patient'),('u-mina','mina@example.demo','patient'),('u-liam','liam@example.demo','patient'),
('u-elena','elena@example.demo','patient'),('u-owen','owen@example.demo','patient'),('u-riley','riley@example.demo','patient'),
('u-harper','harper@example.demo','patient'),('u-patel','maya.patel@example.demo','provider'),('u-brooks','elias.brooks@example.demo','provider'),
('u-chen','lena.chen@example.demo','provider'),('u-davis','nia.davis@example.demo','provider'),('u-rivera','tomas.rivera@example.demo','provider'),
('u-staff','alex.morgan@example.demo','staff');

INSERT OR IGNORE INTO patient_profiles (id,user_id,display_name,city,state) VALUES
('p-jordan','u-jordan','Jordan Lee','Bentonville','AR'),('p-avery','u-avery','Avery Morgan','Rogers','AR'),
('p-samira','u-samira','Samira Bell','Fayetteville','AR'),('p-noah','u-noah','Noah Williams','Springdale','AR'),
('p-mina','u-mina','Mina Shah','Bentonville','AR'),('p-liam','u-liam','Liam Grant','Rogers','AR'),
('p-elena','u-elena','Elena Torres','Springdale','AR'),('p-owen','u-owen','Owen Reed','Fayetteville','AR'),
('p-riley','u-riley','Riley Kim','Bentonville','AR'),('p-harper','u-harper','Harper Jones','Siloam Springs','AR');

INSERT OR IGNORE INTO clinics (id,name,city,state,rural) VALUES
('cl-benton','Ozark Grove Family Clinic','Bentonville','AR',0),('cl-rogers','Lakeview Community Health','Rogers','AR',0),
('cl-fayette','Northwest Primary Care Center','Fayetteville','AR',0),('cl-spring','Clear Creek Health Access','Springdale','AR',1),
('cl-siloam','Siloam Rural Care Hub','Siloam Springs','AR',1);

INSERT OR IGNORE INTO provider_profiles (id,user_id,specialty) VALUES
('pp-patel','u-patel','Primary Care'),('pp-brooks','u-brooks','Family Medicine'),('pp-chen','u-chen','Primary Care'),
('pp-davis','u-davis','Internal Medicine'),('pp-rivera','u-rivera','Family Medicine');

INSERT OR IGNORE INTO providers (id,profile_id,display_name,specialty) VALUES
('pr-patel','pp-patel','Dr. Maya Patel','Primary Care'),('pr-brooks','pp-brooks','Dr. Elias Brooks','Family Medicine'),
('pr-chen','pp-chen','Dr. Lena Chen','Primary Care'),('pr-davis','pp-davis','Dr. Nia Davis','Internal Medicine'),
('pr-rivera','pp-rivera','Dr. Tomás Rivera','Family Medicine');

INSERT OR IGNORE INTO appointment_types (id,name,format,duration_minutes) VALUES
('at-primary','Primary care','In person',30),('at-virtual','Primary care telehealth','Telehealth',25),('at-sameday','Same-day care','In person',20);

INSERT OR IGNORE INTO appointment_slots (id,provider_id,clinic_id,appointment_type_id,starts_at,format,distance_miles,status) VALUES
('slot-01','pr-patel','cl-benton','at-primary','2026-09-04T16:20:00-05:00','In person',2.8,'open'),
('slot-02','pr-brooks','cl-rogers','at-primary','2026-09-04T15:30:00-05:00','In person',5.4,'open'),
('slot-03','pr-chen','cl-fayette','at-virtual','2026-09-04T17:00:00-05:00','Telehealth',0,'open'),
('slot-04','pr-davis','cl-spring','at-primary','2026-09-05T09:40:00-05:00','In person',11.2,'open'),
('slot-05','pr-rivera','cl-benton','at-sameday','2026-09-05T14:00:00-05:00','In person',2.8,'open'),
('slot-06','pr-patel','cl-benton','at-primary','2026-09-05T08:00:00-05:00','In person',2.8,'open'),
('slot-07','pr-brooks','cl-rogers','at-primary','2026-09-05T09:00:00-05:00','In person',5.4,'open'),
('slot-08','pr-chen','cl-fayette','at-virtual','2026-09-05T10:00:00-05:00','Telehealth',0,'open'),
('slot-09','pr-davis','cl-spring','at-primary','2026-09-05T11:00:00-05:00','In person',11.2,'open'),
('slot-10','pr-rivera','cl-siloam','at-primary','2026-09-05T13:00:00-05:00','In person',18.1,'open'),
('slot-11','pr-patel','cl-benton','at-primary','2026-09-05T14:30:00-05:00','In person',2.8,'open'),
('slot-12','pr-brooks','cl-rogers','at-primary','2026-09-05T15:00:00-05:00','In person',5.4,'open'),
('slot-13','pr-chen','cl-fayette','at-virtual','2026-09-05T16:00:00-05:00','Telehealth',0,'open'),
('slot-14','pr-davis','cl-spring','at-sameday','2026-09-06T08:30:00-05:00','In person',11.2,'open'),
('slot-15','pr-rivera','cl-siloam','at-primary','2026-09-06T09:30:00-05:00','In person',18.1,'open'),
('slot-16','pr-patel','cl-benton','at-primary','2026-09-06T10:30:00-05:00','In person',2.8,'open'),
('slot-17','pr-brooks','cl-rogers','at-primary','2026-09-06T11:30:00-05:00','In person',5.4,'open'),
('slot-18','pr-chen','cl-fayette','at-virtual','2026-09-06T13:30:00-05:00','Telehealth',0,'open'),
('slot-19','pr-davis','cl-spring','at-primary','2026-09-06T15:30:00-05:00','In person',11.2,'open'),
('slot-20','pr-rivera','cl-siloam','at-primary','2026-09-06T16:30:00-05:00','In person',18.1,'open'),
('slot-21','pr-patel','cl-benton','at-primary','2026-09-07T08:30:00-05:00','In person',2.8,'open'),
('slot-22','pr-brooks','cl-rogers','at-sameday','2026-09-07T10:30:00-05:00','In person',5.4,'open'),
('slot-23','pr-chen','cl-fayette','at-virtual','2026-09-07T14:30:00-05:00','Telehealth',0,'open'),
('slot-24','pr-davis','cl-spring','at-primary','2026-09-07T16:30:00-05:00','In person',11.2,'open');

INSERT OR IGNORE INTO care_requests (id,patient_id,concern,duration,navigation_category,emergency_warning) VALUES
('cr-jordan','p-jordan','Persistent cough','4 days','Routine / primary care',0);
INSERT OR IGNORE INTO waitlist_entries (id,patient_id,appointment_type_id,availability,max_distance_miles,status) VALUES
('wl-1','p-elena','at-primary','Afternoons',10,'active'),('wl-2','p-owen','at-primary','After 1 PM',15,'active'),('wl-3','p-riley','at-virtual','Flexible',0,'active'),('wl-4','p-harper','at-primary','Mornings',20,'active');
INSERT OR IGNORE INTO staff_tasks (id,clinic_id,patient_id,task_type,status) VALUES
('task-1','cl-benton','p-jordan','missing_forms','open'),('task-2','cl-benton','p-noah','insurance_verification','open'),
('task-3','cl-benton','p-owen','confirmation','open'),('task-4','cl-benton',NULL,'cancellation_slot','open'),
('task-5','cl-spring','p-elena','transportation_support','open');
