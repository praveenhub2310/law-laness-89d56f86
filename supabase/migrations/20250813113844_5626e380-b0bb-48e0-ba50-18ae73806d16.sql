-- Add sample data to admin tables for testing

-- Sample system settings
INSERT INTO system_settings (key, value, category, description) VALUES
('max_file_size', '"10MB"', 'system', 'Maximum file upload size'),
('session_timeout', '30', 'security', 'Session timeout in minutes'),
('email_notifications', 'true', 'notification', 'Enable email notifications'),
('theme_color', '"blue"', 'ui', 'Default theme color'),
('api_rate_limit', '100', 'integration', 'API requests per minute limit');

-- Sample system logs  
INSERT INTO system_logs (level, module, action, status, details, ip_address, user_agent) VALUES
('INFO', 'Authentication', 'User Login', 'Success', 'User successfully logged in', '192.168.1.100', 'Mozilla/5.0'),
('WARNING', 'Document Management', 'File Upload', 'Failed', 'File size exceeds limit', '192.168.1.101', 'Chrome/96.0'),
('ERROR', 'Database', 'Query Error', 'Failed', 'Connection timeout occurred', '192.168.1.102', 'Firefox/95.0'),
('INFO', 'Case Management', 'Case Created', 'Success', 'New case created successfully', '192.168.1.103', 'Safari/14.0');

-- Sample security events
INSERT INTO security_events (event_type, severity, description, details, ip_address, resolved) VALUES
('Failed Login Attempt', 'MEDIUM', 'Multiple failed login attempts detected', '{"attempts": 5, "username": "admin"}', '192.168.1.200', false),
('Unauthorized Access', 'HIGH', 'Access attempt to restricted area', '{"path": "/admin", "method": "GET"}', '192.168.1.201', false),
('Suspicious Activity', 'LOW', 'Unusual file download pattern', '{"files": 10, "timeframe": "5min"}', '192.168.1.202', true);

-- Sample system backups
INSERT INTO system_backups (backup_type, status, file_path, file_size) VALUES
('Full', 'COMPLETED', '/backups/full_backup_2025_01_13.sql', 1024000000),
('Incremental', 'COMPLETED', '/backups/inc_backup_2025_01_13.sql', 50000000),
('Full', 'IN_PROGRESS', '/backups/full_backup_2025_01_14.sql', null);