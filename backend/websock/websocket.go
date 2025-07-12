package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
var rooms = make(map[string]*Hub)
var roomsMutex = sync.RWMutex{}

type Hub struct {
	hubname    string
	hubid      string
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.RWMutex
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mutex.Lock()
			h.clients[conn] = true
			h.mutex.Unlock()
			log.Printf("Client connected. Total: %d", len(h.clients))
			log.Println(conn)

		case conn := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
			}
			h.mutex.Unlock()
			log.Printf("Client disconnected. Total: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mutex.RLock()
			for conn := range h.clients {
				if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
					delete(h.clients, conn)
					conn.Close()
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	hub.register <- conn

	defer func() {
		hub.unregister <- conn
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}
		// Broadcast to all clients instead of just echoing back
		hub.broadcast <- message
	}
}

func webshandler(w http.ResponseWriter, r *http.Request) {
	hubid := chi.URLParam(r, "hubid")
	roomsMutex.RLock()
	hub := rooms[hubid]
	roomsMutex.RUnlock()
	serveWs(hub, w, r)
}

type CreateHubReq struct {
	Name string `json:"name"`
}

type CreateRoomResponse struct {
	RoomID string `json:"room_id"`
	Name   string `json:"name"`
}

func createhubhandler(w http.ResponseWriter, r *http.Request) {
	var req CreateHubReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	hub := &Hub{
		hubname:    req.Name,
		hubid:      uuid.New().String(),
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}

	roomsMutex.Lock()
	rooms[hub.hubid] = hub
	roomsMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"hubname": req.Name, "hubid": hub.hubid})
}

// func dashhandler(w http.ResponseWriter, r *http.Request) {

// }

func runhubhandler(w http.ResponseWriter, r *http.Request) {
	hubid := chi.URLParam(r, "hubid")
	roomsMutex.RLock()
	hub := rooms[hubid]
	roomsMutex.RUnlock()
	go hub.run()
}

// type RoomInfo struct {
//     ID          string `json:"id"`
//     Name        string `json:"name"`
//     ClientCount int    `json:"client_count"`
// }

// // List all rooms
// func listRoomsHandler(w http.ResponseWriter, r *http.Request) {
//     roomsMutex.RLock()
//     defer roomsMutex.RUnlock()

//     var roomList []RoomInfo
//     for id, hub := range rooms {
//         hub.mutex.RLock()
//         clientCount := len(hub.clients)
//         hub.mutex.RUnlock()

//         roomList = append(roomList, RoomInfo{
//             ID:          id,
//             Name:        hub.hubname,
//             ClientCount: clientCount,
//         })
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(roomList)
// }
