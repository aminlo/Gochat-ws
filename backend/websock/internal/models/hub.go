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
	Description  string
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
	log.Printf("start hub for hubid: %s at %p", h.Hubid, h)
	for {
		select {
		case client := <-h.Register:
			h.Mutex.Lock()
			h.Clients[client] = true
			h.Mutex.Unlock()
			log.Printf("client connected. Total: %d", len(h.Clients))
			log.Printf("client %s connected to room %s. Total: %d",
				client.Username, h.Hubname, len(h.Clients))

			h.sendUserListToNewClient(client) // so users kno what users are in room
			// Send join message to all clients
			joinMsg := &Message{
				MessageID: uuid.New().String(),
				Type:      MessageTypeJoin,
				Message:   client.Username + " joined the room",
				User: map[string]any{
					"id":       client.UserID,
					"username": client.Username,
				},
				Timestamp: time.Now(),
			}
			h.broadcastMessage(joinMsg)

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
				MessageID: uuid.New().String(),
				Type:      MessageTypeLeave,
				Message:   client.Username + " left the room",
				User: map[string]interface{}{
					"id":       client.UserID,
					"username": client.Username,
				},
				Timestamp: time.Now(),
			}
			h.broadcastMessage(leaveMsg)

		case message := <-h.Broadcast:
			log.Printf(" Broadcasting message: %+v", message)
			h.broadcastMessage(message)
		}
	}
}

func (h *Hub) broadcastMessage(message *Message) {
	// Store message in history, not implemented
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
		log.Printf(" Attempting to send to client: %s (%s)", client.Username, client.UserID)
		select {
		case client.Send <- message:
			log.Printf("Sent message to %s", client.Username)
		default:
			// client's send channel is full, remove client
			log.Printf("Send channel full for %s, removing client", client.Username)
			delete(h.Clients, client)
			close(client.Send)
			client.Conn.Close()
		}
	}
	h.Mutex.RUnlock()
}

func (h *Hub) sendUserListToNewClient(newClient *Client) {
	h.Mutex.RLock()
	var users []map[string]interface{}
	for client := range h.Clients {
		users = append(users, map[string]interface{}{
			"id":       client.UserID,
			"username": client.Username,
		})
	}
	h.Mutex.RUnlock()

	userListMsg := &Message{
		MessageID: uuid.New().String(),
		Type:      "user_list",
		Users:     users,
		Timestamp: time.Now(),
	}

	// Send only to the new client
	select {
	case newClient.Send <- userListMsg:
	default:
		log.Println("Failed to send user list to new client")
	}
}
