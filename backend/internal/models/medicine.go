package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Medicine struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string         `gorm:"not null;uniqueIndex" json:"name"`
	GenericName string         `json:"generic_name"`
	Category    string         `json:"category"`
	Manufacturer string        `json:"manufacturer"`
	Description string         `json:"description"`
	Dosage      string         `json:"dosage"`
	SideEffects string         `json:"side_effects"`
	Price       float64        `json:"price"`
	IsAvailable bool           `gorm:"default:true" json:"is_available"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (m *Medicine) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

type Prescription struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	RecordID      uuid.UUID      `gorm:"type:uuid" json:"record_id"`
	PatientID     uuid.UUID      `gorm:"type:uuid;not null" json:"patient_id"`
	DoctorID      uuid.UUID      `gorm:"type:uuid;not null" json:"doctor_id"`
	MedicineID    *uuid.UUID     `gorm:"type:uuid" json:"medicine_id"`
	Medicine      *Medicine      `gorm:"foreignKey:MedicineID" json:"medicine,omitempty"`
	MedicineName  string         `gorm:"not null" json:"medicine_name"`
	Dosage        string         `json:"dosage"`
	Frequency     string         `json:"frequency"`
	Duration      string         `json:"duration"`
	Instructions  string         `json:"instructions"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (p *Prescription) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
