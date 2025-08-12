-- name: GetHub :one
SELECT *
FROM hubs
WHERE hubs.id = ?;
