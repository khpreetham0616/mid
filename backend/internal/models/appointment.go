package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AppointmentStatus string

const (
	StatusPending   AppointmentStatus = "pending"
	StatusConfirmed AppointmentStatus = "confirmed"
	StatusCompleted AppointmentStatus = "completed"
	StatusCancelled AppointmentStatus = "cancelled"
)

type Appointment struct {
	ID           uuid.UUID         `gorm:"type:uuid;primaryKey" json:"id"`
	PatientID    uuid.UUID         `gorm:"type:uuid;not null" json:"patient_id"`
	DoctorID     uuid.UUID         `gorm:"type:uuid;not null" json:"doctor_id"`
	HospitalID   *uuid.UUID        `gorm:"type:uuid" json:"hospital_id,omitempty"`
	Patient      *Patient          `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor       *Doctor           `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Hospital     *Hospital         `gorm:"foreignKey:HospitalID" json:"hospital,omitempty"`
	ScheduledAt  time.Time         `gorm:"not null" json:"scheduled_at"`
	Duration     int               `gorm:"default:30" json:"duration_minutes"`
	Status       AppointmentStatus `gorm:"default:'pending'" json:"status"`
	Symptoms     string            `json:"symptoms"`
	Notes        string            `json:"notes"`
	DoctorNotes  string            `json:"doctor_notes"`
	ConsultFee   float64           `json:"consult_fee"`
	CreatedAt    time.Time         `json:"created_at"`
	UpdatedAt    time.Time         `json:"updated_at"`
	DeletedAt    gorm.DeletedAt    `gorm:"index" json:"-"`
}

func (a *Appointment) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
