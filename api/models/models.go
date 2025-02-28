package models

// Request structures
type WhoisRequest struct {
	Domain string `json:"domain"`
}

type PingRequest struct {
	Target  string `json:"target"`
	Count   int    `json:"count,omitempty"`
	Timeout int    `json:"timeout,omitempty"`
}

type DigRequest struct {
	Domain string `json:"domain"`
}

// New request structures for additional recon tools
type PortScanRequest struct {
	Target    string   `json:"target"`
	Ports     []string `json:"ports,omitempty"`
	ScanType  string   `json:"scan_type,omitempty"` // "tcp", "udp", "syn", etc.
	Timeout   int      `json:"timeout,omitempty"`
	Intensity string   `json:"intensity,omitempty"` // "light", "medium", "aggressive"
}

type SubdomainEnumRequest struct {
	Domain     string `json:"domain"`
	Recursive  bool   `json:"recursive,omitempty"`
	Wordlist   string `json:"wordlist,omitempty"`
	Depth      int    `json:"depth,omitempty"`
	UsePassive bool   `json:"use_passive,omitempty"` // Use passive sources like certificate transparency logs
}

type DNSEnumRequest struct {
	Domain      string   `json:"domain"`
	RecordTypes []string `json:"record_types,omitempty"` // A, AAAA, MX, NS, TXT, etc.
}

type WebTechRequest struct {
	Target string `json:"target"`
	Depth  int    `json:"depth,omitempty"` // How deep to crawl
}

type SSLScanRequest struct {
	Target string `json:"target"`
	Port   int    `json:"port,omitempty"`
}

// Response structure
type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
