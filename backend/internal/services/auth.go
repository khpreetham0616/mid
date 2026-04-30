package services

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	patientRepo *repository.PatientRepo
	jwtSecret   string
}

type Claims struct {
	PatientID uuid.UUID `json:"patient_id"`
	MID       string    `json:"mid"`
	jwt.RegisteredClaims
}

func NewAuthService(pr *repository.PatientRepo, secret string) *AuthService {
	return &AuthService{patientRepo: pr, jwtSecret: secret}
}

func (s *AuthService) Register(p *models.Patient, password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	p.PasswordHash = string(hash)
	p.MID = GenerateMID(EntityPatient)
	return s.patientRepo.Create(p)
}

func (s *AuthService) Login(email, password string) (string, *models.Patient, error) {
	p, err := s.patientRepo.GetByEmail(email)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(p.PasswordHash), []byte(password)); err != nil {
		return "", nil, errors.New("invalid credentials")
	}
	token, err := s.generateToken(p)
	return token, p, err
}

func (s *AuthService) generateToken(p *models.Patient) (string, error) {
	claims := &Claims{
		PatientID: p.ID,
		MID:       p.MID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return token.Claims.(*Claims), nil
}
