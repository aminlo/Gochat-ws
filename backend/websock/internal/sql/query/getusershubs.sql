-- name: GetUsersHubs :many
SELECT *
FROM hubs
JOIN users ON hubs.owner_id = users.id
WHERE users.id = ?;