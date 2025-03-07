package handlers

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"

	"myaptai/api/models"
	"myaptai/api/utils"

	"github.com/likexian/whois"
)

// WhoisHandler handles WHOIS lookup requests
func WhoisHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.WhoisRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Domain == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Domain is required",
		})
		return
	}

	result, err := whois.Whois(req.Domain)
	if err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: fmt.Sprintf("Error performing WHOIS lookup: %v", err),
		})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   result,
	})
}

// PingHandler handles ping requests
func PingHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.PingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Target == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Target is required",
		})
		return
	}

	// Set defaults if not provided
	count := 4
	if req.Count > 0 {
		count = req.Count
	}

	timeout := 2
	if req.Timeout > 0 {
		timeout = req.Timeout
	}

	// Construct ping command
	var cmd *exec.Cmd
	if isWindows() {
		cmd = exec.Command("ping", "-n", strconv.Itoa(count), "-w", strconv.Itoa(timeout*1000), req.Target)
	} else {
		cmd = exec.Command("ping", "-c", strconv.Itoa(count), "-W", strconv.Itoa(timeout), req.Target)
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: fmt.Sprintf("Error executing ping: %v", err),
			Data:    string(output),
		})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   string(output),
	})
}

// DigHandler handles DNS lookup requests
func DigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.DigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Domain == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Domain is required",
		})
		return
	}

	// Use dig if available, otherwise use nslookup
	var cmd *exec.Cmd
	if commandExists("dig") {
		cmd = exec.Command("dig", "+nocmd", req.Domain, "+noall", "+answer")
	} else if commandExists("nslookup") {
		cmd = exec.Command("nslookup", req.Domain)
	} else {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "No DNS lookup tool available on the system",
		})
		return
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: fmt.Sprintf("Error executing DNS lookup: %v", err),
			Data:    string(output),
		})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   string(output),
	})
}

// PortScanHandler handles port scanning requests
func PortScanHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.PortScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	// Log the request parameters for debugging
	log.Printf("[DEBUG] Port scan request: Target=%s, TopPorts=%d, EnableServiceDetection=%v, RunDefaultScripts=%v, Intensity=%s",
		req.Target, req.TopPorts, req.EnableServiceDetection, req.RunDefaultScripts, req.Intensity)

	if req.Target == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Target is required",
		})
		return
	}

	// Set defaults
	timeout := 2
	if req.Timeout > 0 {
		timeout = req.Timeout
	}

	// Default ports if none specified
	ports := []string{"21", "22", "23", "25", "53", "80", "110", "111", "135", "139", "143", "443", "445", "993", "995", "1723", "3306", "3389", "5900", "8080"}
	if len(req.Ports) > 0 {
		ports = req.Ports
	}

	// Use nmap if available, otherwise use a simple TCP connect scan
	var result string
	if commandExists("nmap") {
		// Start with an empty args slice - we'll determine timing template based on settings
		args := []string{}

		// Default timing template
		timingTemplate := 4 // Default to T4

		// Add scan type if specified
		if req.ScanType != "" {
			switch req.ScanType {
			case "syn":
				args = append(args, "-sS")
			case "udp":
				args = append(args, "-sU")
			case "tcp":
				args = append(args, "-sT")
			}
		}

		// Set intensity based on the parameter or use custom settings
		if req.Intensity != "" {
			switch req.Intensity {
			case "aggressive":
				args = append(args, "-A")
				// Keep default T4 for aggressive
			case "light":
				// Lighter scan - use T3 and limit retries
				timingTemplate = 3
				//args = append(args, "--max-retries", "2")
			case "medium":
				// Keep default T4 for medium
			}

			// Still apply service detection and script scanning if requested
			// even when intensity is set
			if req.EnableServiceDetection {
				args = append(args, "-sV")
			}

			if req.RunDefaultScripts {
				args = append(args, "-sC")
			}
		} else {
			// Process individual settings if intensity is not set

			// Add OS detection if enabled
			if req.EnableOSDetection {
				args = append(args, "-O")
			}

			// Add service version detection if enabled
			if req.EnableServiceDetection {
				args = append(args, "-sV")
			}

			// Add version detection intensity
			if req.VersionIntensity > 0 && req.VersionIntensity <= 9 {
				args = append(args, "--version-intensity", strconv.Itoa(req.VersionIntensity))
			}

			// Use all version detection probes
			if req.UseAllProbes {
				args = append(args, "--version-all")
			}

			// Add default script scanning
			if req.RunDefaultScripts {
				args = append(args, "-sC")
			}

			// Add custom scripts if specified
			if req.CustomScripts != "" {
				args = append(args, "--script", req.CustomScripts)
			}

			// Add script arguments if specified
			if req.ScriptArgs != "" {
				args = append(args, "--script-args", req.ScriptArgs)
			}

			// Add aggressive scan option (combines -O -sV -sC --traceroute)
			if req.AggressiveScan {
				args = append(args, "-A")
			}
		}

		// Add timing template after other options have been processed
		// Only override the timing template if explicitly provided in the request
		if req.TimingTemplate > 0 && req.TimingTemplate <= 5 {
			// Override with user-specified timing template
			timingTemplate = req.TimingTemplate
		}

		// Now add the timing template
		args = append(args, fmt.Sprintf("-T%d", timingTemplate))

		// Check for top ports option
		if req.TopPorts > 0 {
			log.Printf("[DEBUG] Using --top-ports %d", req.TopPorts)
			args = append(args, "--top-ports", strconv.Itoa(req.TopPorts))
		} else {
			log.Printf("[DEBUG] Using specific ports: %v", ports)
			// Add ports if top-ports not specified
			args = append(args, "-p", strings.Join(ports, ","))
		}

		// Add verbosity level
		if req.Verbose {
			args = append(args, "-v")
		}

		// Add target
		args = append(args, req.Target)

		log.Printf("[DEBUG] Executing nmap command: nmap %s", strings.Join(args, " "))

		cmd := exec.Command("nmap", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing port scan: %v", err),
				Data:    string(output),
			})
			return
		}
		result = string(output)
	} else {
		// Simple TCP connect scan
		results := make(map[string]string)
		for _, port := range ports {
			portNum, _ := strconv.Atoi(port)
			address := fmt.Sprintf("%s:%d", req.Target, portNum)
			conn, err := net.DialTimeout("tcp", address, time.Duration(timeout)*time.Second)

			if err != nil {
				results[port] = "closed"
			} else {
				conn.Close()
				results[port] = "open"
			}
		}

		resultBytes, _ := json.MarshalIndent(results, "", "  ")
		result = string(resultBytes)
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   result,
	})
}

// SubdomainEnumHandler handles subdomain enumeration requests
func SubdomainEnumHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.SubdomainEnumRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Domain == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Domain is required",
		})
		return
	}

	// Check if we have specialized tools
	if commandExists("amass") {
		// Use Amass for subdomain enumeration
		args := []string{"enum", "-d", req.Domain}

		if req.UsePassive {
			args = append(args, "-passive")
		}

		cmd := exec.Command("amass", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing subdomain enumeration: %v", err),
				Data:    string(output),
			})
			return
		}

		// Parse the output to extract subdomains
		subdomains := parseSubdomains(string(output), req.Domain)

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   subdomains,
		})
		return
	}

	// Fallback to DNS lookup for common subdomains
	commonSubdomains := []string{"www", "mail", "remote", "blog", "webmail", "server", "ns1", "ns2", "smtp", "secure", "vpn", "m", "shop", "ftp", "api"}

	results := make(map[string]string)
	for _, sub := range commonSubdomains {
		subdomain := fmt.Sprintf("%s.%s", sub, req.Domain)
		_, err := net.LookupHost(subdomain)
		if err == nil {
			results[subdomain] = "found"
		}
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   results,
	})
}

// DNSEnumHandler handles comprehensive DNS enumeration
func DNSEnumHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.DNSEnumRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Domain == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Domain is required",
		})
		return
	}

	// Default record types if none specified
	recordTypes := []string{"A", "AAAA", "MX", "NS", "TXT", "SOA", "CNAME"}
	if len(req.RecordTypes) > 0 {
		recordTypes = req.RecordTypes
	}

	results := make(map[string]interface{})

	for _, recordType := range recordTypes {
		switch recordType {
		case "A":
			ips, err := net.LookupIP(req.Domain)
			if err == nil {
				var ipStrings []string
				for _, ip := range ips {
					if ipv4 := ip.To4(); ipv4 != nil {
						ipStrings = append(ipStrings, ipv4.String())
					}
				}
				results["A"] = ipStrings
			}
		case "AAAA":
			ips, err := net.LookupIP(req.Domain)
			if err == nil {
				var ipv6Strings []string
				for _, ip := range ips {
					if ipv4 := ip.To4(); ipv4 == nil {
						ipv6Strings = append(ipv6Strings, ip.String())
					}
				}
				results["AAAA"] = ipv6Strings
			}
		case "MX":
			mxRecords, err := net.LookupMX(req.Domain)
			if err == nil {
				var mxStrings []string
				for _, mx := range mxRecords {
					mxStrings = append(mxStrings, fmt.Sprintf("%s (priority: %d)", mx.Host, mx.Pref))
				}
				results["MX"] = mxStrings
			}
		case "NS":
			nsRecords, err := net.LookupNS(req.Domain)
			if err == nil {
				var nsStrings []string
				for _, ns := range nsRecords {
					nsStrings = append(nsStrings, ns.Host)
				}
				results["NS"] = nsStrings
			}
		case "TXT":
			txtRecords, err := net.LookupTXT(req.Domain)
			if err == nil {
				results["TXT"] = txtRecords
			}
		case "CNAME":
			cname, err := net.LookupCNAME(req.Domain)
			if err == nil {
				results["CNAME"] = cname
			}
		}
	}

	// If we have dig, use it for more comprehensive results
	if commandExists("dig") {
		for _, recordType := range recordTypes {
			cmd := exec.Command("dig", req.Domain, recordType, "+short")
			output, err := cmd.CombinedOutput()
			if err == nil && len(output) > 0 {
				lines := strings.Split(strings.TrimSpace(string(output)), "\n")
				if len(lines) > 0 && lines[0] != "" {
					results["DIG_"+recordType] = lines
				}
			}
		}
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   results,
	})
}

// WebTechHandler identifies technologies used by a website
func WebTechHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.WebTechRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Target == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Target is required",
		})
		return
	}

	// Ensure target has http/https prefix
	target := req.Target
	if !strings.HasPrefix(target, "http://") && !strings.HasPrefix(target, "https://") {
		target = "http://" + target
	}

	// Check if we have specialized tools
	if commandExists("whatweb") {
		// Use more compatible options for WhatWeb
		cmd := exec.Command("whatweb", "-a", "3", "--log-json", "-", "--colour", "never")

		// Remove the unsupported --max-links option
		// Instead, we'll use the -d option for depth if available
		if req.Depth > 0 && commandExists("grep") {
			// Check if -d option is supported
			checkCmd := exec.Command("whatweb", "--help")
			helpOutput, _ := checkCmd.CombinedOutput()
			if strings.Contains(string(helpOutput), "-d, --depth") {
				cmd.Args = append(cmd.Args, "-d", strconv.Itoa(req.Depth))
			}
		}

		cmd.Args = append(cmd.Args, target)

		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing web technology detection: %v", err),
				Data:    string(output),
			})
			return
		}

		// Parse the JSON output
		var result interface{}
		if err := json.Unmarshal(output, &result); err != nil {
			// If JSON parsing fails, return the raw output
			json.NewEncoder(w).Encode(models.APIResponse{
				Status: "success",
				Data:   string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   result,
		})
		return
	}

	// Fallback to basic HTTP request and header analysis
	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return nil // Allow redirects
		},
	}

	resp, err := client.Get(target)
	if err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: fmt.Sprintf("Error making HTTP request: %v", err),
		})
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: fmt.Sprintf("Error reading response body: %v", err),
		})
		return
	}

	// Basic technology detection
	technologies := detectWebTechnologies(resp.Header, string(body))

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   technologies,
	})
}

// SSLScanHandler performs SSL/TLS analysis
func SSLScanHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.SSLScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Target == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Target is required",
		})
		return
	}

	// Set default port if not specified
	port := 443
	if req.Port > 0 {
		port = req.Port
	}

	// Check if we have specialized tools
	if commandExists("sslscan") {
		target := fmt.Sprintf("%s:%d", req.Target, port)
		cmd := exec.Command("sslscan", "--no-colour", target)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing SSL scan: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	// Fallback to basic TLS connection and certificate analysis
	target := fmt.Sprintf("%s:%d", req.Target, port)
	conn, err := tls.Dial("tcp", target, &tls.Config{
		InsecureSkipVerify: true,
	})
	if err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: fmt.Sprintf("Error establishing TLS connection: %v", err),
		})
		return
	}
	defer conn.Close()

	// Get connection state
	state := conn.ConnectionState()

	// Extract certificate details
	cert := state.PeerCertificates[0]

	result := map[string]interface{}{
		"subject":             cert.Subject.String(),
		"issuer":              cert.Issuer.String(),
		"valid_from":          cert.NotBefore.String(),
		"valid_until":         cert.NotAfter.String(),
		"dns_names":           cert.DNSNames,
		"version":             cert.Version,
		"serial_number":       cert.SerialNumber.String(),
		"tls_version":         tlsVersionToString(state.Version),
		"cipher_suite":        tls.CipherSuiteName(state.CipherSuite),
		"certificate_chain":   len(state.PeerCertificates),
		"certificate_expired": time.Now().After(cert.NotAfter),
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   result,
	})
}

// EmailHarvestHandler handles email harvesting using tools like theHarvester
func EmailHarvestHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.EmailHarvestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Domain == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Domain is required",
		})
		return
	}

	// Check if we have theHarvester
	harvesterPath := os.Getenv("THEHARVESTER_PATH")
	if harvesterPath == "" {
		harvesterPath = "theHarvester" // Default to PATH lookup
	}

	if commandExists(harvesterPath) {
		// theHarvester args: Fix the timeout argument
		args := []string{"-d", req.Domain, "-b", "all"}

		if req.Source != "" {
			args = []string{"-d", req.Domain, "-b", req.Source}
		}

		// Set limit if specified
		if req.Limit > 0 {
			args = append(args, "-l", strconv.Itoa(req.Limit))
		}

		// Add the -t flag for DNS TLD expansion if requested
		// Note: -t is a flag without a value
		args = append(args, "-t")

		cmd := exec.Command(harvesterPath, args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing email harvest: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	// Alternative: h8mail if available
	h8mailPath := os.Getenv("H8MAIL_PATH")
	if h8mailPath == "" {
		h8mailPath = "h8mail" // Default to PATH lookup
	}

	if commandExists(h8mailPath) {
		args := []string{"-t", req.Domain, "-c"}
		cmd := exec.Command(h8mailPath, args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing email harvest with h8mail: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status:  "error",
		Message: "No email harvesting tool available on the system",
	})
}

// SocialMediaSearchHandler handles username search across social platforms
func SocialMediaSearchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.SocialMediaSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Username == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Username is required",
		})
		return
	}

	// Set defaults
	timeout := 60
	if req.Timeout > 0 {
		timeout = req.Timeout
	}

	// Check if we have sherlock
	sherlockPath := os.Getenv("SHERLOCK_PATH")
	if sherlockPath == "" {
		sherlockPath = "sherlock" // Default to PATH lookup
	}

	if commandExists(sherlockPath) {
		args := []string{req.Username, "--timeout", strconv.Itoa(timeout)}

		// Add specific sites if requested
		if len(req.Sites) > 0 {
			args = append(args, "--site")
			args = append(args, req.Sites...)
		}

		cmd := exec.Command(sherlockPath, args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			// Note: sherlock may return non-zero exit code even when successful
			// due to sites being down, so we still return the output
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "partial_success",
				Message: fmt.Sprintf("Sherlock exited with code: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	// Alternative: Check if we have social-analyzer
	socialAnalyzerPath := os.Getenv("SOCIAL_ANALYZER_PATH")
	if socialAnalyzerPath == "" {
		socialAnalyzerPath = "social-analyzer" // Default to PATH lookup
	}

	if commandExists(socialAnalyzerPath) {
		args := []string{"--username", req.Username, "--output", "json"}

		cmd := exec.Command(socialAnalyzerPath, args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing social-analyzer: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status:  "error",
		Message: "No social media search tool available on the system",
	})
}

// MetadataExtractionHandler handles document metadata extraction
func MetadataExtractionHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.MetadataExtractionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Target == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Target is required",
		})
		return
	}

	// Check if we have metagoofil
	metagoofilPath := os.Getenv("METAGOOFIL_PATH")
	if metagoofilPath == "" {
		metagoofilPath = "metagoofil" // Default to PATH lookup
	}

	// Determine if the target is a URL, domain, or local file
	isURL := strings.HasPrefix(req.Target, "http://") || strings.HasPrefix(req.Target, "https://")
	isFile := fileExists(req.Target)
	isDomain := !isURL && !isFile && strings.Contains(req.Target, ".")

	if commandExists(metagoofilPath) && isDomain {
		// If target is a domain, use metagoofil properly
		args := []string{"-d", req.Target}

		// Set file extensions if specified
		if req.FileExt != "" {
			args = append(args, "-t", req.FileExt)
		} else {
			// Default extensions
			args = append(args, "-t", "pdf,doc,docx,ppt,pptx,xls,xlsx")
		}

		// Set limit if specified
		if req.Limit > 0 {
			args = append(args, "-l", strconv.Itoa(req.Limit))
		}

		// Create temporary output directory
		tempDir, err := ioutil.TempDir("", "metagoofil")
		if err == nil {
			defer os.RemoveAll(tempDir) // Clean up when done
			args = append(args, "-o", tempDir)
		}

		cmd := exec.Command(metagoofilPath, args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing metadata extraction: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	} else if commandExists("exiftool") {
		// For exiftool, we need a file path or URL to a file
		if isFile {
			// Direct file path
			cmd := exec.Command("exiftool", req.Target)
			output, err := cmd.CombinedOutput()
			if err != nil {
				json.NewEncoder(w).Encode(models.APIResponse{
					Status:  "error",
					Message: fmt.Sprintf("Error executing exiftool: %v", err),
					Data:    string(output),
				})
				return
			}

			json.NewEncoder(w).Encode(models.APIResponse{
				Status: "success",
				Data:   string(output),
			})
			return
		} else if isURL {
			// If it's a URL to a file, download it first
			tempFile, err := downloadFile(req.Target)
			if err != nil {
				json.NewEncoder(w).Encode(models.APIResponse{
					Status:  "error",
					Message: fmt.Sprintf("Error downloading file: %v", err),
				})
				return
			}
			defer os.Remove(tempFile) // Clean up when done

			cmd := exec.Command("exiftool", tempFile)
			output, err := cmd.CombinedOutput()
			if err != nil {
				json.NewEncoder(w).Encode(models.APIResponse{
					Status:  "error",
					Message: fmt.Sprintf("Error executing exiftool: %v", err),
					Data:    string(output),
				})
				return
			}

			json.NewEncoder(w).Encode(models.APIResponse{
				Status: "success",
				Data:   string(output),
			})
			return
		} else if isDomain {
			// For domains, provide a clear message
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "info",
				Message: "Metadata extraction for domains requires document URLs rather than domain names",
				Data:    fmt.Sprintf("To extract metadata, provide direct URLs to documents on %s instead of just the domain name.", req.Target),
			})
			return
		}
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status:  "error",
		Message: "No metadata extraction tool available or target type not supported",
	})
}

// downloadFile downloads a file from URL to a temporary file and returns the path
func downloadFile(url string) (string, error) {
	// Create temporary file
	tempFile, err := ioutil.TempFile("", "download-*")
	if err != nil {
		return "", err
	}
	defer tempFile.Close()

	// Download the file
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Check server response
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %s", resp.Status)
	}

	// Writer the body to file
	_, err = io.Copy(tempFile, resp.Body)
	if err != nil {
		return "", err
	}

	return tempFile.Name(), nil
}

// ShodanSearchHandler handles Shodan API searches
func ShodanSearchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.ShodanSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	// Check if we have either a query or an IP address
	if req.Query == "" && req.IPAddress == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Either a query or an IP address is required",
		})
		return
	}

	// Check if we have shodan CLI
	shodanPath := os.Getenv("SHODAN_CLI_PATH")
	if shodanPath == "" {
		shodanPath = "shodan" // Default to PATH lookup
	}

	// First try to use the Shodan CLI
	if commandExists(shodanPath) {
		var cmd *exec.Cmd

		// If an IP is specified, do a host lookup
		if req.IPAddress != "" {
			cmd = exec.Command(shodanPath, "host", req.IPAddress)
		} else {
			// Otherwise do a search
			args := []string{"search"}

			// Add port filter if specified
			if req.Port > 0 {
				req.Query = fmt.Sprintf("%s port:%d", req.Query, req.Port)
			}

			args = append(args, req.Query)
			cmd = exec.Command(shodanPath, args...)
		}

		output, err := cmd.CombinedOutput()
		if err != nil {
			// If the CLI fails and we have an IP address, try the fallback method
			if req.IPAddress != "" {
				fallbackResult, fallbackErr := utils.ShodanIPLookup(req.IPAddress)
				if fallbackErr == nil {
					json.NewEncoder(w).Encode(models.APIResponse{
						Status:  "success",
						Message: "Used fallback HTTP search due to CLI error",
						Data:    fallbackResult,
					})
					return
				}
			}

			// If we have a hostname query, try to resolve to IP and use the fallback
			if req.Query != "" && strings.Contains(req.Query, "hostname:") {
				// Extract domain from hostname:domain.com
				domain := strings.TrimPrefix(req.Query, "hostname:")
				ips, err := net.LookupIP(domain)
				if err == nil && len(ips) > 0 {
					ipStr := ips[0].String()
					fallbackResult, fallbackErr := utils.ShodanIPLookup(ipStr)
					if fallbackErr == nil {
						json.NewEncoder(w).Encode(models.APIResponse{
							Status:  "success",
							Message: fmt.Sprintf("Used fallback HTTP search for IP %s (resolved from %s)", ipStr, domain),
							Data:    fallbackResult,
						})
						return
					}
				}
			}

			// If fallback also fails, return the original error
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing Shodan search: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	// If CLI not available but we have an IP address, try the fallback method
	if req.IPAddress != "" {
		fallbackResult, fallbackErr := utils.ShodanIPLookup(req.IPAddress)
		if fallbackErr == nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "success",
				Message: "Used HTTP search as CLI was not available",
				Data:    fallbackResult,
			})
			return
		}
	}

	// If we have a hostname query, try to resolve to IP and use the fallback
	if req.Query != "" && strings.Contains(req.Query, "hostname:") {
		// Extract domain from hostname:domain.com
		domain := strings.TrimPrefix(req.Query, "hostname:")
		ips, err := net.LookupIP(domain)
		if err == nil && len(ips) > 0 {
			ipStr := ips[0].String()
			fallbackResult, fallbackErr := utils.ShodanIPLookup(ipStr)
			if fallbackErr == nil {
				json.NewEncoder(w).Encode(models.APIResponse{
					Status:  "success",
					Message: fmt.Sprintf("Used HTTP search for IP %s (resolved from %s)", ipStr, domain),
					Data:    fallbackResult,
				})
				return
			}
		}
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status:  "error",
		Message: "Shodan search failed: CLI not available and fallback methods not applicable",
	})
}

// SpiderFootHandler handles SpiderFoot OSINT automation
func SpiderFootHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.SpiderFootRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Invalid request body",
		})
		return
	}

	if req.Target == "" {
		json.NewEncoder(w).Encode(models.APIResponse{
			Status:  "error",
			Message: "Target is required",
		})
		return
	}

	// Check for SpiderFoot path in environment variable
	spiderfootPath := os.Getenv("SPIDERFOOT_PATH")

	// Initialize command variables
	var cmd *exec.Cmd
	cmdFound := false

	if spiderfootPath != "" {
		// Try multiple ways to find and run SpiderFoot

		// Check for sf.py in the specified path
		sfScript := fmt.Sprintf("%s/sf.py", spiderfootPath)
		venvPython := fmt.Sprintf("%s/venv/bin/python", spiderfootPath)

		if fileExists(sfScript) && fileExists(venvPython) {
			args := buildSpiderFootArgs(req)
			cmd = exec.Command(venvPython, append([]string{sfScript}, args...)...)
			cmdFound = true
		} else {
			// Check for spiderfoot.py
			sfScript = fmt.Sprintf("%s/spiderfoot.py", spiderfootPath)
			if fileExists(sfScript) && fileExists(venvPython) {
				args := buildSpiderFootArgs(req)
				cmd = exec.Command(venvPython, append([]string{sfScript}, args...)...)
				cmdFound = true
			}
		}
	}

	// If we haven't found a command yet, try system paths
	if !cmdFound {
		// Try sf.py in PATH
		if commandExists("sf.py") {
			args := buildSpiderFootArgs(req)
			cmd = exec.Command("sf.py", args...)
			cmdFound = true
		} else if commandExists("spiderfoot") {
			// Try spiderfoot command
			args := buildSpiderFootArgs(req)
			cmd = exec.Command("spiderfoot", args...)
			cmdFound = true
		}
	}

	// If we found a command to run SpiderFoot
	if cmdFound && cmd != nil {
		// Set a reasonable timeout for the command
		var ctx context.Context
		var cancel context.CancelFunc

		// Use request timeout or default to 5 minutes
		timeout := 300 * time.Second
		if req.Timeout > 0 {
			timeout = time.Duration(req.Timeout) * time.Minute
		}

		ctx, cancel = context.WithTimeout(context.Background(), timeout)
		defer cancel()

		// Run with timeout
		cmd = exec.CommandContext(ctx, cmd.Path, cmd.Args[1:]...)

		// Capture output
		output, err := cmd.CombinedOutput()

		// Check for timeout
		if ctx.Err() == context.DeadlineExceeded {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: "SpiderFoot scan timed out",
				Data:    string(output),
			})
			return
		}

		// Check for other errors
		if err != nil {
			json.NewEncoder(w).Encode(models.APIResponse{
				Status:  "error",
				Message: fmt.Sprintf("Error executing SpiderFoot: %v", err),
				Data:    string(output),
			})
			return
		}

		json.NewEncoder(w).Encode(models.APIResponse{
			Status: "success",
			Data:   string(output),
		})
		return
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status:  "error",
		Message: "SpiderFoot not available on the system or could not be properly executed",
	})
}

// buildSpiderFootArgs builds the argument list for SpiderFoot based on the request
func buildSpiderFootArgs(req models.SpiderFootRequest) []string {
	// Basic scan command
	args := []string{"-s", req.Target}

	// Add specific module if requested
	if req.Module != "" {
		args = append(args, "-m", req.Module)
	}

	// Add timeout if specified (convert to seconds)
	if req.Timeout > 0 {
		timeoutSecs := req.Timeout * 60
		args = append(args, "-t", strconv.Itoa(timeoutSecs))
	}

	// Force CLI output format
	args = append(args, "-o", "CLI")

	return args
}

// Helper functions

// isWindows checks if the OS is Windows
func isWindows() bool {
	cmd := exec.Command("cmd", "/c", "ver")
	err := cmd.Run()
	return err == nil
}

// commandExists checks if a command exists on the system
func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// parseSubdomains extracts subdomains from amass output
func parseSubdomains(output string, domain string) []string {
	var subdomains []string
	lines := strings.Split(output, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.Contains(line, domain) {
			subdomains = append(subdomains, line)
		}
	}

	return subdomains
}

// detectWebTechnologies performs basic web technology detection
func detectWebTechnologies(headers http.Header, body string) map[string]interface{} {
	technologies := make(map[string]interface{})

	// Server header
	if server := headers.Get("Server"); server != "" {
		technologies["Server"] = server
	}

	// X-Powered-By header
	if poweredBy := headers.Get("X-Powered-By"); poweredBy != "" {
		technologies["X-Powered-By"] = poweredBy
	}

	// Content-Management-System header
	if cms := headers.Get("X-Generator"); cms != "" {
		technologies["CMS"] = cms
	}

	// Common frameworks and libraries detection
	frameworks := map[string]string{
		"jQuery":        `jquery[.-](\d+\.\d+\.\d+)`,
		"Bootstrap":     `bootstrap[.-](\d+\.\d+\.\d+)`,
		"React":         `react[.-](\d+\.\d+\.\d+)`,
		"Angular":       `angular[.-](\d+\.\d+\.\d+)`,
		"Vue.js":        `vue[.-](\d+\.\d+\.\d+)`,
		"WordPress":     `wp-content|wordpress`,
		"Drupal":        `drupal`,
		"Joomla":        `joomla`,
		"Magento":       `magento`,
		"Laravel":       `laravel`,
		"Django":        `django`,
		"Express.js":    `express`,
		"Ruby on Rails": `rails`,
	}

	for framework, pattern := range frameworks {
		re := regexp.MustCompile(pattern)
		if re.MatchString(body) {
			matches := re.FindStringSubmatch(body)
			if len(matches) > 1 {
				technologies[framework] = matches[1] // Version if captured
			} else {
				technologies[framework] = "detected"
			}
		}
	}

	return technologies
}

// tlsVersionToString converts TLS version to string
func tlsVersionToString(version uint16) string {
	switch version {
	case tls.VersionTLS10:
		return "TLS 1.0"
	case tls.VersionTLS11:
		return "TLS 1.1"
	case tls.VersionTLS12:
		return "TLS 1.2"
	case tls.VersionTLS13:
		return "TLS 1.3"
	default:
		return fmt.Sprintf("Unknown (%d)", version)
	}
}

// fileExists checks if a file exists
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}
