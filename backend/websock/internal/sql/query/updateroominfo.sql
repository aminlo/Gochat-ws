-- name: UpdateRooms :exec

UPDATE hubs
SET name = ?, description = ?, save_messages = ?
WHERE id = ?;