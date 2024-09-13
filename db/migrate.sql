CREATE TABLE IF NOT EXISTS documents (
    title TEXT,
    content TEXT,
    created_at DATE DEFAULT (datetime('now','localtime'))
);


-- Insert some sample data
INSERT INTO documents (title, content) VALUES
('Sample Document 1', 'This is the content of the first sample document.'),
('Sample Document 2', 'Here is some content for the second sample document.'),
('Sample Document 3', 'Content for the third sample document goes here.');
