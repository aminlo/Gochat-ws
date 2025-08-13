package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/aminlo/Gochat-ws/internal/handler"
	"github.com/aminlo/Gochat-ws/internal/sql/db"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

func main() {

	err := godotenv.Load(".env")
	if err != nil {
		log.Printf(".env unreadable: %v", err)
	}

	dbURL := os.Getenv("DATABASE_URL")
	dblink, err := sql.Open("libsql", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer dblink.Close()

	// to ensure connection works
	if err := dblink.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	DbQueries := db.New(dblink)

	Cfg := &handler.Config{
		JWTstring: os.Getenv("JWT_SECRET"),
		DbQueries: DbQueries,
	}
	r := chi.NewRouter()
	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://gochat-proj.web.app"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true }
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))
	r.Group(func(r chi.Router) {
		r.Use(middleware.Logger)
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Hello World!!!!!! Im on GCP"))
		})
		r.Get("/ws/{hubid}", handler.Webshandler)
		r.Get("/roomlist", handler.ListRoomsHandler)
		r.Post("/login", Cfg.Userlogin)
		r.Post("/singup", Cfg.Usersignup)
		r.Route("/au", func(r chi.Router) {
			r.Use(Cfg.RequireAuth)
			r.Get("/ownrooms", Cfg.Ownroomshandler)
			r.Get("/ws/{hubid}", handler.Webshandler)
			r.Post("/create", Cfg.Createhubhandler)
			r.Put("/updateroom/{hubid}", Cfg.Updatehubhandler)
			r.Delete("/deleteroom/{hubid}", Cfg.Deletehubhandler)
			r.Post("/run/{hubid}", Cfg.Runhubhandler)
			r.Get("/verify", Cfg.VerifyUser)
			// r.Get("/profile", handler.ListRoomsHandler)
		})

	})

	log.Printf("Starting server on port 3000")
	http.ListenAndServe(":3000", r)

}
