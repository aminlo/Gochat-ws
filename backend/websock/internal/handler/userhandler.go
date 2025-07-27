package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/aminlo/Gochat-ws/internal/auth"
	"github.com/aminlo/Gochat-ws/internal/sql/db"
	"github.com/google/uuid"
)

type contextKey string

func (h *Config) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		fmt.Println(cookie)
		if err != nil {
			http.Error(w, "(mid) Unauthorized", http.StatusUnauthorized)
			log.Println("(mid) auth failed: no token cookie")
			return
		}

		EmailID, err := auth.ValidateJWT(cookie.Value, h.JWTstring)
		if err != nil {
			log.Println("Validate errorr")
			http.Error(w, "(mid) Invalid token", http.StatusUnauthorized)
			return
		}
		user, err := h.DbQueries.GetUserByEmail(r.Context(), EmailID)
		if err != nil {
			http.Error(w, "(mid) User not found", http.StatusUnauthorized)
			log.Println("(mid) auth failed: user not found:", err)
			return
		}
		ctx := context.WithValue(r.Context(), contextKey("user"), user)
		log.Println("Now serving next func")
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type Loginreq struct {
	Emailid  string `json:"email"`
	Password string `json:"password"`
}

func (cfg *Config) Userlogin(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var login Loginreq
	if err := json.NewDecoder(r.Body).Decode(&login); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body", "details": err.Error()})
		return
	}
	user, err := cfg.DbQueries.GetUserByEmail(r.Context(), login.Emailid)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "idk", "details": err.Error()})
		return
	}
	err = auth.CheckPasswordHash(login.Password, user.HashedPassword)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "wrongff pw buiddy", "details": err.Error()})
		return
	}

	jwtmade, err := auth.MakeJWT(user.Email, cfg.JWTstring, 3600*time.Second)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create JWT", "details": err.Error()})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    jwtmade,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(3600 * time.Second),
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"username":   user.Username,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
		"email":      user.Email,
	})

}

func (cfg *Config) VerifyUser(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(contextKey("user")).(db.User)
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "User not found in context"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
		"email":      user.Email,
		"username":   user.Username,
	})
}

type Signupdetails struct {
	Emailid  string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func (cfg *Config) Usersignup(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	log.Println("new user sign")

	var userstruct Signupdetails
	if err := json.NewDecoder(r.Body).Decode(&userstruct); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		log.Println("bad req")
		return
	}
	// email stored
	hashedpass, err := auth.HashPassword(userstruct.Password)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to hash pass", "details": err.Error()})
		log.Println("bad reqsss")
		return
	}
	log.Println(userstruct)
	user, err := cfg.DbQueries.CreateUser(r.Context(), db.CreateUserParams{
		ID:             uuid.New().String(),
		Email:          userstruct.Emailid,
		Username:       userstruct.Username,
		HashedPassword: hashedpass,
	})

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create user", "details": err.Error()})
		log.Println("bad reqs222ss", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":         user.ID,
		"username":   user.Username,
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
		"email":      user.Email,
	})

}
