package models

import (
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
)

type Hub struct {
	Owner        string
	Hubname      string
	Hubid        string
	Active       bool
	SaveMessages bool
	Clients      map[*Client]bool
	Broadcast    chan *Message
	Register     chan *Client
	Unregister   chan *Client
	Mutex        sync.RWMutex
	Messages     []*Message
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			h.Clients[client] = true
			h.Mutex.Unlock()
			log.Printf("client connected. Total: %d", len(h.Clients))
			log.Printf("client %s connected to room %s. Total: %d",
				client.Username, h.Hubname, len(h.Clients))

			// Send join message to all clients
			joinMsg := &Message{
				ID:        uuid.New().String(),
				Type:      string(MessageTypeJoin),
				Content:   client.Username + " joined the room",
				UserID:    client.ID,
				Username:  client.Username,
				RoomID:    h.Hubid,
				Timestamp: time.Now(),
			}
			h.Broadcast <- joinMsg

		case client := <-h.Unregister:
			h.Mutex.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)
				client.Conn.Close()
			}
			h.Mutex.Unlock()

			log.Printf("client %s disconnected from room %s. Total: %d",
				client.Username, h.Hubname, len(h.Clients))

			// Send leave message to remaining clients
			leaveMsg := &Message{
				ID:        uuid.New().String(),
				Type:      string(MessageTypeLeave),
				Content:   client.Username + " left the room",
				UserID:    client.ID,
				Username:  client.Username,
				RoomID:    h.Hubid,
				Timestamp: time.Now(),
			}
			h.Broadcast <- leaveMsg

		case message := <-h.Broadcast:
			h.broadcastMessage(message)
		}
	}
}

func (h *Hub) broadcastMessage(message *Message) {
	// Store message in history
	if h.SaveMessages {
		h.Mutex.Lock()
		h.Messages = append(h.Messages, message)
		// Keep only last 100 messages in memory
		if len(h.Messages) > 100 {
			h.Messages = h.Messages[1:]
		}
		h.Mutex.Unlock()
	}
	// Send to all connected clients
	// messageBytes, _ := json.Marshal(message)
	h.Mutex.RLock()
	for client := range h.Clients {
		select {
		case client.Send <- message:
		default:
			// client's send channel is full, remove client
			delete(h.Clients, client)
			close(client.Send)
			client.Conn.Close()
		}
	}
	h.Mutex.RUnlock()
}
