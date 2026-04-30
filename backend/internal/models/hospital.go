package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Hospital struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	MID           string         `gorm:"uniqueIndex;not null" json:"mid"`
	Name          string         `gorm:"not null" json:"name"`
	Email         string         `gorm:"uniqueIndex" json:"email"`
	Phone         string         `gorm:"not null" json:"phone"`
	Address       string         `gorm:"not null" json:"address"`
	City          string         `gorm:"not null" json:"city"`
	State         string         `json:"state"`
	Country       string         `gorm:"default:'India'" json:"country"`
	Pincode       string         `json:"pincode"`
	Latitude      float64        `json:"latitude"`
	Longitude     float64        `json:"longitude"`
	Type          string         `gorm:"default:'General'" json:"type"` // General, Specialty, Clinic, etc.
	Beds          int            `json:"beds"`
	Departments   string         `json:"departments"` // JSON array as string
	Facilities    string         `json:"facilities"`  // JSON array as string
	Rating        float64        `gorm:"default:0" json:"rating"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	ProfileImage  string         `json:"profile_image"`
	Doctors       []Doctor       `gorm:"many2many:doctor_hospitals;" json:"doctors,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

func (h *Hospital) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	return nil
}
