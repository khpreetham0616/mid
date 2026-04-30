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

type UserType string

const (
	UserTypePatient  UserType = "patient"
	UserTypeDoctor   UserType = "doctor"
	UserTypeHospital UserType = "hospital"
	UserTypeAdmin    UserType = "admin"
)

type Claims struct {
	UserID   uuid.UUID `json:"user_id"`
	MID      string    `json:"mid"`
	UserType UserType  `json:"user_type"`
	jwt.RegisteredClaims
}

type AuthService struct {
	patientRepo   *repository.PatientRepo
	doctorRepo    *repository.DoctorRepo
	hospitalRepo  *repository.HospitalRepo
	jwtSecret     string
	adminEmail    string
	adminPassword string
}

func NewAuthService(
	pr *repository.PatientRepo,
	dr *repository.DoctorRepo,
	hr *repository.HospitalRepo,
	secret, adminEmail, adminPassword string,
) *AuthService {
	return &AuthService{
		patientRepo:   pr,
		doctorRepo:    dr,
		hospitalRepo:  hr,
		jwtSecret:     secret,
		adminEmail:    adminEmail,
		adminPassword: adminPassword,
	}
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func checkPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

func validatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	return nil
}

// --- Patient ---

func (s *AuthService) RegisterPatient(p *models.Patient, password string) error {
	if err := validatePassword(password); err != nil {
		return err
	}
	hash, err := hashPassword(password)
	if err != nil {
		return err
	}
	p.PasswordHash = hash
	p.MID = GenerateMID(EntityPatient)
	return s.patientRepo.Create(p)
}

func (s *AuthService) LoginPatient(email, password string) (string, *models.Patient, error) {
	p, err := s.patientRepo.GetByEmail(email)
	if err != nil || !checkPassword(p.PasswordHash, password) {
		return "", nil, errors.New("invalid credentials")
	}
	token, err := s.generateToken(p.ID, p.MID, UserTypePatient)
	return token, p, err
}

// --- Doctor ---

func (s *AuthService) RegisterDoctor(d *models.Doctor, password string) error {
	if err := validatePassword(password); err != nil {
		return err
	}
	hash, err := hashPassword(password)
	if err != nil {
		return err
	}
	d.PasswordHash = hash
	d.MID = GenerateMID(EntityDoctor)
	return s.doctorRepo.Create(d)
}

func (s *AuthService) LoginDoctor(email, password string) (string, *models.Doctor, error) {
	d, err := s.doctorRepo.GetByEmail(email)
	if err != nil || !checkPassword(d.PasswordHash, password) {
		return "", nil, errors.New("invalid credentials")
	}
	token, err := s.generateToken(d.ID, d.MID, UserTypeDoctor)
	return token, d, err
}

// --- Hospital ---

func (s *AuthService) RegisterHospital(h *models.Hospital, password string) error {
	if err := validatePassword(password); err != nil {
		return err
	}
	hash, err := hashPassword(password)
	if err != nil {
		return err
	}
	h.PasswordHash = hash
	h.MID = GenerateMID(EntityHospital)
	return s.hospitalRepo.Create(h)
}

func (s *AuthService) LoginHospital(email, password string) (string, *models.Hospital, error) {
	h, err := s.hospitalRepo.GetByEmail(email)
	if err != nil || !checkPassword(h.PasswordHash, password) {
		return "", nil, errors.New("invalid credentials")
	}
	token, err := s.generateToken(h.ID, h.MID, UserTypeHospital)
	return token, h, err
}

// --- Admin ---

func (s *AuthService) LoginAdmin(email, password string) (string, error) {
	if email != s.adminEmail || password != s.adminPassword {
		return "", errors.New("invalid credentials")
	}
	adminID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	return s.generateToken(adminID, "ADMIN", UserTypeAdmin)
}

// --- Auto-detect login ---

func (s *AuthService) LoginAuto(email, password string) (string, string, interface{}, error) {
	if p, err := s.patientRepo.GetByEmail(email); err == nil && checkPassword(p.PasswordHash, password) {
		token, err := s.generateToken(p.ID, p.MID, UserTypePatient)
		return token, "patient", p, err
	}
	if d, err := s.doctorRepo.GetByEmail(email); err == nil && checkPassword(d.PasswordHash, password) {
		token, err := s.generateToken(d.ID, d.MID, UserTypeDoctor)
		return token, "doctor", d, err
	}
	if h, err := s.hospitalRepo.GetByEmail(email); err == nil && checkPassword(h.PasswordHash, password) {
		token, err := s.generateToken(h.ID, h.MID, UserTypeHospital)
		return token, "hospital", h, err
	}
	if email == s.adminEmail && password == s.adminPassword {
		adminID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
		token, err := s.generateToken(adminID, "ADMIN", UserTypeAdmin)
		return token, "admin", map[string]string{"email": email, "name": "Super Admin", "mid": "ADMIN"}, err
	}
	return "", "", nil, errors.New("invalid credentials")
}

// --- Token ---

func (s *AuthService) generateToken(userID uuid.UUID, mid string, userType UserType) (string, error) {
	claims := &Claims{
		UserID:   userID,
		MID:      mid,
		UserType: userType,
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
