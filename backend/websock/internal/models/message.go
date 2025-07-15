package models

import (
	"time"
)

type Message struct {
	ID        string    `json:"id"`
	Type      string    `json:"type"`
	Content   string    `json:"content"`
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	RoomID    string    `json:"room_id"`
	Timestamp time.Time `json:"timestamp"`
}

type MessageType string

const (
	MessageTypeText  MessageType = "text"
	MessageTypeJoin  MessageType = "join"
	MessageTypeLeave MessageType = "leave"
)

// could do typing, reaction also
