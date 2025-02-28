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
	Target                 string   `json:"target"`
	Ports                  []string `json:"ports,omitempty"`
	ScanType               string   `json:"scan_type,omitempty"` // "tcp", "udp", "syn", etc.
	Timeout                int      `json:"timeout,omitempty"`
	Intensity              string   `json:"intensity,omitempty"` // "light", "medium", "aggressive"
	EnableOSDetection      bool     `json:"enable_os_detection,omitempty"`
	EnableServiceDetection bool     `json:"enable_service_detection,omitempty"`
	VersionIntensity       int      `json:"version_intensity,omitempty"` // 0-9
	UseAllProbes           bool     `json:"use_all_probes,omitempty"`
	RunDefaultScripts      bool     `json:"run_default_scripts,omitempty"`
	CustomScripts          string   `json:"custom_scripts,omitempty"` // Comma-separated list of scripts
	ScriptArgs             string   `json:"script_args,omitempty"`
	TopPorts               int      `json:"top_ports,omitempty"`
	TimingTemplate         int      `json:"timing_template,omitempty"` // 0-5
	AggressiveScan         bool     `json:"aggressive_scan,omitempty"` // -A flag
	Verbose                bool     `json:"verbose,omitempty"`
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

// OSINT tool request structures
type EmailHarvestRequest struct {
	Domain    string `json:"domain"`
	Source    string `json:"source,omitempty"` // Specific source to search
	Limit     int    `json:"limit,omitempty"`  // Limit results count
	Timeout   int    `json:"timeout,omitempty"`
	AllEmails bool   `json:"all_emails,omitempty"` // Whether to find all emails
}

type SocialMediaSearchRequest struct {
	Username string   `json:"username"`
	Sites    []string `json:"sites,omitempty"` // Specific sites to search
	Timeout  int      `json:"timeout,omitempty"`
}

type MetadataExtractionRequest struct {
	Target  string `json:"target"`             // URL, domain or file
	FileExt string `json:"file_ext,omitempty"` // File extensions to search for
	Limit   int    `json:"limit,omitempty"`    // Limit of files to analyze
}

type ShodanSearchRequest struct {
	Query     string `json:"query"`
	IPAddress string `json:"ip_address,omitempty"` // If searching for a specific IP
	Port      int    `json:"port,omitempty"`       // Filter by specific port
	Page      int    `json:"page,omitempty"`       // Page number for results
	Limit     int    `json:"limit,omitempty"`      // Limit results count
}

type SpiderFootRequest struct {
	Target  string `json:"target"`            // Can be domain, email, IP, etc.
	Module  string `json:"module,omitempty"`  // Specific module to run
	Timeout int    `json:"timeout,omitempty"` // Timeout in minutes
}

// Response structure
type APIResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}
