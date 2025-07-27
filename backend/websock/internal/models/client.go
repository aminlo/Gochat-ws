package models

import (
	"encoding/json"
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

		var incomingMsg struct {
			Message string `json:"message"`
			Type    string `json:"type"`
		}

		if err := json.Unmarshal(webcontentbytes, &incomingMsg); err != nil {
			log.Println("JSON unmarshal error:", err)
			continue
		}

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
		c.Hub.Broadcast <- message
	}
}

func (c *Client) WritePump() {

	for message := range c.Send {
		webcontentbytes, _ := json.Marshal(message)
		if err := c.Conn.WriteMessage(websocket.TextMessage, webcontentbytes); err != nil {
			log.Println("Write error:", err)
			return
		}
	}
	// Channel closed, send close message
	c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
}
