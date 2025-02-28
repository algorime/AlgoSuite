package utils

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

// ShodanIPLookup performs a simple HTTP query to the free Shodan InternetDB API for IP lookups
func ShodanIPLookup(ipAddress string) (string, error) {
	// For IP lookups, we can use the non-authenticated InternetDB API
	url := fmt.Sprintf("https://internetdb.shodan.io/%s", ipAddress)

	// Set timeout for the HTTP request
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Read response
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	return string(body), nil
}
