-- name: DeleteHub :exec
DELETE FROM hubs
WHERE hubs.id = ?;