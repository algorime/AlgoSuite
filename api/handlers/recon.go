package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
	"time"
	"regexp"
	"io/ioutil"
	"net"
	"crypto/tls"

	"github.com/likexian/whois"
	"myaptai/api/models"
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
		args := []string{"-T4"}
		
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
		
		// Add ports
		args = append(args, "-p", strings.Join(ports, ","))
		
		// Add target
		args = append(args, req.Target)
		
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
		"subject":            cert.Subject.String(),
		"issuer":             cert.Issuer.String(),
		"valid_from":         cert.NotBefore.String(),
		"valid_until":        cert.NotAfter.String(),
		"dns_names":          cert.DNSNames,
		"version":            cert.Version,
		"serial_number":      cert.SerialNumber.String(),
		"tls_version":        tlsVersionToString(state.Version),
		"cipher_suite":       tls.CipherSuiteName(state.CipherSuite),
		"certificate_chain":  len(state.PeerCertificates),
		"certificate_expired": time.Now().After(cert.NotAfter),
	}

	json.NewEncoder(w).Encode(models.APIResponse{
		Status: "success",
		Data:   result,
	})
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
		"jQuery":     `jquery[.-](\d+\.\d+\.\d+)`,
		"Bootstrap":  `bootstrap[.-](\d+\.\d+\.\d+)`,
		"React":      `react[.-](\d+\.\d+\.\d+)`,
		"Angular":    `angular[.-](\d+\.\d+\.\d+)`,
		"Vue.js":     `vue[.-](\d+\.\d+\.\d+)`,
		"WordPress":  `wp-content|wordpress`,
		"Drupal":     `drupal`,
		"Joomla":     `joomla`,
		"Magento":    `magento`,
		"Laravel":    `laravel`,
		"Django":     `django`,
		"Express.js": `express`,
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