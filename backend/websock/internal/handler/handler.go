package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/aminlo/Gochat-ws/internal/models"
	"github.com/aminlo/Gochat-ws/internal/sql/db"
	"github.com/go-chi/chi/v5"
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

type Hub = models.Hub

var rooms = make(map[string]*Hub)
var roomsMutex = sync.RWMutex{}

type Config struct {
	JWTstring string
	DbQueries *db.Queries
}

// func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Println(err)
// 		return
// 	}

// 	hub.Register <- conn

// 	defer func() {
// 		hub.Unregister <- conn
// 	}()

// 	for {
// 		_, message, err := conn.ReadMessage()
// 		if err != nil {
// 			log.Println(err)
// 			break
// 		}
// 		// Broadcast to all clients instead of just echoing back
// 		hub.Broadcast <- message
// 	}
// }

func serveWs(hub *models.Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Get username from query parameters
	username := r.URL.Query().Get("username")
	if username == "" {
		username = "Anonymous" + uuid.New().String()[:3]
	}

	client := &models.Client{
		ID:       uuid.New().String(),
		Username: username,
		Conn:     conn,
		Hub:      hub,
		Send:     make(chan *models.Message, 256),
	}

	client.Hub.Register <- client

	// thi allows for continous write and read pump, seperated for functionality and cleanliness
	go client.WritePump()
	go client.ReadPump()
}

func Webshandler(w http.ResponseWriter, r *http.Request) {
	hubid := chi.URLParam(r, "hubid")
	roomsMutex.RLock()
	hub := rooms[hubid]
	roomsMutex.RUnlock()
	if hub == nil {
		http.Error(w, "Hub not found", http.StatusNotFound)
		return
	}
	serveWs(hub, w, r)
}

type CreateHubReq struct {
	Name string `json:"name"`
}

type CreateRoomResponse struct {
	RoomID string `json:"room_id"`
	Name   string `json:"name"`
}

func (Cfg *Config) Createhubhandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(contextKey("user")).(db.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateHubReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	hub := &Hub{
		Owner:      user.ID,
		Hubname:    req.Name,
		Hubid:      uuid.New().String(),
		Clients:    make(map[*models.Client]bool),
		Broadcast:  make(chan *models.Message),
		Register:   make(chan *models.Client),
		Unregister: make(chan *models.Client),
		Active:     false,
		Messages:   []*models.Message{},
	}

	roomsMutex.Lock()
	rooms[hub.Hubid] = hub
	roomsMutex.Unlock()
	params := db.CreateHubParams{
		ID:      hub.Hubid,
		Name:    hub.Hubname,
		OwnerID: hub.Owner,
	}
	err := Cfg.DbQueries.CreateHub(r.Context(), params)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		log.Println("auth failed: user not found:", err)
		return
	}
	log.Println(hub)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"hubname": req.Name, "hubid": hub.Hubid})
}

// func dashhandler(w http.ResponseWriter, r *http.Request) {

// }

func Runhubhandler(w http.ResponseWriter, r *http.Request) {
	hubid := chi.URLParam(r, "hubid")
	log.Println("adada", hubid)
	roomsMutex.RLock()
	hub := rooms[hubid]

	roomsMutex.RUnlock()
	log.Println("Hub found:", hub)
	log.Println("Rooms:", rooms)

	if hub == nil {
		http.Error(w, "Hub not found", http.StatusNotFound)
		return
	}
	hub.Active = true
	go hub.Run()
}

type RoomInfo struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	ClientCount int    `json:"client_count"`
	RoomActive  bool   `json:"roomactive"`
}

func ListRoomsHandler(w http.ResponseWriter, r *http.Request) {
	roomsMutex.RLock()
	defer roomsMutex.RUnlock()

	var roomList []RoomInfo
	for id, hub := range rooms {
		hub.Mutex.RLock()
		clientCount := len(hub.Clients)
		roomactive := hub.Active
		hub.Mutex.RUnlock()

		roomList = append(roomList, RoomInfo{
			ID:          id,
			Name:        hub.Hubname,
			ClientCount: clientCount,
			RoomActive:  roomactive,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roomList)
}

func (h *Config) Ownroomshandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(contextKey("user")).(string)
	if !ok || userID == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	roomsMutex.RLock()
	defer roomsMutex.RUnlock()

	var ownRooms []RoomInfo
	for id, hub := range rooms {
		if hub.Owner != userID {
			continue
		}
		hub.Mutex.RLock()
		clientCount := len(hub.Clients)
		roomactive := hub.Active
		hub.Mutex.RUnlock()

		ownRooms = append(ownRooms, RoomInfo{
			ID:          id,
			Name:        hub.Hubname,
			ClientCount: clientCount,
			RoomActive:  roomactive,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ownRooms)
}
