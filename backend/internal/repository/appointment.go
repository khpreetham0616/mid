package repository

import (
	"time"

	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"gorm.io/gorm"
)

type AppointmentRepo struct {
	db *gorm.DB
}

func NewAppointmentRepo(db *gorm.DB) *AppointmentRepo {
	return &AppointmentRepo{db: db}
}

func (r *AppointmentRepo) Create(a *models.Appointment) error {
	return r.db.Create(a).Error
}

func (r *AppointmentRepo) GetByID(id uuid.UUID) (*models.Appointment, error) {
	var a models.Appointment
	err := r.db.Preload("Patient").Preload("Doctor").Preload("Hospital").
		First(&a, "id = ?", id).Error
	return &a, err
}

func (r *AppointmentRepo) GetByDoctor(doctorID uuid.UUID, date *time.Time) ([]models.Appointment, error) {
	var appts []models.Appointment
	q := r.db.Where("doctor_id = ?", doctorID).Preload("Patient")
	if date != nil {
		start := date.Truncate(24 * time.Hour)
		end := start.Add(24 * time.Hour)
		q = q.Where("scheduled_at BETWEEN ? AND ?", start, end)
	}
	err := q.Order("scheduled_at ASC").Find(&appts).Error
	return appts, err
}

func (r *AppointmentRepo) CheckConflict(doctorID uuid.UUID, scheduledAt time.Time, duration int) (bool, error) {
	var count int64
	end := scheduledAt.Add(time.Duration(duration) * time.Minute)
	err := r.db.Model(&models.Appointment{}).
		Where("doctor_id = ? AND status NOT IN ? AND scheduled_at < ? AND scheduled_at + (duration * interval '1 minute') > ?",
			doctorID, []string{"cancelled"}, end, scheduledAt).
		Count(&count).Error
	return count > 0, err
}

func (r *AppointmentRepo) UpdateStatus(id uuid.UUID, status models.AppointmentStatus, notes string) error {
	return r.db.Model(&models.Appointment{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{"status": status, "doctor_notes": notes}).Error
}

func (r *AppointmentRepo) Update(a *models.Appointment) error {
	return r.db.Save(a).Error
}
