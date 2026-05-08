-- =============================================================
-- TuloClicks Database Schema
-- Run once to initialize all tables required by the backend.
-- Safe to re-run: all statements use IF NOT EXISTS.
-- =============================================================

-- -------------------------------------------------------------
-- 1. users
-- Core account table. Roles: admin | organizer | user
-- Statuses: active | pending | suspended | rejected
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name            VARCHAR(150)    NOT NULL,
  email           VARCHAR(255)    NOT NULL UNIQUE,
  password        VARCHAR(255)    NOT NULL,
  role            ENUM('admin','organizer','user') NOT NULL DEFAULT 'user',
  status          ENUM('active','pending','suspended','rejected') NOT NULL DEFAULT 'active',
  phone           VARCHAR(20)     NULL,
  profile_image   VARCHAR(500)    NULL,
  email_verified  TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email  (email),
  INDEX idx_users_role   (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. notifications
-- In-app bell notifications per user.
-- type: info | success | error | warning
-- related_type: event | organizer_profile | payment | booking | system
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED    NOT NULL,
  title         VARCHAR(255)    NOT NULL,
  message       TEXT            NOT NULL,
  type          VARCHAR(50)     NOT NULL DEFAULT 'info',
  related_type  VARCHAR(100)    NULL,
  related_id    INT UNSIGNED    NULL,
  is_read       TINYINT(1)      NOT NULL DEFAULT 0,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. support_tickets
-- User-submitted help/support requests.
-- issue_type: complaint | refund | technical | technical_issue | other
-- status: open | in_progress | resolved | closed
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_tickets (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED    NOT NULL,
  booking_id  INT UNSIGNED    NULL,
  event_id    INT UNSIGNED    NULL,
  subject     VARCHAR(255)    NOT NULL,
  issue_type  VARCHAR(100)    NOT NULL DEFAULT 'other',
  description TEXT            NULL,
  status      ENUM('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_support_user_id (user_id),
  INDEX idx_support_status  (status),
  CONSTRAINT fk_support_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 4. activity_logs
-- Audit trail for all significant user/admin actions.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED    NULL,
  action       VARCHAR(100)    NOT NULL,
  entity_type  VARCHAR(100)    NOT NULL DEFAULT 'system',
  entity_id    INT UNSIGNED    NULL,
  description  TEXT            NULL,
  ip_address   VARCHAR(45)     NULL,
  user_agent   VARCHAR(500)    NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_activity_user_id    (user_id),
  INDEX idx_activity_action     (action),
  INDEX idx_activity_created_at (created_at),
  CONSTRAINT fk_activity_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 5. event_categories
-- Lookup table for event categories (e.g. Music, Tech, Sports).
-- NOTE: the routes reference this table as `event_categories`.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_categories (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)    NOT NULL UNIQUE,
  description TEXT            NULL,
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_categories_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 6. venues
-- Physical event locations.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name            VARCHAR(255)    NOT NULL,
  address         VARCHAR(500)    NULL,
  city            VARCHAR(150)    NULL,
  province        VARCHAR(150)    NULL,
  country         VARCHAR(100)    NOT NULL DEFAULT 'Philippines',
  postal_code     VARCHAR(20)     NULL,
  capacity        INT UNSIGNED    NULL,
  contact_person  VARCHAR(150)    NULL,
  contact_phone   VARCHAR(30)     NULL,
  contact_email   VARCHAR(255)    NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_venues_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 7. events
-- Core event records created by organizers.
-- approval_status: pending | approved | rejected
-- publish_status:  draft | published | unpublished | cancelled | completed | concluded
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  organizer_id     INT UNSIGNED    NOT NULL,
  category_id      INT UNSIGNED    NULL,
  venue_id         INT UNSIGNED    NULL,
  title            VARCHAR(255)    NOT NULL,
  slug             VARCHAR(300)    NOT NULL UNIQUE,
  description      TEXT            NULL,
  event_image      VARCHAR(500)    NULL,
  start_date       DATE            NOT NULL,
  end_date         DATE            NULL,
  start_time       TIME            NOT NULL,
  end_time         TIME            NULL,
  location_type    ENUM('physical','online','hybrid') NOT NULL DEFAULT 'physical',
  custom_location  VARCHAR(500)    NULL,
  online_link      VARCHAR(500)    NULL,
  approval_status  ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  publish_status   ENUM('draft','published','unpublished','cancelled','completed','concluded') NOT NULL DEFAULT 'draft',
  featured         TINYINT(1)      NOT NULL DEFAULT 0,
  featured_until   DATETIME        NULL,
  platform_fee     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  total_revenue    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  approval_notes   TEXT            NULL,
  approved_by      INT UNSIGNED    NULL,
  approved_at      DATETIME        NULL,
  rejected_by      INT UNSIGNED    NULL,
  rejected_at      DATETIME        NULL,
  created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_events_organizer_id    (organizer_id),
  INDEX idx_events_category_id     (category_id),
  INDEX idx_events_venue_id        (venue_id),
  INDEX idx_events_approval_status (approval_status),
  INDEX idx_events_publish_status  (publish_status),
  INDEX idx_events_start_date      (start_date),
  CONSTRAINT fk_events_organizer
    FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_events_category
    FOREIGN KEY (category_id) REFERENCES event_categories (id) ON DELETE SET NULL,
  CONSTRAINT fk_events_venue
    FOREIGN KEY (venue_id) REFERENCES venues (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 8. speakers
-- Speaker profiles (reusable across events).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS speakers (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name       VARCHAR(150)    NOT NULL,
  email      VARCHAR(255)    NULL,
  phone      VARCHAR(30)     NULL,
  title      VARCHAR(150)    NULL,
  company    VARCHAR(255)    NULL,
  bio        TEXT            NULL,
  photo      VARCHAR(500)    NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 9. event_speakers
-- Junction table linking speakers to specific events with
-- ordering and topic details.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_speakers (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  event_id          INT UNSIGNED    NOT NULL,
  speaker_id        INT UNSIGNED    NOT NULL,
  speaker_order     INT             NOT NULL DEFAULT 1,
  topic_title       VARCHAR(255)    NULL,
  topic_description TEXT            NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_event_speakers_event_id   (event_id),
  INDEX idx_event_speakers_speaker_id (speaker_id),
  CONSTRAINT fk_event_speakers_event
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
  CONSTRAINT fk_event_speakers_speaker
    FOREIGN KEY (speaker_id) REFERENCES speakers (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 10. tickets
-- Ticket inventory per event (e.g. VIP, General Admission).
-- NOTE: routes also reference `ticket_types` for the conclude
-- endpoint; that alias is handled by the ticket_types view below.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id                 INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  event_id           INT UNSIGNED    NOT NULL,
  name               VARCHAR(150)    NOT NULL,
  description        TEXT            NULL,
  price              DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  quantity_available INT UNSIGNED    NOT NULL DEFAULT 0,
  quantity_sold      INT UNSIGNED    NOT NULL DEFAULT 0,
  is_active          TINYINT(1)      NOT NULL DEFAULT 1,
  created_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tickets_event_id  (event_id),
  INDEX idx_tickets_is_active (is_active),
  CONSTRAINT fk_tickets_event
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 10a. ticket_types (view alias)
-- The events/conclude route updates `ticket_types` by event_id.
-- This view maps ticket_types → tickets so both names work.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW ticket_types AS
  SELECT * FROM tickets;

-- -------------------------------------------------------------
-- 11. bookings
-- A booking ties a user to an event and tracks payment/attendance.
-- booking_status: pending | confirmed | checked_in | attended | cancelled | refunded
-- payment_status: unpaid | pending | paid | refunded
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  booking_reference VARCHAR(50)     NOT NULL UNIQUE,
  user_id           INT UNSIGNED    NOT NULL,
  event_id          INT UNSIGNED    NOT NULL,
  booking_status    ENUM('pending','confirmed','checked_in','attended','cancelled','refunded') NOT NULL DEFAULT 'pending',
  payment_status    ENUM('unpaid','pending','paid','refunded') NOT NULL DEFAULT 'unpaid',
  attendee_name     VARCHAR(150)    NULL,
  attendee_email    VARCHAR(255)    NULL,
  attendee_phone    VARCHAR(30)     NULL,
  total_amount      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  booked_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_in_at     DATETIME        NULL,
  checked_out_at    DATETIME        NULL,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_bookings_user_id        (user_id),
  INDEX idx_bookings_event_id       (event_id),
  INDEX idx_bookings_booking_status (booking_status),
  INDEX idx_bookings_payment_status (payment_status),
  INDEX idx_bookings_booked_at      (booked_at),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_event
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 12. booking_items
-- Line items within a booking (one row per ticket type purchased).
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_items (
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  booking_id     INT UNSIGNED    NOT NULL,
  ticket_type_id INT UNSIGNED    NOT NULL,
  quantity       INT UNSIGNED    NOT NULL DEFAULT 1,
  unit_price     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  subtotal       DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  INDEX idx_booking_items_booking_id     (booking_id),
  INDEX idx_booking_items_ticket_type_id (ticket_type_id),
  CONSTRAINT fk_booking_items_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_items_ticket
    FOREIGN KEY (ticket_type_id) REFERENCES tickets (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 13. payments
-- One payment record per booking.
-- payment_status: pending | success | failed | refunded
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  booking_id        INT UNSIGNED    NOT NULL,
  payment_reference VARCHAR(255)    NULL,
  provider          VARCHAR(100)    NULL,
  payment_method    VARCHAR(100)    NULL,
  amount            DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
  currency          VARCHAR(10)     NOT NULL DEFAULT 'PHP',
  payment_status    ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  attachment        VARCHAR(500)    NULL,
  refund_reason     TEXT            NULL,
  paid_at           DATETIME        NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_payments_booking_id     (booking_id),
  INDEX idx_payments_payment_status (payment_status),
  CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 14. reviews
-- Post-event ratings and comments from attendees.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED    NOT NULL,
  event_id   INT UNSIGNED    NOT NULL,
  rating     TINYINT UNSIGNED NOT NULL DEFAULT 5,
  comment    TEXT            NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_reviews_event_id (event_id),
  INDEX idx_reviews_user_id  (user_id),
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_event
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 15. organizer_profiles
-- Extended profile for users who apply to become organizers.
-- approval_status: pending | approved | rejected
-- NOTE: routes reference this table as `organizer_profiles`.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizer_profiles (
  id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  user_id           INT UNSIGNED    NOT NULL UNIQUE,
  organization_name VARCHAR(255)    NOT NULL,
  organization_type VARCHAR(150)    NULL,
  branding_logo     VARCHAR(500)    NULL,
  branding_banner   VARCHAR(500)    NULL,
  description       TEXT            NULL,
  website           VARCHAR(500)    NULL,
  facebook_link     VARCHAR(500)    NULL,
  instagram_link    VARCHAR(500)    NULL,
  approval_status   ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  approved_by       INT UNSIGNED    NULL,
  approved_at       DATETIME        NULL,
  rejection_reason  TEXT            NULL,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_organizer_profiles_user_id         (user_id),
  INDEX idx_organizer_profiles_approval_status (approval_status),
  CONSTRAINT fk_organizer_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
