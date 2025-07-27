package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
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

func serveWs(hub *models.Hub, w http.ResponseWriter, r *http.Request, user db.User) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	// Get username from query parameters

	client := &models.Client{
		UserID:   user.ID,
		Username: user.Username,
		Conn:     conn,
		Hub:      hub,
		Send:     make(chan *models.Message, 256),
	}
	log.Printf("Client created - UserID: %s, Username: %s", client.UserID, client.Username)
	client.Hub.Register <- client

	// thi allows for continous write and read pump, seperated for functionality and cleanliness
	go client.WritePump()
	go client.ReadPump()
}

func Webshandler(w http.ResponseWriter, r *http.Request) {
	var user db.User
	authuser, ok := r.Context().Value(contextKey("user")).(db.User)
	if !ok {
		user = db.User{
			ID:       uuid.New().String(),
			Username: "Anonymous" + uuid.New().String()[:4],
		}
	} else {
		user = authuser
	}

	hubid := chi.URLParam(r, "hubid")
	roomsMutex.RLock()
	hub := rooms[hubid]
	roomsMutex.RUnlock()

	if hub == nil {
		http.Error(w, "Hub not found", http.StatusNotFound)
		return
	}
	if !hub.Active {
		http.Error(w, "Hub is not active", http.StatusServiceUnavailable)
		return
	}
	serveWs(hub, w, r, user)
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
		Mutex:      sync.RWMutex{},
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

func (cfg *Config) Runhubhandler(w http.ResponseWriter, r *http.Request) {
	hubid := chi.URLParam(r, "hubid")
	roomsMutex.RLock()
	hub := rooms[hubid]
	roomsMutex.RUnlock()

	if hub == nil {
		dbHub, err := cfg.DbQueries.GetHub(r.Context(), hubid)
		if err != nil {
			http.Error(w, "Hub not found", http.StatusNotFound)
			return
		}
		hub = &Hub{
			Owner:      dbHub.OwnerID,
			Hubname:    dbHub.Name,
			Hubid:      dbHub.ID,
			Clients:    make(map[*models.Client]bool),
			Broadcast:  make(chan *models.Message),
			Register:   make(chan *models.Client),
			Unregister: make(chan *models.Client),
			Active:     false,
			Messages:   []*models.Message{},
			Mutex:      sync.RWMutex{},
		}
		roomsMutex.Lock()
		rooms[hubid] = hub
		roomsMutex.Unlock()
	}
	if !hub.Active {
		hub.Active = true
		err := cfg.DbQueries.UpdateRoomActive(r.Context(), db.UpdateRoomActiveParams{
			Active: hub.Active,
			ID:     hubid,
		})

		if err != nil {
			http.Error(w, "Failed to update hub status", http.StatusInternalServerError)
			return
		}

		go hub.Run()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "running"})

}

type RoomInfo struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	ClientCount  int    `json:"client_count"`
	RoomActive   bool   `json:"roomactive"`
	Description  string `json:"description,omitempty"`
	OwnerID      string `json:"owner_id,omitempty"`
	SaveMessages bool   `json:"save_messages,omitempty"`
	CreatedAt    string `json:"created_at,omitempty"`
	UpdatedAt    string `json:"updated_at,omitempty"`
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

type RoomList []RoomInfo

func (cfg *Config) Ownroomshandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(contextKey("user")).(db.User)
	if !ok {
		http.Error(w, "Unauthorized (own rooms)", http.StatusUnauthorized)
		return
	}

	userHubs, err := cfg.DbQueries.GetUsersHubs(r.Context(), user.ID)
	if err != nil {
		http.Error(w, "Failed to fetch user hubs", http.StatusInternalServerError)
		log.Println("Error fetching user hubs:", err)
		return
	}
	var ownRooms []RoomInfo

	for _, hub := range userHubs {
		room, exists := rooms[hub.ID]
		clientCount := 0
		roomActive := false
		if exists {
			room.Mutex.RLock()
			clientCount = len(room.Clients)
			roomActive = room.Active
			room.Mutex.RUnlock()
		}
		ownRooms = append(ownRooms, RoomInfo{
			ID:           hub.ID,
			Name:         hub.Name,
			ClientCount:  clientCount,
			RoomActive:   roomActive,
			Description:  hub.Description.String,
			SaveMessages: hub.SaveMessages,
			CreatedAt:    hub.CreatedAt.String(),
			UpdatedAt:    hub.UpdatedAt.String(),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ownRooms)
}

type UpdateHubReq struct {
	Name         *string `json:"name"`
	Description  *string `json:"description"`
	SaveMessages *bool   `json:"save_messages"`
}

func (cfg *Config) Updatehubhandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(contextKey("user")).(db.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	hubid := chi.URLParam(r, "hubid")
	if hubid == "" {
		http.Error(w, "Missing hub ID", http.StatusBadRequest)
		return
	}

	var req UpdateHubReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Fetch hub from DB to check ownership
	hub, err := cfg.DbQueries.GetHub(r.Context(), hubid)
	if err != nil {
		http.Error(w, "Hub not found", http.StatusNotFound)
		return
	}
	if hub.OwnerID != user.ID {
		http.Error(w, "Forbidden, not your room", http.StatusForbidden)
		return
	}

	params := db.UpdateRoomsParams{
		Name:         *req.Name,
		SaveMessages: *req.SaveMessages,
	}
	if req.Description != nil {
		params.Description = sql.NullString{String: *req.Description, Valid: true}
	} else {
		params.Description = sql.NullString{Valid: false}
	}

	err = cfg.DbQueries.UpdateRooms(r.Context(), params)
	if err != nil {
		http.Error(w, "Failed to update hub", http.StatusInternalServerError)
		return
	}

	// check for if in memory exists
	roomsMutex.Lock()
	memHub, exists := rooms[hubid]
	if exists {
		if req.Name != nil {
			memHub.Hubname = *req.Name
		}
		if req.Description != nil {
			memHub.Description = *req.Description
		}
		if req.SaveMessages != nil {
			memHub.SaveMessages = *req.SaveMessages
		}
	}
	roomsMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (cfg *Config) Deletehubhandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Beginigning delete func")
	user, ok := r.Context().Value(contextKey("user")).(db.User)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	hubid := chi.URLParam(r, "hubid")
	log.Printf("Attempting to delete hub with ID: %s", hubid)
	if hubid == "" {
		http.Error(w, "Missing hub ID", http.StatusBadRequest)
		return
	}

	hub, err := cfg.DbQueries.GetHub(r.Context(), hubid)
	if err != nil {
		http.Error(w, "Hub not found", http.StatusNotFound)
		log.Println(err)
		return
	}
	if hub.OwnerID != user.ID {
		http.Error(w, "Forbidden, not your room", http.StatusForbidden)
		return
	}

	err = cfg.DbQueries.DeleteHub(r.Context(), hubid)
	if err != nil {
		http.Error(w, "Failed to delete hub", http.StatusInternalServerError)
		return
	}

	// delete in memory
	roomsMutex.Lock()
	delete(rooms, hubid)
	roomsMutex.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
