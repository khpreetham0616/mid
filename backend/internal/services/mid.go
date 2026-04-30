package services

import (
	"fmt"
	"math/rand"
	"time"
)

type EntityType string

const (
	EntityDoctor   EntityType = "D"
	EntityHospital EntityType = "H"
	EntityPatient  EntityType = "P"
)

func GenerateMID(entityType EntityType) string {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	year := time.Now().Year() % 100
	random := rng.Intn(900000) + 100000
	return fmt.Sprintf("%s-MID-%02d-%d", string(entityType), year, random)
}
