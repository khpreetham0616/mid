package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Patient struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	MID            string         `gorm:"uniqueIndex;not null" json:"mid"`
	FirstName      string         `gorm:"not null" json:"first_name"`
	LastName       string         `gorm:"not null" json:"last_name"`
	Email          string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash   string         `gorm:"not null" json:"-"`
	Phone          string         `json:"phone"`
	DateOfBirth    time.Time      `json:"date_of_birth"`
	Gender         string         `json:"gender"`
	BloodGroup     string         `json:"blood_group"`
	Address        string         `json:"address"`
	City           string         `json:"city"`
	EmergencyName  string         `json:"emergency_contact_name"`
	EmergencyPhone string         `json:"emergency_contact_phone"`
	Allergies      string         `json:"allergies"`
	ChronicDiseases string        `json:"chronic_diseases"`
	ProfileImage   string         `json:"profile_image"`
	Appointments   []Appointment  `gorm:"foreignKey:PatientID" json:"appointments,omitempty"`
	MedicalRecords []MedicalRecord `gorm:"foreignKey:PatientID" json:"medical_records,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *Patient) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
