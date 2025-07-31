package models

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type ClientMap struct {
	Map      map[string]*Client
	MapMutex sync.RWMutex
}
type Client struct {
	UserID   string          `json:"user_id"`
	Username string          `json:"username"`
	Conn     *websocket.Conn `json:"-"`
	Hub      *Hub            `json:"-"`
	Send     chan *Message   `json:"-"`
}

func (c *Client) ReadPump() {
	log.Printf("Client using hub at %p", c.Hub)
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, webcontentbytes, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}

		log.Printf("message came: %s", string(webcontentbytes))
		var incomingMsg struct {
			Message string      `json:"message"`
			Type    MessageType `json:"type"`
		}

		if err := json.Unmarshal(webcontentbytes, &incomingMsg); err != nil {
			log.Println("JSON unmarshal error:", err)
			continue
		}
		log.Println("Parsed message:", incomingMsg)
		// new message type, can expand future
		message := &Message{
			Type:    incomingMsg.Type,
			Message: incomingMsg.Message,
			User: map[string]interface{}{
				"id":       c.UserID,
				"username": c.Username,
			},
			Timestamp: time.Now(),
		}

		// Send to hub for broadcasting
		log.Println("Sending to hub:", message)
		c.Hub.Broadcast <- message
		log.Printf("Sent to hub.Broadcast")
	}
}

func (c *Client) WritePump() {
	message := &Message{
		Type:    MessageWhoami,
		Message: fmt.Sprintf("UserID: %s, Username: %s, Conn: %v, Hub: %v, Send: %v", c.UserID, c.Username, c.Conn, c.Hub, c.Send),
		User: map[string]interface{}{
			"id":       c.UserID,
			"username": c.Username,
		},
		Timestamp: time.Now(),
	}
	webcontentbytes, _ := json.Marshal(message)
	if err := c.Conn.WriteMessage(websocket.TextMessage, webcontentbytes); err != nil {
		log.Println("Write error:", err)

		for message := range c.Send {
			webcontentbytes, _ := json.Marshal(message)
			log.Printf("WritePump sending: %s", string(webcontentbytes))
			if err := c.Conn.WriteMessage(websocket.TextMessage, webcontentbytes); err != nil {
				log.Println("Write error:", err)
				return
			}
		}
		// Channel closed, send close message
		c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
	}
}
