package ishare

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/evidenceledger/domeonboarding/internal/djson"
	"github.com/evidenceledger/domeonboarding/internal/x509util"
	"github.com/golang-jwt/jwt/v5"
)

// The Participant Registry URLs are
//
// Obtains access token: https://sat1-mw.az.isharetest.net/connect/token
// Obtains information on iSHARE party: https://sat1-mw.az.isharetest.net[/version]/parties/{partyId}
// Retrieves iSHARE capabilities: https://sat1-mw.az.isharetest.net/capabilities
//
// Dev portal lists all the specifications https://dev.ishare.eu/ishare-satellite-role/parties

const (
	iShareCapabilitiesUrl = "https://sat1-mw.az.isharetest.net/capabilities"
	iShareTokenUrl        = "https://sat1-mw.az.isharetest.net/connect/token"
	iSharePartiesListUrl  = "https://sat1-mw.az.isharetest.net/parties"
	iSharePartyInfoUrl    = "https://sat1-mw.az.isharetest.net/parties"
)

type Options struct {
	CredentialsDir        string
	PrivateKeyFilePEM     string
	PublicKeyFilePEM      string
	Debug                 bool
	NoColor               bool
	IShareCapabilitiesUrl string
	IShareTokenUrl        string
	ISharePartiesListUrl  string
	ISharePartyInfoUrl    string
}

var defaultOptions = &Options{
	CredentialsDir:        "config/ishare/",
	PrivateKeyFilePEM:     "in2priv.pem",
	PublicKeyFilePEM:      "in2pub.pem",
	Debug:                 false,
	NoColor:               false,
	IShareCapabilitiesUrl: iShareCapabilitiesUrl,
	IShareTokenUrl:        iShareTokenUrl,
	ISharePartiesListUrl:  iSharePartiesListUrl,
	ISharePartyInfoUrl:    iSharePartyInfoUrl,
}

var httpclient = &http.Client{
	Timeout: time.Minute,
}

type iSHARE struct {
	myEORI       string
	myELSIID     string
	myDID        string
	myDIDU       string
	iShareID     string
	opts         *Options
	privateKey   any
	certs        []*x509.Certificate
	capabilities map[string]any
}

func NewIShare(options *Options) (*iSHARE, error) {
	tl := &iSHARE{}

	if options == nil {
		options = defaultOptions
	}
	tl.opts = options
	if tl.opts.CredentialsDir == "" {
		tl.opts.CredentialsDir = defaultOptions.CredentialsDir
	}
	if tl.opts.PrivateKeyFilePEM == "" {
		tl.opts.PrivateKeyFilePEM = defaultOptions.PrivateKeyFilePEM
	}
	if tl.opts.PublicKeyFilePEM == "" {
		tl.opts.PublicKeyFilePEM = defaultOptions.PublicKeyFilePEM
	}
	if tl.opts.IShareCapabilitiesUrl == "" {
		tl.opts.IShareCapabilitiesUrl = defaultOptions.IShareCapabilitiesUrl
	}
	if tl.opts.IShareTokenUrl == "" {
		tl.opts.IShareTokenUrl = defaultOptions.IShareTokenUrl
	}
	if tl.opts.ISharePartiesListUrl == "" {
		tl.opts.ISharePartiesListUrl = defaultOptions.ISharePartiesListUrl
	}
	if tl.opts.ISharePartyInfoUrl == "" {
		tl.opts.ISharePartyInfoUrl = defaultOptions.ISharePartyInfoUrl
	}

	err := tl.readCertificates()
	if err != nil {
		return nil, err
	}

	capabilities, err := tl.Capabilities()
	if err != nil {
		return nil, err
	}
	tl.capabilities = capabilities

	tl.iShareID = djson.GetString(capabilities, "iss")

	return tl, nil
}

func (tl *iSHARE) readCertificates() error {

	// Read the private key
	privateKeyFilePEMPath := path.Join(tl.opts.CredentialsDir, tl.opts.PrivateKeyFilePEM)
	pemBytesRaw, err := os.ReadFile(privateKeyFilePEMPath)
	if err != nil {
		return err
	}

	// Decode from the PEM format
	pemBlock, _ := pem.Decode(pemBytesRaw)
	privKeyAny, err := x509.ParsePKCS8PrivateKey(pemBlock.Bytes)
	if err != nil {
		return err
	}
	tl.privateKey = privKeyAny

	// Read the public key chain file
	publicKeyFilePEMPath := path.Join(tl.opts.CredentialsDir, tl.opts.PublicKeyFilePEM)
	pemPublicBytesRaw, err := os.ReadFile(publicKeyFilePEMPath)
	if err != nil {
		return err
	}

	// Decode from the PEM format
	certs, err := getCertsFromPEM(pemPublicBytesRaw)
	if err != nil {
		return err
	}
	if len(certs) == 0 {
		return errors.New("no certificates found")
	}
	tl.certs = certs

	// Get our information from the first certificate in the chain
	cert := certs[0]
	eName := x509util.ParseEIDASNameFromATVSequence(cert.Subject.Names)

	// TODO: fix this once iSHARE has fixed the EORI thing
	tl.myELSIID = eName.OrganizationIdentifier
	tl.myDID = "EU.EORI.ESB60645900"
	tl.myDIDU = strings.ReplaceAll(tl.myDID, ":", "%3A")
	tl.myEORI = "EU.EORI.ESB60645900"

	return nil

}

func getCertsFromPEM(pemCerts []byte) ([]*x509.Certificate, error) {

	var certs []*x509.Certificate

	for len(pemCerts) > 0 {
		var block *pem.Block
		block, pemCerts = pem.Decode(pemCerts)
		if block == nil {
			break
		}
		if block.Type != "CERTIFICATE" || len(block.Headers) != 0 {
			continue
		}

		certBytes := block.Bytes
		cert, err := x509.ParseCertificate(certBytes)
		if err != nil {
			continue
		}
		certs = append(certs, cert)

	}

	return certs, nil

}

func (tl *iSHARE) Capabilities() (map[string]any, error) {

	// Get the iShare capabilities
	resp, err := http.Get(tl.opts.IShareCapabilitiesUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Decode response
	type response struct {
		CapabilitiesToken string `json:"capabilities_token"`
	}
	var r response
	err = json.Unmarshal(body, &r)
	if err != nil {
		return nil, err
	}

	// Decode JWt, without verifying signature
	p := jwt.NewParser()
	tok, _, err := p.ParseUnverified(r.CapabilitiesToken, jwt.MapClaims{})
	if err != nil {
		return nil, err
	}

	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	return claims, nil
}

func (tl *iSHARE) NewAssertion() (string, error) {
	var method jwt.SigningMethod

	switch expression := tl.privateKey.(type) {
	case *ecdsa.PrivateKey:
		method = jwt.SigningMethodES256
	case *rsa.PrivateKey:
		method = jwt.SigningMethodRS256
	default:
		return "", fmt.Errorf("unsupported private key type: %T", expression)
	}

	var headerCerts []string

	// Build the header with certificates
	for _, cert := range tl.certs {

		var b bytes.Buffer
		encoder := base64.NewEncoder(base64.StdEncoding, &b)
		encoder.Write(cert.Raw)
		encoder.Close()

		ss := b.String()
		headerCerts = append(headerCerts, ss)

	}

	// This is the object to create the Client Assertion
	type iShareAssertion struct {
		jwt.RegisteredClaims
	}
	claims := iShareAssertion{}

	// I am the issuer of this token
	claims.Issuer = tl.myDID
	claims.Subject = tl.myDID

	// Set the claims with timestamps
	now := time.Now()
	claims.ExpiresAt = jwt.NewNumericDate(now.Add(30 * time.Second))
	claims.IssuedAt = jwt.NewNumericDate(now)

	// Set the aud field as a single string
	jwt.MarshalSingleStringAsArray = false
	claims.Audience = jwt.ClaimStrings{tl.iShareID}

	// The nonce for the token
	claims.ID = GenerateNonce()

	// Generate the token ready to be signed
	token := jwt.NewWithClaims(method, claims)

	// Add the kid header
	token.Header["x5c"] = headerCerts

	return token.SignedString(tl.privateKey)

}

func (tl *iSHARE) TokenRequest() (string, error) {

	// Get a new client assertion
	clientAssertion, err := tl.NewAssertion()
	if err != nil {
		return "", err
	}

	// The request buffer
	var b bytes.Buffer
	b.WriteString("grant_type=client_credentials&")
	b.WriteString("scope=iSHARE&")
	b.WriteString("client_id=" + tl.myDID + "&")
	b.WriteString("client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&")
	b.WriteString("client_assertion=")
	b.WriteString(clientAssertion)

	requestBody := b.Bytes()
	err = os.WriteFile("token_request.txt", requestBody, 0644)
	if err != nil {
		return "", err
	}

	theBody := bytes.NewBuffer(requestBody)

	// The request to send
	req, _ := http.NewRequest("POST", tl.opts.IShareTokenUrl, theBody)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode > 399 {
		fmt.Println("Error calling Token Endpoint:", resp.Status)
		return "", fmt.Errorf("error calling Token Endpoint: %v", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// Decode response
	type response struct {
		AccessToken string `json:"access_token"`
	}
	var r response
	err = json.Unmarshal(body, &r)
	if err != nil {
		return "", err
	}

	return r.AccessToken, nil
}

func (tl *iSHARE) PartiesList(accessToken string) (map[string]any, error) {

	req, err := http.NewRequestWithContext(context.Background(), "GET", tl.opts.ISharePartiesListUrl, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Get the iShare capabilities
	resp, err := httpclient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Decode response
	type response struct {
		PartiesToken string `json:"parties_token,omitempty"`
	}
	var r response
	err = json.Unmarshal(body, &r)
	if err != nil {
		return nil, err
	}

	// Decode JWT, without verifying signature
	p := jwt.NewParser()
	tok, _, err := p.ParseUnverified(r.PartiesToken, jwt.MapClaims{})
	if err != nil {
		return nil, err
	}

	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	return claims, nil
}

func (tl *iSHARE) PartyInfo(partyID string, accessToken string) (map[string]any, error) {

	// requestURL := baseURL + "/" + partyID
	requestURL := tl.opts.ISharePartyInfoUrl + "/" + partyID

	req, err := http.NewRequestWithContext(context.Background(), "GET", requestURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	// Get the iShare capabilities
	resp, err := httpclient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Decode response
	type response struct {
		PartyToken string `json:"party_token"`
	}
	var r response
	err = json.Unmarshal(body, &r)
	if err != nil {
		return nil, err
	}

	// Decode JWt, without verifying signature
	p := jwt.NewParser()
	tok, _, err := p.ParseUnverified(r.PartyToken, jwt.MapClaims{})
	if err != nil {
		return nil, err
	}

	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}

	return claims, nil
}

func GenerateNonce() string {
	b := make([]byte, 16)
	io.ReadFull(rand.Reader, b)
	nonce := base64.RawURLEncoding.EncodeToString(b)
	return nonce
}
