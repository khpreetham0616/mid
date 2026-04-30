package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Doctor struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	MID            string         `gorm:"uniqueIndex;not null" json:"mid"`
	FirstName      string         `gorm:"not null" json:"first_name"`
	LastName       string         `gorm:"not null" json:"last_name"`
	Email          string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string         `gorm:"not null" json:"-"`
	Phone          string         `gorm:"not null" json:"phone"`
	Specialization string         `gorm:"not null" json:"specialization"`
	Qualification  string         `json:"qualification"`
	ExperienceYrs  int            `json:"experience_years"`
	Bio            string         `json:"bio"`
	ConsultFee     float64        `json:"consult_fee"`
	Rating         float64        `gorm:"default:0" json:"rating"`
	IsAvailable    bool           `gorm:"default:true" json:"is_available"`
	ProfileImage   string         `json:"profile_image"`
	City           string         `json:"city"`
	State          string         `json:"state"`
	Latitude       float64        `json:"latitude"`
	Longitude      float64        `json:"longitude"`
	Hospitals      []Hospital     `gorm:"many2many:doctor_hospitals;" json:"hospitals,omitempty"`
	Symptoms       []Symptom      `gorm:"many2many:doctor_symptoms;" json:"symptoms,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (d *Doctor) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

type DoctorHospital struct {
	DoctorID     uuid.UUID `gorm:"type:uuid;primaryKey" json:"doctor_id"`
	HospitalID   uuid.UUID `gorm:"type:uuid;primaryKey" json:"hospital_id"`
	Schedule     string    `json:"schedule"`
	IsAffiliated bool      `gorm:"default:true" json:"is_affiliated"`
}

type DoctorSymptom struct {
	DoctorID  uuid.UUID `gorm:"type:uuid;primaryKey" json:"doctor_id"`
	SymptomID uuid.UUID `gorm:"type:uuid;primaryKey" json:"symptom_id"`
}
