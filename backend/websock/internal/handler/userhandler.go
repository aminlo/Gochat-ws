package handler

import (
	"context"
	"encoding/json"
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
		token, err := auth.GetBearerToken(r.Header)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			log.Println("fail auyth")
			return
		}

		userID, err := auth.ValidateJWT(token, h.JWTstring)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), contextKey("userID"), userID)
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
	user, err := cfg.DbQueries.GetPwByEmail(r.Context(), login.Emailid)
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

	jwtmade, err := auth.MakeJWT(user.ID, cfg.JWTstring, 3600*time.Second)
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
		"created_at": user.CreatedAt,
		"updated_at": user.UpdatedAt,
		"email":      user.Email,
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
