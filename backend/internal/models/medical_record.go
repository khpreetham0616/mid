package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MedicalRecord struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	PatientID     uuid.UUID      `gorm:"type:uuid;not null" json:"patient_id"`
	DoctorID      uuid.UUID      `gorm:"type:uuid;not null" json:"doctor_id"`
	AppointmentID uuid.UUID      `gorm:"type:uuid" json:"appointment_id"`
	Patient       *Patient       `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor        *Doctor        `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Diagnosis     string         `gorm:"not null" json:"diagnosis"`
	Symptoms      string         `json:"symptoms"`
	Treatment     string         `json:"treatment"`
	Notes         string         `json:"notes"`
	Vitals        string         `json:"vitals"` // JSON: BP, temp, weight, etc.
	LabReports    string         `json:"lab_reports"`
	FollowUpDate  *time.Time     `json:"follow_up_date"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (mr *MedicalRecord) BeforeCreate(tx *gorm.DB) error {
	if mr.ID == uuid.Nil {
		mr.ID = uuid.New()
	}
	return nil
}

type Symptom struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"not null;uniqueIndex" json:"name"`
	Description string         `json:"description"`
	Category    string         `json:"category"`
	Doctors     []Doctor       `gorm:"many2many:doctor_symptoms;" json:"doctors,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (s *Symptom) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}
