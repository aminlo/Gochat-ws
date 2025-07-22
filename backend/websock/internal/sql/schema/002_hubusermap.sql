-- +goose Up
CREATE TABLE hubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active TEXT default false,
    owner_id TEXT NOT NULL,
    save_messages BOOLEAN DEFAULT false,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- +goose Down
DROP TABLE IF EXISTS hubs;