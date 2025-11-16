-- Add GIN index for full-text search on bookmark_contents.search_vector
CREATE INDEX IF NOT EXISTS idx_bookmark_contents_search_vector ON bookmark_contents USING gin (search_vector);
