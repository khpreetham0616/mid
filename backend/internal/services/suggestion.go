package services

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
	"github.com/redis/go-redis/v9"
)

type SuggestionService struct {
	doctorRepo   *repository.DoctorRepo
	hospitalRepo *repository.HospitalRepo
	rdb          *redis.Client
}

type SuggestionResult struct {
	Doctors   []models.Doctor   `json:"doctors"`
	Hospitals []models.Hospital `json:"hospitals"`
}

func NewSuggestionService(dr *repository.DoctorRepo, hr *repository.HospitalRepo, rdb *redis.Client) *SuggestionService {
	return &SuggestionService{doctorRepo: dr, hospitalRepo: hr, rdb: rdb}
}

func (s *SuggestionService) Suggest(symptoms []string) (*SuggestionResult, error) {
	cacheKey := "suggest:" + strings.Join(symptoms, ",")
	ctx := context.Background()

	if s.rdb != nil {
		if cached, err := s.rdb.Get(ctx, cacheKey).Bytes(); err == nil {
			var result SuggestionResult
			if json.Unmarshal(cached, &result) == nil {
				return &result, nil
			}
		}
	}

	doctors, err := s.doctorRepo.SearchBySymptoms(symptoms)
	if err != nil {
		return nil, err
	}
	hospitals, err := s.hospitalRepo.SearchBySymptoms(symptoms)
	if err != nil {
		return nil, err
	}

	result := &SuggestionResult{Doctors: doctors, Hospitals: hospitals}
	if s.rdb != nil {
		if data, err := json.Marshal(result); err == nil {
			s.rdb.Set(ctx, cacheKey, data, 10*time.Minute)
		}
	}
	return result, nil
}
