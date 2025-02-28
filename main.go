package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"myaptai/api/handlers"

	"github.com/gorilla/mux"
)

// RequestTracker keeps track of active API requests
type RequestTracker struct {
	activeRequests map[string]time.Time
	mu             sync.Mutex
}

// NewRequestTracker creates a new request tracker
func NewRequestTracker() *RequestTracker {
	return &RequestTracker{
		activeRequests: make(map[string]time.Time),
	}
}

// AddRequest adds a request to the tracker
func (rt *RequestTracker) AddRequest(path string) {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	rt.activeRequests[path] = time.Now()
}

// RemoveRequest removes a request from the tracker
func (rt *RequestTracker) RemoveRequest(path string) time.Duration {
	rt.mu.Lock()
	defer rt.mu.Unlock()
	startTime, exists := rt.activeRequests[path]
	if exists {
		delete(rt.activeRequests, path)
		return time.Since(startTime)
	}
	return 0
}

// GetActiveRequests returns a copy of the active requests map
func (rt *RequestTracker) GetActiveRequests() map[string]time.Duration {
	rt.mu.Lock()
	defer rt.mu.Unlock()

	result := make(map[string]time.Duration)
	now := time.Now()
	for path, startTime := range rt.activeRequests {
		result[path] = now.Sub(startTime)
	}
	return result
}

// Global request tracker
var requestTracker *RequestTracker

// DebugHandler returns currently active requests
func debugHandler(w http.ResponseWriter, r *http.Request) {
	activeRequests := requestTracker.GetActiveRequests()

	// Convert to a more JSON-friendly format
	type ActiveRequest struct {
		Path     string        `json:"path"`
		Duration time.Duration `json:"duration"`
	}

	result := make([]ActiveRequest, 0, len(activeRequests))
	for path, duration := range activeRequests {
		result = append(result, ActiveRequest{
			Path:     path,
			Duration: duration,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Middleware for logging and security
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.Method + " " + r.URL.Path

		// Add request to tracker
		requestTracker.AddRequest(path)

		// Process the request
		log.Printf("Started %s", path)
		next.ServeHTTP(w, r)

		// Remove request from tracker
		duration := requestTracker.RemoveRequest(path)
		log.Printf("Completed %s in %v", path, duration)
	})
}

// DebugMonitor periodically logs active requests
func startDebugMonitor(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			activeRequests := requestTracker.GetActiveRequests()

			if len(activeRequests) > 0 {
				log.Printf("=== DEBUG: Currently running requests (%d) ===", len(activeRequests))
				for path, duration := range activeRequests {
					log.Printf("⏳ %s - running for %v", path, duration.Round(time.Millisecond))
				}
				log.Printf("==================================================")
			}
		}
	}()
}

func main() {
	// Initialize request tracker
	requestTracker = NewRequestTracker()

	// Start debug monitor to log active requests every 5 seconds
	startDebugMonitor(5 * time.Second)

	router := mux.NewRouter()

	// Apply middleware
	router.Use(loggingMiddleware)

	// Debug endpoint
	router.HandleFunc("/api/debug", debugHandler).Methods("GET")

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

	// OSINT tool routes
	recon.HandleFunc("/emailharvest", handlers.EmailHarvestHandler).Methods("POST")
	recon.HandleFunc("/socialmedia", handlers.SocialMediaSearchHandler).Methods("POST")
	recon.HandleFunc("/metadata", handlers.MetadataExtractionHandler).Methods("POST")
	recon.HandleFunc("/shodan", handlers.ShodanSearchHandler).Methods("POST")
	recon.HandleFunc("/spiderfoot", handlers.SpiderFootHandler).Methods("POST")

	// Future sections will be added here
	// vulnScan := router.PathPrefix("/api/vuln").Subrouter()
	// exploit := router.PathPrefix("/api/exploit").Subrouter()

	// Set up server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("APTAI Server running on port %s", port)
	log.Printf("Debug monitor active - reporting ongoing requests every 5 seconds")
	log.Printf("Available endpoints:")
	log.Printf("  POST /api/recon/whois")
	log.Printf("  POST /api/recon/ping")
	log.Printf("  POST /api/recon/dig")
	log.Printf("  POST /api/recon/portscan")
	log.Printf("  POST /api/recon/subdomains")
	log.Printf("  POST /api/recon/dnsenum")
	log.Printf("  POST /api/recon/webtech")
	log.Printf("  POST /api/recon/sslscan")
	log.Printf("  POST /api/recon/emailharvest")
	log.Printf("  POST /api/recon/socialmedia")
	log.Printf("  POST /api/recon/metadata")
	log.Printf("  POST /api/recon/shodan")
	log.Printf("  POST /api/recon/spiderfoot")

	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
}
