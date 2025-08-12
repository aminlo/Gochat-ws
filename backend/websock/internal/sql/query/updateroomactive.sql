-- name: UpdateRoomActive :exec

UPDATE hubs
SET active = ?
WHERE hubs.id = ?;