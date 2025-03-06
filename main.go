package main

import (
	"encoding/json"
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

const defaultConfigFileName = "config/server.yaml"
const defaultBuildConfigFile = "./data/config/devserver.yaml"

var baseDir string

type Config struct {
	Server *onboarding.Config `yaml:"server"`
}

func (s *Config) Validate() (err error) {

	return s.Server.Validate()
}

func main() {

	// Loosely check if it was executed using "go run"
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())

	// Detect the location of the main config file
	if isGoRun {
		// Probably ran with go run
		baseDir, _ = os.Getwd()
	} else {
		// Probably ran with go build
		baseDir = filepath.Dir(os.Args[0])
	}

	// The full path to the default config file, in the same place as the program binary
	defaultConfigFilePath := filepath.Join(baseDir, defaultConfigFileName)

	// Read configuration file
	rootCfg := readConfiguration(LookupEnvOrString("CONFIG_FILE", defaultConfigFilePath))

	// Create a new Onboarding server with its configuration
	server := onboarding.New(rootCfg.Server)
	app := server.App

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		// (the isGoRun check is to enable it only during development)
		Automigrate: isGoRun,
	})

	// *******************************************
	// *******************************************
	// *******************************************
	// *******************************************
	if isGoRun {
		go faster.WatchAndBuild("buildfront.yaml")
	}

	if err := server.Start(); err != nil {
		log.Fatal(err)
	}
}

// readConfiguration reads a YAML file and creates an easy-to navigate structure
func readConfiguration(configFile string) *Config {
	var cfg *yaml.YAML
	var err error

	cfg, err = yaml.ParseYamlFile(configFile)
	if err != nil {
		fmt.Printf("Config file not found, exiting\n")
		panic(err)
	}

	config, err := ConfigFromMap(cfg)
	if err != nil {
		fmt.Printf("Config file not well formed, exiting\n")
		panic(err)
	}
	return config
}

func LookupEnvOrString(key string, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
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
