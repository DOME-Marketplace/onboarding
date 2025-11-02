package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/evidenceledger/domeonboarding/faster"
	_ "github.com/evidenceledger/domeonboarding/migrations"
	"github.com/evidenceledger/domeonboarding/onboarding"
	"github.com/hesusruiz/vcutils/yaml"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

const (
	defaultConfigFileName  = "config/dev_config.yaml"
	defaultBuildConfigFile = "buildfront.yaml"
	devModeEnvVar          = "DOME_DEV_MODE" // Environment variable to enable development mode
)

type Config struct {
	Server *onboarding.Config `yaml:"server"`
}

func (s *Config) Validate() error {
	if s.Server == nil {
		return errors.New("server configuration is missing")
	}
	return s.Server.Validate()
}

func main() {
	// Determine if we're in development mode (go run or env var)
	isDevMode := isDevelopmentMode()

	// Detect the base directory
	baseDir, err := detectBaseDir()
	if err != nil {
		log.Fatalf("Error detecting base directory: %v", err)
	}

	// Load configuration
	configFilePath := LookupEnvOrString("DOME_CONFIG_FILE", filepath.Join(baseDir, defaultConfigFileName))
	rootCfg, err := readConfiguration(configFilePath)
	if err != nil {
		log.Fatalf("Error reading configuration: %v", err)
	}

	fmt.Println("Configuration:", configFilePath)

	// Create and start the server
	if err := startServer(rootCfg, isDevMode); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

func detectBaseDir() (baseDir string, err error) {
	// Loosely check if it was executed using "go run"
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())

	if isGoRun {
		// Probably ran with go run
		var err error
		baseDir, err = os.Getwd()
		if err != nil {
			return "", fmt.Errorf("getting working directory: %w", err)
		}
	} else {
		// Probably ran with go build
		baseDir = filepath.Dir(os.Args[0])
	}
	return baseDir, nil
}

func isDevelopmentMode() bool {
	// Check for the environment variable or if it's likely "go run"
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
	debugger := strings.Contains(os.Args[0], "debug")
	return isGoRun || os.Getenv(devModeEnvVar) == "true" || debugger
}

func startServer(rootCfg *Config, isDevMode bool) error {
	// Create a new Onboarding server with its configuration
	server := onboarding.New(rootCfg.Server)
	app := server.App

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		// (the isDevMode check is to enable it only during development)
		Automigrate: isDevMode,
	})

	if isDevMode {
		go func() {
			if err := faster.WatchAndBuild(defaultBuildConfigFile); err != nil {
				log.Printf("Error in faster.WatchAndBuild: %v", err)
			}
		}()
	}

	return server.Start()
}

// readConfiguration reads a YAML file and creates an easy-to navigate structure
func readConfiguration(configFile string) (*Config, error) {
	var cfg *yaml.YAML
	var err error

	cfg, err = yaml.ParseYamlFile(configFile)
	if err != nil {
		return nil, fmt.Errorf("config file not found or invalid: %s, error: %w", configFile, err)
	}

	config, err := ConfigFromMap(cfg)
	if err != nil {
		return nil, fmt.Errorf("config file not well formed: %s, error: %w", configFile, err)
	}
	return config, nil
}

// ConfigFromMap parses and validates a configuration specified in YAML,
// returning the config in a struct format.
func ConfigFromMap(cfg *yaml.YAML) (*Config, error) {
	d, err := json.Marshal(cfg.Data())
	if err != nil {
		return nil, fmt.Errorf("marshalling config data: %w", err)
	}

	config := &Config{}
	err = json.Unmarshal(d, config)
	if err != nil {
		return nil, fmt.Errorf("unmarshalling config data: %w", err)
	}

	err = config.Validate()
	if err != nil {
		return nil, fmt.Errorf("validating config: %w", err)
	}

	return config, nil
}

func LookupEnvOrString(key string, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
}
