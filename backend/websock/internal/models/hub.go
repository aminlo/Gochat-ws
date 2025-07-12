package models

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	Hubname    string
	Hubid      string
	Active     bool
	Clients    map[*websocket.Conn]bool
	Broadcast  chan []byte
	Register   chan *websocket.Conn
	Unregister chan *websocket.Conn
	Mutex      sync.RWMutex
}

func (h *Hub) Run() {
	for {
		select {
		case conn := <-h.Register:
			h.Mutex.Lock()
			h.Clients[conn] = true
			h.Mutex.Unlock()
			log.Printf("Client connected. Total: %d", len(h.Clients))
			log.Println(conn)

		case conn := <-h.Unregister:
			h.Mutex.Lock()
			if _, ok := h.Clients[conn]; ok {
				delete(h.Clients, conn)
				conn.Close()
			}
			h.Mutex.Unlock()
			log.Printf("Client disconnected. Total: %d", len(h.Clients))

		case message := <-h.Broadcast:
			h.Mutex.RLock()
			for conn := range h.Clients {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					delete(h.Clients, conn)
					conn.Close()
				}
			}
			h.Mutex.RUnlock()
		}
	}
}
