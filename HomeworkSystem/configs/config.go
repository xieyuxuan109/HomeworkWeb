package configs

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB
var err error

type Config struct {
	DB_HOST     string
	DB_PORT     string
	DB_USER     string
	DB_PASSWORD string
	DB_NAME     string
	APP_PORT    string
	GIN_MODE    string
	DB_MAX_IDLE int
	DB_MAX_OPEN int
	DB_MAX_LIFE time.Duration
}

func getEnvInt(key string, defaultValue int) int {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	parsed, err := strconv.Atoi(v)
	if err != nil || parsed <= 0 {
		return defaultValue
	}
	return parsed
}

func Load() *Config {
	cfg := &Config{
		DB_HOST:     os.Getenv("DB_HOST"),
		DB_PORT:     os.Getenv("DB_PORT"),
		DB_USER:     os.Getenv("DB_USER"),
		DB_PASSWORD: os.Getenv("DB_PASSWORD"),
		DB_NAME:     os.Getenv("DB_NAME"),
		APP_PORT:    os.Getenv("APP_PORT"),
		GIN_MODE:    os.Getenv("GIN_MODE"),
		DB_MAX_IDLE: getEnvInt("DB_MAX_IDLE", 10),
		DB_MAX_OPEN: getEnvInt("DB_MAX_OPEN", 50),
		DB_MAX_LIFE: time.Duration(getEnvInt("DB_MAX_LIFE_MINUTES", 30)) * time.Minute,
	}
	if cfg.DB_HOST == "" {
		cfg.DB_HOST = "mysql"
	}
	if cfg.DB_PORT == "" {
		cfg.DB_PORT = "3306"
		// log.Fatal("缺少环境变量 DB_PORT")
	}
	if cfg.DB_USER == "" {
		cfg.DB_USER = "user"
		// log.Println("缺少环境变量 DB_USER")
	}
	if cfg.DB_PASSWORD == "" {
		cfg.DB_PASSWORD = "user"
		// log.Println("缺少环境变量 DB_PASSWORD")
	}
	if cfg.DB_NAME == "" {
		cfg.DB_NAME = "homeworksystem"
	}
	if cfg.APP_PORT == "" {
		cfg.APP_PORT = "8080"
	}
	if cfg.GIN_MODE == "" {
		cfg.GIN_MODE = "release"
	}
	return cfg
}

func InitDB(config *Config) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", config.DB_USER, config.DB_PASSWORD, config.DB_HOST, config.DB_PORT, config.DB_NAME)
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	configurePool(sqlDB, config)
	return nil
}

func configurePool(sqlDB *sql.DB, config *Config) {
	sqlDB.SetMaxIdleConns(config.DB_MAX_IDLE)
	sqlDB.SetMaxOpenConns(config.DB_MAX_OPEN)
	sqlDB.SetConnMaxLifetime(config.DB_MAX_LIFE)
}
