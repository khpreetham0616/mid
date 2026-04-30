package services

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

type EntityType string

const (
	EntityDoctor   EntityType = "DOC"
	EntityHospital EntityType = "HOS"
	EntityPatient  EntityType = "PAT"
)

func GenerateMID(entityType EntityType) string {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	year := time.Now().Year() % 100
	random := rand.Intn(900000) + 100000
	return fmt.Sprintf("MID-%s-%02d-%d", strings.ToUpper(string(entityType)), year, random)
}
