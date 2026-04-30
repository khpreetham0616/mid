package database

import (
	"context"
	"log"
	"time"

	"github.com/mid/backend/internal/config"
	"github.com/redis/go-redis/v9"
)

var RDB *redis.Client

func InitRedis(cfg *config.Config) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPass,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := rdb.Ping(ctx).Result(); err != nil {
		return nil, err
	}

	RDB = rdb
	log.Println("Redis connected")
	return rdb, nil
}
