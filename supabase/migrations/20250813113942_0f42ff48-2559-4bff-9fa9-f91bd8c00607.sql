-- Enable real-time for admin tables
ALTER TABLE system_settings REPLICA IDENTITY FULL;
ALTER TABLE system_logs REPLICA IDENTITY FULL;
ALTER TABLE security_events REPLICA IDENTITY FULL;
ALTER TABLE system_backups REPLICA IDENTITY FULL;

-- Add all admin tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE system_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE security_events;
ALTER PUBLICATION supabase_realtime ADD TABLE system_backups;