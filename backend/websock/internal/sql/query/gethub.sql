-- name: GetHub :one
SELECT *
FROM hubs
WHERE hubs.owner_id = ?;
