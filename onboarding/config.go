package onboarding

import (
	"crypto/ecdsa"
	"encoding/json"
	"fmt"

	"github.com/hesusruiz/vcutils/yaml"
)

type Environment string

const Production Environment = "production"
const Preproduction Environment = "preproduction"
const Development Environment = "development"

type Config struct {
	Environment            Environment `json:"environment,omitempty"`
	ListenAddress          string      `json:"listenAddress,omitempty"`
	CredentialIssuancePath string      `json:"credentialIssuancePath,omitempty"`
	MyDidkey               string      `json:"mydidkey,omitempty"`
	VerifierURL            string      `json:"verifierURL,omitempty"`
	VerifierTokenEndpoint  string      `json:"verifierTokenEndpoint,omitempty"`
	PrivateKeyFilePEM      string      `json:"privateKeyFilePEM,omitempty"`
	MachineCredentialFile  string      `json:"machineCredentialFile,omitempty"`

	privateKey        *ecdsa.PrivateKey
	machineCredential string

	// rest of the fields
	AppName          string     `json:"appName,omitempty"`
	ServerURL        string     `json:"serverURL,omitempty"`
	SenderName       string     `json:"senderName,omitempty"`
	SenderAddress    string     `json:"senderAddress,omitempty"`
	SMTP             SMTPConfig `json:"smtp,omitempty"`
	SupportTeamEmail []string   `json:"supportTeamEmail,omitempty"`
}

type SMTPConfig struct {
	Enabled      bool   `json:"enabled,omitempty"`
	Host         string `json:"host,omitempty"`
	Port         int    `json:"port,omitempty"`
	Tls          bool   `json:"tls,omitempty"`
	Username     string `json:"username,omitempty"`
	password     string
	PasswordFile string `json:"passwordFile,omitempty"`
}

// ConfigFromMap parses and validates a configuration specified in YAML,
// returning the config in a struct format.
func ConfigFromMap(cfg *yaml.YAML) (*Config, error) {
	d, err := json.Marshal(cfg.Data())
	if err != nil {
		return nil, err
	}

	config := &Config{}
	err = json.Unmarshal(d, config)
	if err != nil {
		return nil, err
	}

	err = config.Validate()

	return config, err

}

func (s *Config) SetDefaults() {

}

func (cfg *Config) Validate() (err error) {
	if cfg.Environment == "" {
		cfg.Environment = Development
	}
	if cfg.ListenAddress == "" {
		cfg.ListenAddress = ":8090"
	}
	if cfg.CredentialIssuancePath == "" {
		return fmt.Errorf("credentialIssuancePath is required")
	}
	if cfg.MyDidkey == "" {
		return fmt.Errorf("mydidkey is required")
	}
	if cfg.VerifierURL == "" {
		return fmt.Errorf("verifierURL is required")
	}
	if cfg.VerifierTokenEndpoint == "" {
		return fmt.Errorf("verifierTokenEndpoint is required")
	}
	if cfg.PrivateKeyFilePEM == "" {
		return fmt.Errorf("privateKeyFilePEM is required")
	}
	if cfg.MachineCredentialFile == "" {
		return fmt.Errorf("machineCredentialFile is required")
	}
	if cfg.AppName == "" {
		return fmt.Errorf("appName is required")
	}
	if cfg.ServerURL == "" {
		return fmt.Errorf("serverURL is required")
	}
	if cfg.SenderName == "" {
		return fmt.Errorf("senderName is required")
	}
	if cfg.SenderAddress == "" {
		return fmt.Errorf("senderAddress is required")
	}
	if len(cfg.SupportTeamEmail) == 0 {
		return fmt.Errorf("supportTeamEmail is required")
	}

	if !cfg.SMTP.Enabled {
		return fmt.Errorf("smtp.enabled is required")
	}
	if cfg.SMTP.Host == "" {
		return fmt.Errorf("smtp.host is required")
	}
	if cfg.SMTP.Port == 0 {
		return fmt.Errorf("smtp.port is required")
	}
	if cfg.SMTP.Username == "" {
		return fmt.Errorf("smtp.username is required")
	}
	if cfg.SMTP.PasswordFile == "" {
		return fmt.Errorf("smtp.passwordFile is required")
	}

	return nil
}

func (s *Config) Copy() Config {
	return Config{}
}

func (s *Config) OverrideWith(other Config) {

}

func (s *Config) String() string {
	return ""
}
