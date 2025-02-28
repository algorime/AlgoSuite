package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"myaptai/api/handlers"
)

// Middleware for logging and security
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("Started %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("Completed %s %s in %v", r.Method, r.URL.Path, time.Since(start))
	})
}

func main() {
	router := mux.NewRouter()

	// Apply middleware
	router.Use(loggingMiddleware)

	// Recon routes
	recon := router.PathPrefix("/api/recon").Subrouter()
	recon.HandleFunc("/whois", handlers.WhoisHandler).Methods("POST")
	recon.HandleFunc("/ping", handlers.PingHandler).Methods("POST")
	recon.HandleFunc("/dig", handlers.DigHandler).Methods("POST")
	recon.HandleFunc("/portscan", handlers.PortScanHandler).Methods("POST")
	recon.HandleFunc("/subdomains", handlers.SubdomainEnumHandler).Methods("POST")
	recon.HandleFunc("/dnsenum", handlers.DNSEnumHandler).Methods("POST")
	recon.HandleFunc("/webtech", handlers.WebTechHandler).Methods("POST")
	recon.HandleFunc("/sslscan", handlers.SSLScanHandler).Methods("POST")

	// Future sections will be added here
	// vulnScan := router.PathPrefix("/api/vuln").Subrouter()
	// exploit := router.PathPrefix("/api/exploit").Subrouter()

	// Set up server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("APTAI Server running on port %s", port)
	log.Printf("Available endpoints:")
	log.Printf("  POST /api/recon/whois")
	log.Printf("  POST /api/recon/ping")
	log.Printf("  POST /api/recon/dig")
	log.Printf("  POST /api/recon/portscan")
	log.Printf("  POST /api/recon/subdomains")
	log.Printf("  POST /api/recon/dnsenum")
	log.Printf("  POST /api/recon/webtech")
	log.Printf("  POST /api/recon/sslscan")

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
} 