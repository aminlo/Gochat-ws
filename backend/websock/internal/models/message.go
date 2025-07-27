package models

import (
	"time"
)

type Message struct {
	Type      string                   `json:"type"`
	Message   string                   `json:"message"`
	User      map[string]interface{}   `json:"user"`
	Users     []map[string]interface{} `json:"users"`
	Timestamp time.Time                `json:"timestamp"`
	MessageID string                   `json:"-"`
}

type MessageType string

const (
	MessageTypeText     MessageType = "text"
	MessageTypeJoin     MessageType = "join"
	MessageTypeLeave    MessageType = "leave"
	MessageTypeUserList MessageType = "user_list"
)

// could do typing, reaction also
