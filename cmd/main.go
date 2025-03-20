package main

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const mydidkey = "did:key:zDnaeb3th2TDPrQTnM19Mdy543xFetwCpqjmcGBFgisqYKuL4"

const verifierSBX = "https://verifier.dome-marketplace-sbx.org"
const tokenEndpoint = "https://verifier.dome-marketplace-sbx.org/oidc/token"

// const verifierSBX = "https://verifier.dome-marketplace-lcl.org"
// const tokenEndpoint = "https://verifier.dome-marketplace-lcl.org/oidc/token"
const credentialIssuancepoint = "https://issuer.dome-marketplace-sbx.org/issuer-api/vci/v1/issuances"

var credentialsDir = flag.String("creds",
	"../config/credentials",
	"directory with credential data")

var privateKeyFilePEM = flag.String("priv", "didkey_priv.pem", "private key file in PEM format")

const learFile = "lear_credential_machine.txt"

func main() {

	flag.Parse()

	environment := "sbx"

	privateKeyFilePEMPath := path.Join(*credentialsDir, environment+"_"+*privateKeyFilePEM)

	// Read the private key
	pemBytesRaw, err := os.ReadFile(privateKeyFilePEMPath)
	if err != nil {
		panic(err)
	}

	// Decode from the PEM format
	pemBlock, _ := pem.Decode(pemBytesRaw)
	privKeyAny, err := x509.ParsePKCS8PrivateKey(pemBlock.Bytes)
	if err != nil {
		panic(err)
	}
	privKey := privKeyAny.(*ecdsa.PrivateKey)

	// Read the LEARCredentialMachine
	learCredentialPath := path.Join(*credentialsDir, environment+"_"+learFile)
	learCredentialRaw, err := os.ReadFile(learCredentialPath)
	if err != nil {
		panic(err)
	}

	cliAssertion, err := NewCliAssertion(string(learCredentialRaw), privKey)
	if err != nil {
		panic(err)
	}

	// Get the access token
	tokenResponse, err := TokenRequest(tokenEndpoint, cliAssertion)
	if err != nil {
		panic(err)
	}

	fmt.Printf("TokenResponse: %v\n", string(tokenResponse))

	type accessTokenResponse struct {
		AccessToken string `json:"access_token"`
	}

	at := &accessTokenResponse{}
	err = json.Unmarshal(tokenResponse, at)
	if err != nil {
		panic(err)
	}
	accessToken := at.AccessToken

	reqBody, err := ParseLEARIssuanceRequestBody([]byte(LEARIssuanceRequestBodyExample))
	if err != nil {
		panic(err)
	}

	response, err := LEARIssuanceRequest(credentialIssuancepoint, accessToken, reqBody)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Response: %v\n", string(response))

}

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
	Email                  string `json:"email,omitempty"`
	SerialNumber           string `json:"serialNumber,omitempty"`
}

type Mandatee struct {
	FirstName   string `json:"firstName,omitempty"`
	LastName    string `json:"lastName,omitempty"`
	Nationality string `json:"nationality,omitempty"`
	Email       string `json:"email,omitempty"`
}

type Power struct {
	Type     string   `json:"type,omitempty"`
	Domain   string   `json:"domain,omitempty"`
	Function string   `json:"function,omitempty"`
	Action   []string `json:"action,omitempty"`
}

var LEARIssuanceRequestBodyExample = `{
    "schema": "LEARCredentialEmployee",
    "operation_mode": "S",
    "format": "jwt_vc_json",
    "response_uri": "",
    "payload": {
        "mandator": {
            "organizationIdentifier": "VATES-Q12353532",
            "organization": "Example",
            "country": "ES",
            "commonName": "Jhon - DNI 12345678B",
            "email": "jesus@alastria.io",
            "serialNumber": "IDCES-12345678B"
        },
        "mandatee": {
            "firstName": "Pepa",
            "lastName": "Pig",
            "nationality": "ES",
            "email": "hesus.ruiz@gmail.com"
        },
        "power": [
            {
                "type": "domain",
                "domain": "DOME",
                "function": "Onboarding",
                "action": [
                    "execute"
                ]
            },
            {
                "type": "domain",
                "domain": "DOME",
                "function": "ProductOffering",
                "action": [
                    "create",
                    "update",
                    "delete"
                ]
            }
        ]
    }
}`

func LEARIssuanceRequestTest(issuanceEndpoint string, access_token string, learCred *LEARIssuanceRequestBody) ([]byte, error) {

	fmt.Printf("Access Token: %v\n", access_token)
	fmt.Printf("Issuance Endpoint: %v\n", issuanceEndpoint)

	// The request buffer
	buf, err := json.Marshal(learCred)
	if err != nil {
		return nil, err
	}
	b := bytes.NewBuffer(buf)

	handler := func(w http.ResponseWriter, r *http.Request) {
		fmt.Println()
		fmt.Println("Authorization:", r.Header.Get("Authorization"))
		body, _ := io.ReadAll(r.Body)
		fmt.Println("Body:", string(body))

		io.WriteString(w, "<html><body>Hello World!</body></html>")
	}

	req := httptest.NewRequest("POST", issuanceEndpoint, b)
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", "Bearer "+access_token)
	w := httptest.NewRecorder()
	handler(w, req)

	resp := w.Result()
	body, _ := io.ReadAll(resp.Body)

	fmt.Println(resp.StatusCode)
	fmt.Println(resp.Header.Get("Content-Type"))
	fmt.Println(string(body))
	return body, nil

}

func LEARIssuanceRequest(issuanceEndpoint string, access_token string, learCred *LEARIssuanceRequestBody) ([]byte, error) {

	fmt.Printf("Access Token: %v\n", access_token)
	fmt.Printf("Issuance Endpoint: %v\n", issuanceEndpoint)

	// The request buffer
	buf, err := json.Marshal(learCred)
	if err != nil {
		return nil, err
	}
	b := bytes.NewBuffer(buf)

	// The request to send
	req, _ := http.NewRequest("POST", issuanceEndpoint, b)
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

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func TokenRequest(tokenEndpoint string, cliAssertion string) ([]byte, error) {

	// The request buffer
	var b bytes.Buffer
	b.WriteString("client_id=did:key:zDnaeb3th2TDPrQTnM19Mdy543xFetwCpqjmcGBFgisqYKuL4&")
	b.WriteString("grant_type=client_credentials&")
	b.WriteString("client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&")
	b.WriteString("client_assertion=")
	b.WriteString(cliAssertion)

	requestBody := b.String()
	_ = requestBody
	fmt.Println(requestBody)

	// The request to send
	req, _ := http.NewRequest("POST", tokenEndpoint, &b)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode > 399 {
		fmt.Println("Error calling Token Endpoint:", resp.Status)
		return nil, fmt.Errorf("error calling Token Endpoint: %v", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

// The request to the Token endpoint for the M2M authentication must be done like this:
//
// POST /oidc/token HTTP/1.1
// Host: verifier.dome-marketplace-sbx.org
// Content-Type: application/x-www-form-urlencoded
//
// client_id=did:key:zDnaeb3TDPrQTn...CpqjmcGBFgisqYKuL4&
// grant_type=client_credentials&
// client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&
// client_assertion=eyJhbGciOiJSUzI6IjIyIn0.eyJpc3Mi.cC4hiUPo

// The client_assertion is a JWT defined like this:

type ClientAssertion struct {

	// iss: REQUIRED. Issuer. This MUST contain the client_id of the OAuth Client,
	// 	which is the did assigned to the machine in the LEARCredential of the
	// 	machine.
	Iss string `json:"iss"`

	// sub: REQUIRED. Subject. This MUST contain the same value as the "iss" claim.
	Sub string `json:"sub"`

	// aud: REQUIRED. Audience. The aud (audience) Claim. Value that identifies the
	// 	VCVerifier as an intended audience. The client MUST use the VCVerifier's
	// 	issuer identifier value (as defined in [RFC8414]). The issuer identifier
	// 	value shall be sent as a string not as an item in an array. The
	// 	VCVerifier MUST verify that it is an intended audience for the token.
	// 	The Audience SHOULD be the URL of the VCVerifier's Token Endpoint.
	Aud string `json:"aud"`

	// jti: REQUIRED. JWT ID. A unique identifier for the token, which can be used
	// 	to prevent reuse of the token. These tokens MUST only be used once,
	// 	unless conditions for reuse were negotiated between the parties; any
	// 	such negotiation is beyond the scope of this specification. Given the
	// 	very low value of the expiration time of the JWT in this specification,
	// 	the cache of already used jti claims can be held in memory, because an
	// 	expired JWT MUST not be accepted even if the jti has not been seen
	// 	before.
	Jti string `json:"jti"`

	// exp: REQUIRED. Expiration time on or after which the JWT MUST NOT be
	// 	accepted for processing. In a M2M flow, this JWT is used only once and
	// 	the client generates the JWT immediately before using it to call the
	// 	token endpoint of the VCVerifier, with no human intervention or
	// 	intermediate complex processes. The expiration time MUST be set as low
	// 	as possible while allowing network delays, the major component that may
	// 	affect this parameter. For example, 10 seconds, which is more than
	// 	enough in most situations. In case of bad network conditions, the
	// 	authentication can be retried with a new JWT. This is important for
	// 	Replay protection, while simplifying management of unique jticlaims in
	// 	VC Verifier.
	Exp int64 `json:"exp"`

	// iat: REQUIRED. Time at which the JWT was issued.
	Iat int64 `json:"iat"`

	// vp_token: REQUIRED. JSON String that MUST contain a single Verifiable
	//	Presentation (the array syntax MUST NOT be used, even if the array has only
	//	one presentation). The Verifiable Presentation MUST be represented as a JSON
	//	string (that is a Base64url encoded value) using the format "jwt_vp_json":
	//	the VP is not using JSON-LD and is signed as a JWT. The VP MUST include only
	//	one LEARCredential, which will be used for authentication by the VCVerifier.
	//	The LEARCredential MUST be included in the VP using the format
	//	"jwt_vc_json", that is: VC signed as a JWT, not using JSON-LD.
	VpToken string `json:"vp_token"`
}

type CliAssertion struct {
	jwt.RegisteredClaims
	VpToken string `json:"vp_token"`
}

func NewCliAssertion(learCredential string, privateKey *ecdsa.PrivateKey) (string, error) {

	vpStringToken, err := NewVPToken(string(learCredential), privateKey)
	if err != nil {
		panic(err)
	}

	// This is the object to create the Client Assertion
	claims := CliAssertion{
		VpToken: B64Encode([]byte(vpStringToken)),
	}

	// Set the claims with timestamps
	now := time.Now()
	claims.ExpiresAt = jwt.NewNumericDate(now.Add(24 * 30 * time.Hour))
	claims.IssuedAt = jwt.NewNumericDate(now)
	claims.NotBefore = jwt.NewNumericDate(now)

	// I am the issuer of this token
	claims.Issuer = mydidkey
	claims.Subject = mydidkey

	// The audience is the Verifier, and we set the aud field as a single string
	jwt.MarshalSingleStringAsArray = false
	claims.Audience = jwt.ClaimStrings{verifierSBX}
	// claims.Audience = jwt.ClaimStrings{"http://localhost:8080"}

	// The nonce for the token
	claims.ID = GenerateNonce()

	// Generate and sign the token
	token := jwt.NewWithClaims(jwt.SigningMethodES256, claims)

	// Add the kid header
	token.Header["kid"] = mydidkey

	return token.SignedString(privateKey)

}

/**
The VpToken above is a JWT containing the Verifiable Presentation in 'jwt_vp_json' format.
An example payload of the vp_token JWT is the following:

{
  "iss": "did:key:zDnaeb3TDPrQTn...CpqjmcGBFgisqYKuL4",
  "jti": "urn:uuid:3978344f-8596-4c3a-a978-8fcaba3903c5",
  "aud": "https://verifier.dome-marketplace-sbx.org",
  "nbf": 1541493724,
  "iat": 1541493724,
  "exp": 1573029723,
  "nonce": "n-0S6_WzA2Mj",
  "vp": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1"
    ],
    "type": [
      "VerifiablePresentation"
    ],
    "verifiableCredential": [
      "eyJhb...ssw5c"
    ]
  }
}
**/

type VPToken struct {
	jwt.RegisteredClaims
	VP    VP     `json:"vp"`
	Nonce string `json:"nonce,omitempty"`
}

func (o *VPToken) String() string {
	out, _ := json.MarshalIndent(o, "", "  ")
	return string(out)
}

type VP struct {
	Context              []string `json:"@context"`
	Type                 []string `json:"type"`
	Holder               string   `json:"holder,omitempty"`
	Id                   string   `json:"id,omitempty"`
	VerifiableCredential []string `json:"verifiableCredential"`
}

func (o *VP) String() string {
	out, _ := json.Marshal(o)
	return string(out)
}

func NewVPToken(vcStringToken string, privateKey *ecdsa.PrivateKey) (string, error) {

	// This is the Verifiable Presentation object
	vp := VP{
		Context: []string{
			"https://www.w3.org/2018/credentials/v1",
		},
		Type: []string{
			"VerifiablePresentation",
		},
		Holder:               mydidkey,
		Id:                   GenerateNonce(),
		VerifiableCredential: []string{vcStringToken},
	}

	// This is the object to create the vp_token
	claims := VPToken{
		VP:    vp,
		Nonce: GenerateNonce(),
	}

	// Set the claims with timestamps
	now := time.Now()
	claims.ExpiresAt = jwt.NewNumericDate(now.Add(24 * 30 * time.Hour))
	claims.IssuedAt = jwt.NewNumericDate(now)
	claims.NotBefore = jwt.NewNumericDate(now)

	// I am the issuer of this token
	claims.Issuer = mydidkey

	// The audience is the Verifier, and we set the aud field as a single string
	jwt.MarshalSingleStringAsArray = false
	claims.Audience = jwt.ClaimStrings{verifierSBX}
	// claims.Audience = jwt.ClaimStrings{"http://localhost:8080"}

	// The nonce for the token
	claims.ID = GenerateNonce()

	// Generate and sign the token
	token := jwt.NewWithClaims(jwt.SigningMethodES256, claims)

	// Add the kid header
	token.Header["kid"] = mydidkey

	signed, err := token.SignedString(privateKey)
	if err != nil {
		return "", err
	}
	// fmt.Println(signed)

	return signed, nil

}

func GenerateNonce() string {
	b := make([]byte, 16)
	io.ReadFull(rand.Reader, b)
	nonce := base64.RawURLEncoding.EncodeToString(b)
	return nonce
}

func B64Encode(data []byte) string {
	result := base64.StdEncoding.EncodeToString(data)
	result = strings.Replace(result, "+", "-", -1) // 62nd char of encoding
	result = strings.Replace(result, "/", "_", -1) // 63rd char of encoding
	result = strings.Replace(result, "=", "", -1)  // Remove any trailing '='s

	return result
}

const myLEARCredentialEmployee = "eyJhbGciOiJSUzI1NiIsImN0eSI6Impzb24iLCJraWQiOiJNSUhRTUlHM3BJRzBNSUd4TVNJd0lBWURWUVFEREJsRVNVZEpWRVZNSUZSVElFRkVWa0ZPUTBWRUlFTkJJRWN5TVJJd0VBWURWUVFGRXdsQ05EYzBORGMxTmpBeEt6QXBCZ05WQkFzTUlrUkpSMGxVUlV3Z1ZGTWdRMFZTVkVsR1NVTkJWRWxQVGlCQlZWUklUMUpKVkZreEtEQW1CZ05WQkFvTUgwUkpSMGxVUlV3Z1QwNGdWRkpWVTFSRlJDQlRSVkpXU1VORlV5QlRURlV4RXpBUkJnTlZCQWNNQ2xaaGJHeGhaRzlzYVdReEN6QUpCZ05WQkFZVEFrVlRBaFJraVFqbVlLNC95SzlIbGdrVURVNHoyZEo5OWc9PSIsIng1dCNTMjU2IjoidEZHZ19WWHVBdUc3NTZpUG52aWVTWjQ2ajl6S3VINW5TdmJKMHA5cFFaUSIsIng1YyI6WyJNSUlIL1RDQ0JlV2dBd0lCQWdJVVpJa0k1bUN1UDhpdlI1WUpGQTFPTTluU2ZmWXdEUVlKS29aSWh2Y05BUUVOQlFBd2diRXhJakFnQmdOVkJBTU1HVVJKUjBsVVJVd2dWRk1nUVVSV1FVNURSVVFnUTBFZ1J6SXhFakFRQmdOVkJBVVRDVUkwTnpRME56VTJNREVyTUNrR0ExVUVDd3dpUkVsSFNWUkZUQ0JVVXlCRFJWSlVTVVpKUTBGVVNVOU9JRUZWVkVoUFVrbFVXVEVvTUNZR0ExVUVDZ3dmUkVsSFNWUkZUQ0JQVGlCVVVsVlRWRVZFSUZORlVsWkpRMFZUSUZOTVZURVRNQkVHQTFVRUJ3d0tWbUZzYkdGa2IyeHBaREVMTUFrR0ExVUVCaE1DUlZNd0hoY05NalF3TmpJeE1EWTFOelUwV2hjTk1qY3dOakl4TURZMU56VXpXakNCcXpFVk1CTUdBMVVFQXd3TVdrVlZVeUJQVEVsTlVFOVRNUmd3RmdZRFZRUUZFdzlKUkVORlZTMDVPVGs1T1RrNU9WQXhEVEFMQmdOVkJDb01CRnBGVlZNeEVEQU9CZ05WQkFRTUIwOU1TVTFRVDFNeEh6QWRCZ05WQkFzTUZrUlBUVVVnUTNKbFpHVnVkR2xoYkNCSmMzTjFaWEl4R0RBV0JnTlZCR0VNRDFaQlZFVlZMVUk1T1RrNU9UazVPVEVQTUEwR0ExVUVDZ3dHVDB4SlRWQlBNUXN3Q1FZRFZRUUdFd0pGVlRDQ0FpSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnSVBBRENDQWdvQ2dnSUJBTERkMGNGZ3A2dzdqV0dVNW9OU3hBWXVQejlodzMwWHdtQ3AxTldieTh4STBPN2I5blUwT0JwTTR1ZWRDKzdoSDd5Uk51ek9VTzF3S1IwZkpJcVkyc3picTExblZwNnNDTWl1eVlzb0d4NXJNQ3RMM3Y5TFBFdnU2MXhER0xRYVlBZnF0ZjVhTXdHL0QvOTQzdnUvTzJYZWQyc1VOYnIrZDFIYjZlUHVIRzU5ZS9YekRraTBuZUtPOHJSUllRakVlSzhDek50Z3N6NUN4cFBtZ3g5ZUVqMEYwZTEzRjErbzB5VGwzYUhET1FvVUErUWhjQzRYc2UzQkN0TXZnRTl1WTdWKzNlRUhFR2h5bUJjeldtbHVYeGpRMjJDZlREWFZvKzFEa0U3SWhkZU9pdGRBa2txT056VVRzVGwxa2gwTlByNDJaall3K1JaK3EybTI4QTYvbTVEbzBUdGlIaDFML2dHZkVaZjhBRzJUWWt6alhkSGEvdWRFY1hrTmlBeVpGZEo3RDlIYzZwZUhXdlFDZ2VES1dVakVtcExiMkx1c2pqVmRTYTdRc2hZbHZYS3I2b3FRcW5qZ0tOWTMwSXBvOTF2SUxZQ243MTJHRHlMR0x1ZEpxUXI0L0s5Y2cwR21sRUI1OGU4ZHdKRlhXK1o2c3lodW9CaEZESkRZNE9oZnFYeVQ2bnNPOEJ1WVl3YmFMQkFIZGprcmt5UUdpTFJDVk5oTDlBeHdBdXlhRkhjeU5ieXo5RDZ0ZUVXSThSWWFMN2JJNStpa0VBVkVJVWdnZlUxK1JCaFQwa3dDbmVTSk5BYUorSnN2WjA1czFNdTFhakZMWVhZMHI5clVlb1cyMkJDSmJuVXEyYjEzdS92dS9hRlZjTkpMdXE3OXp1YWZJUytybXQ2NUFqN3ZBZ01CQUFHamdnSVBNSUlDQ3pBTUJnTlZIUk1CQWY4RUFqQUFNQjhHQTFVZEl3UVlNQmFBRklJVG9hTUNsTTVpRGVBR3RqZFdRWEJjUmE0ck1IUUdDQ3NHQVFVRkJ3RUJCR2d3WmpBK0JnZ3JCZ0VGQlFjd0FvWXlhSFIwY0RvdkwzQnJhUzVrYVdkcGRHVnNkSE11WlhNdlJFbEhTVlJGVEZSVFVWVkJURWxHU1VWRVEwRkhNUzVqY25Rd0pBWUlLd1lCQlFVSE1BR0dHR2gwZEhBNkx5OXZZM053TG1ScFoybDBaV3gwY3k1bGN6Q0J3QVlEVlIwZ0JJRzRNSUcxTUlHeUJnc3JCZ0VFQVlPblVRb0RDekNCb2pBL0JnZ3JCZ0VGQlFjQ0FSWXphSFIwY0hNNkx5OXdhMmt1WkdsbmFYUmxiSFJ6TG1WekwyUndZeTlFU1VkSlZFVk1WRk5mUkZCRExuWXlMakV1Y0dSbU1GOEdDQ3NHQVFVRkJ3SUNNRk1NVVVObGNuUnBabWxqWVdSdklHTjFZV3hwWm1sallXUnZJR1JsSUdacGNtMWhJR1ZzWldOMGNtOXVhV05oSUdGMllXNTZZV1JoSUdSbElIQmxjbk52Ym1FZ1ptbHphV05oSUhacGJtTjFiR0ZrWVRBUEJna3JCZ0VGQlFjd0FRVUVBZ1VBTUIwR0ExVWRKUVFXTUJRR0NDc0dBUVVGQndNQ0JnZ3JCZ0VGQlFjREJEQkNCZ05WSFI4RU96QTVNRGVnTmFBemhqRm9kSFJ3T2k4dlkzSnNNUzV3YTJrdVpHbG5hWFJsYkhSekxtVnpMMFJVVTFGMVlXeHBabWxsWkVOQlJ6RXVZM0pzTUIwR0ExVWREZ1FXQkJSSnRva0hPWEYyMzVVSktZM0tPQVdhZ1NHZExEQU9CZ05WSFE4QkFmOEVCQU1DQnNBd0RRWUpLb1pJaHZjTkFRRU5CUUFEZ2dJQkFGME1nS1NHWXNiaURrUTVCQmZLc1VGWnpBd2xzTDhrRTYzUHlKMFBMajVzT2VUMEZMWTVJeTVmY0U2NmcwWEozSWsvUG0vYTFiK0hCd2l0bkx3ZGRKbVJwWm9ta09RSWxaYXRUQk9tQTlUd2M4OE5MdU5TdTdVM0F5cXV0akRSbFVDOFpGeWRDY1pUalF0bVVIM1FlU0d4RDYvRy82T0JGK2VVY3o1QTVkenJIMGtKNkQrYTQ3MjBjYitkZ01ycTA0OTBVbTVJcExReXRuOG5qSjNSWWtINnhVNmoxdEJpVmsrTVJ4TUZ6bUoxSlpLd1krd2pFdklidlZrVGt0eGRLWVFubFhGL1g2UlhnZjJ0MEJlK0YyRDU0R3pYcWlxeGMvRVVZM3k1Ni9rTUk1OW5ibGdia1ZPYTZHYVd3aUdPNnk1R3h2MVFlUmxVd2Z5TGZRRFR4Ykh6eXBrUysrcG55NXl2OU5kVytQR2loUVZubGFrdkFUS010M1B4WVZyYU91U3NWQVQyVVlVLy9sRGNJWU44Sk94NDB5amVubVVCci8yWE1yeDd2SzhpbkU1SzI0cmg4OXNZUVc3ZkZLM2RmQTRpeTEzblpRc1RzdWlEWVdBZWV6cTlMU3RObE9ncnFxd0RHRDdwLzRzbFh2RlhwTkxtcjlYaXVWRUtXQ0dmSXJnY0tPck5qV3hRREMwV1NsdGtNUFZTZzVrTlMwTW1GYmM0OHB3WXlmR3o2TkUvSmFVNVFzcXdBNnRtR3FLanhOUXJKRGptYXBheFltL3RYSjZhblhjY2sySWVudDRlc241UDhIdE1uK0wzQWQ0RFF4NWlkVWhPQmtsb1NWVlR2dWUvOXgrZTRQWXJDVHNiT3pBa1VtRTl3amFOSStLNW9jWmFvVEhDQTVDNyJdLCJ0eXAiOiJqb3NlIiwic2lnVCI6IjIwMjUtMDMtMTRUMTU6MzI6NDFaIiwiY3JpdCI6WyJzaWdUIl19.eyJzdWIiOiJkaWQ6a2V5OnpEbmFlYjN0aDJURFByUVRuTTE5TWR5NTQzeEZldHdDcHFqbWNHQkZnaXNxWUt1TDQiLCJuYmYiOjE3MDQwOTYwMDAsImlzcyI6ImRpZDplbHNpOlZBVEVVLUI5OTk5OTk5OSIsImV4cCI6MTc2ODU3MTU4MSwiaWF0IjoxNzA0MDk2MDAwLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvbnMvY3JlZGVudGlhbHMvdjIiLCJodHRwczovL3d3dy5ldmlkZW5jZWxlZGdlci5ldS8yMDIyL2NyZWRlbnRpYWxzL21hY2hpbmUvdjEiXSwiaWQiOiI4YzVhNjIxMy01NDRkLTQ1MGQtOGUzZC1iNDFmYTkwMDkxOTciLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiTEVBUkNyZWRlbnRpYWxNYWNoaW5lIl0sImlzc3VlciI6eyJpZCI6ImRpZDplbHNpOlZBVEVVLUI5OTk5OTk5OSJ9LCJpc3N1YW5jZURhdGUiOiIyMDI0LTAxLTAxVDA4OjAwOjAwLjAwMDAwMDAwMFoiLCJ2YWxpZEZyb20iOiIyMDI0LTAxLTAxVDA4OjAwOjAwLjAwMDAwMDAwMFoiLCJ2YWxpZFVudGlsIjoiMjAyNy0wMS0wMVQwODowMDowMC4wMDAwMDAwMDBaIiwiZXhwaXJhdGlvbkRhdGUiOiIyMDI3LTAxLTMxVDIzOjU5OjAwLjAwMDAwMDAwMFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJtYW5kYXRlIjp7ImlkIjoiN2JmNTVkMmUtNTI0Ny00NzE0LTkxZDEtOGUyZjhjYjczMGQxIiwibGlmZV9zcGFuIjp7InN0YXJ0RGF0ZVRpbWUiOiIyMDI0LTAxLTAxVDA4OjAwOjAwLjAwMDAwMDAwMFoiLCJlbmREYXRlVGltZSI6IjIwMjYtMDEtMzFUMjM6NTk6MDAuMDAwMDAwMDAwWiJ9LCJtYW5kYXRlZSI6eyJpZCI6ImRpZDprZXk6ekRuYWViM3RoMlREUHJRVG5NMTlNZHk1NDN4RmV0d0NwcWptY0dCRmdpc3FZS3VMNCIsInNlcnZpY2VOYW1lIjoiT25ib2FyZGluZyIsInNlcnZpY2VUeXBlIjoiQVBJIiwidmVyc2lvbiI6InYxLjAiLCJkb21haW4iOiJodHRwczovL29uYm9hcmRpbmcuZG9tZS1tYXJrZXRwbGFjZS1zYngub3JnIiwiaXBBZGRyZXNzIjoiMTI3LjAuMC4xIiwiZGVzY3JpcHRpb24iOiJPbmJvYXJkaW5nIiwiY29udGFjdCI6eyJlbWFpbCI6Implc3VzLnJ1aXpAaW4yLmVzIiwicGhvbmUiOiIrMzQ5OTk5OTk5OTkifX0sIm1hbmRhdG9yIjp7ImNvbW1vbk5hbWUiOiJKZXN1cyBSdWl6IiwiY291bnRyeSI6IkVTIiwiZW1haWxBZGRyZXNzIjoiamVzdXMucnVpekBpbjIuZXMiLCJvcmdhbml6YXRpb24iOiJJTjJJTkdFTklFUkEgREUgTEEgSU5GT1JNQUNJT04gU09DSUVEQUQgTElNSVRBREEiLCJvcmdhbml6YXRpb25JZGVudGlmaWVyIjoiVkFURVMtQjYwNjQ1OTAwIiwic2VyaWFsTnVtYmVyIjoiNTY1NjU2NTZQIn0sInBvd2VyIjpbeyJpZCI6IjFhMjY2ODY1LTljZGEtNDJjNC04ODRmLWJkMThhNzllOGJmZCIsInRtZl9kb21haW4iOiJET01FIiwidG1mX2Z1bmN0aW9uIjoiT25ib2FyZGluZyIsInRtZl9hY3Rpb24iOiJFeGVjdXRlIiwidG1mX3R5cGUiOiJEb21haW4ifV0sInNpZ25lciI6eyJjb21tb25OYW1lIjoiNTY1NjU2NTZQSmVzdXNSdWl6IiwiY291bnRyeSI6IkVTIiwiZW1haWxBZGRyZXNzIjoiamVzdXMucnVpekBpbjIuZXMiLCJvcmdhbml6YXRpb24iOiJJTjIsSW5nZW5pZXLDrWFkZWxhSW5mb3JtYWNpw7NuLFMuTC4iLCJvcmdhbml6YXRpb25JZGVudGlmaWVyIjoiVkFURVUtQjk5OTk5OTk5Iiwic2VyaWFsTnVtYmVyIjoiSURDRVMtNTY1NjU2NTZQIn19fX0sImp0aSI6IjViOThhNGU3LTg3NDgtNGY1NC1iNGUyLTc3YTlhNDMzNzhkNyJ9.po849oYokXtfJimObiBaqSOw0hSAL4NKQ1LuOTonZDlntY9oEeRQPJPJA8jA3ERKwh4z-4yaaxoIqtpOfmOLR1jTl7PbIj1GAbsQ3vO-uvNL1VDkNkoMeZH_63r_8fjBCVA6aXMtMFvtYt1YDKZP30dPfwK04Hk-3qzM7dW6zRjCG8Fl-KDNlaHnepwVh1KkNAYA036JCDxkKH4UEN-Wr-Zu0Gzk5BTHvIWymymQgbkJ2fWYqJ6oFz2FlLBBWGhNZpJpLsSclVYwaHmKpntr_sa44lg76_2gi6ph1KzvNNESxJrlD5hwSmZU6Ii-JfOsEcLvRbVEsteSkdTGeqfqLtCaCdsaJ_IHDQTPqLoF9WMSm4p3dqWNy7PjbmOlhiAEyYJ2RKhLRr4qmjR-KwdUjI05iv1F9Ijm9aAAR0H0JPYmNR-Q836Y0X0epCQXMckyRDTuJHeqZ150RCQ0FwjiAn0WJ9r4MrMTDvPAyIn3g5q77ITJGfCLiFz4N3-SPwd291gQLF5hFzmWikQWIyA4860Zb_SfaJh_jW7t6PBld3Eofk_04jFU27S-Ag6caGfydtqGsejV8sryQHFyZJQR1yUwO9eWJLDaAARsvl9QtDQWfLICsQhB0syDZJAgCopAb08abNXPg0sU0izftVs7dphB6XQoZQHYKyz61ffaGFg"
