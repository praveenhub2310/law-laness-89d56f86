-- Update court_calendar table to match requirements
ALTER TABLE court_calendar 
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS duration interval,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('Mediation', 'Hearing', 'Settlement', 'Final Hearing', 'Regulatory'));

-- Update status constraint to match requirements
ALTER TABLE court_calendar 
DROP CONSTRAINT IF EXISTS court_calendar_status_check;

ALTER TABLE court_calendar 
ADD CONSTRAINT court_calendar_status_check 
CHECK (status IN ('Scheduled', 'Confirmed', 'Tentative', 'Completed', 'Cancelled'));

-- Convert hearing_date to date only (remove time component)
ALTER TABLE court_calendar 
ALTER COLUMN hearing_date TYPE date;