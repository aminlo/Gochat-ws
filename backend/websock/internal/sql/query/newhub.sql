-- name: CreateHub :exec
INSERT INTO hubs (id, name, owner_id)
VALUES (?, ?, ?);