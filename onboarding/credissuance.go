package onboarding

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type LEARIssuanceRequestBody struct {
	Schema        string  `json:"schema,omitempty"`
	OperationMode string  `json:"operation_mode,omitempty"`
	Format        string  `json:"format,omitempty"`
	ResponseUri   string  `json:"response_uri,omitempty"`
	Payload       Payload `json:"payload,omitempty"`
}

func ParseLEARIssuanceRequestBody(body []byte) (*LEARIssuanceRequestBody, error) {
	var req LEARIssuanceRequestBody
	err := json.Unmarshal(body, &req)
	if err != nil {
		return nil, err
	}
	return &req, nil
}

type Payload struct {
	Mandator Mandator `json:"mandator,omitempty"`
	Mandatee Mandatee `json:"mandatee,omitempty"`
	Power    []Power  `json:"power,omitempty"`
}

type Mandator struct {
	OrganizationIdentifier string `json:"organizationIdentifier,omitempty"`
	Organization           string `json:"organization,omitempty"`
	Country                string `json:"country,omitempty"`
	CommonName             string `json:"commonName,omitempty"`
	EmailAddress           string `json:"emailAddress,omitempty"`
	SerialNumber           string `json:"serialNumber,omitempty"`
}

type Mandatee struct {
	FirstName   string `json:"firstName,omitempty"`
	LastName    string `json:"lastName,omitempty"`
	Nationality string `json:"nationality,omitempty"`
	Email       string `json:"email,omitempty"`
}

type Power struct {
	Type     string  `json:"type,omitempty"`
	Domain   string  `json:"domain,omitempty"`
	Function string  `json:"function,omitempty"`
	Action   Strings `json:"action,omitempty"`
}

// The "action" claim can either be a single string or an array.
// We need to serialize the claim as a single string if the array has only one element
type Strings []string

func (s Strings) MarshalJSON() (b []byte, err error) {
	if len(s) == 1 {
		return json.Marshal(s[0])
	}

	return json.Marshal([]string(s))
}

func LEARIssuanceRequest(config *Config, learCredData *LEARIssuanceRequestBody) ([]byte, error) {

	// Get an access token from the Verifier
	access_token, err := TokenRequest(
		config.VerifierTokenEndpoint,
		config.machineCredential,
		config.MyDidkey,
		config.VerifierURL,
		config.privateKey,
	)
	if err != nil {
		return nil, err
	}

	fmt.Printf("Access Token: %v\n", access_token)
	fmt.Printf("Issuance Endpoint: %v\n", config.CredentialIssuancePath)

	// The request buffer
	buf, err := json.Marshal(learCredData)
	if err != nil {
		return nil, err
	}
	requestBody := bytes.NewBuffer(buf)

	// The request to send
	req, _ := http.NewRequest("POST", config.CredentialIssuancePath, requestBody)
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+access_token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode > 399 {
		fmt.Println("Error calling LEAR Issuance Endpoint:", resp.Status)
		return nil, fmt.Errorf("error calling LEAR Issuance Endpoint: %v", resp.Status)
	}

	ResponseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return ResponseBody, nil
}
