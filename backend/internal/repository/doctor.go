package repository

import (
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"gorm.io/gorm"
)

type DoctorRepo struct {
	db *gorm.DB
}

func NewDoctorRepo(db *gorm.DB) *DoctorRepo {
	return &DoctorRepo{db: db}
}

func (r *DoctorRepo) Create(doc *models.Doctor) error {
	return r.db.Create(doc).Error
}

func (r *DoctorRepo) GetByID(id uuid.UUID) (*models.Doctor, error) {
	var doc models.Doctor
	err := r.db.Preload("Hospitals").Preload("Symptoms").First(&doc, "id = ?", id).Error
	return &doc, err
}

func (r *DoctorRepo) GetByMID(mid string) (*models.Doctor, error) {
	var doc models.Doctor
	err := r.db.Preload("Hospitals").Preload("Symptoms").First(&doc, "mid = ?", mid).Error
	return &doc, err
}

func (r *DoctorRepo) GetByEmail(email string) (*models.Doctor, error) {
	var doc models.Doctor
	err := r.db.First(&doc, "email = ?", email).Error
	return &doc, err
}

func (r *DoctorRepo) List(page, limit int, specialization string) ([]models.Doctor, int64, error) {
	var docs []models.Doctor
	var total int64
	q := r.db.Model(&models.Doctor{})
	if specialization != "" {
		q = q.Where("specialization ILIKE ?", "%"+specialization+"%")
	}
	q.Count(&total)
	err := q.Preload("Hospitals").Preload("Symptoms").
		Offset((page - 1) * limit).Limit(limit).
		Order("rating DESC").Find(&docs).Error
	return docs, total, err
}

func (r *DoctorRepo) ListByCity(page, limit int, city, specialization string) ([]models.Doctor, int64, error) {
	var docs []models.Doctor
	var total int64
	q := r.db.Model(&models.Doctor{})
	if city != "" {
		q = q.Where("city ILIKE ?", "%"+city+"%")
	}
	if specialization != "" {
		q = q.Where("specialization ILIKE ?", "%"+specialization+"%")
	}
	q.Count(&total)
	err := q.Preload("Hospitals").Preload("Symptoms").
		Offset((page - 1) * limit).Limit(limit).
		Order("rating DESC").Find(&docs).Error
	return docs, total, err
}

func (r *DoctorRepo) SearchBySymptoms(symptomNames []string) ([]models.Doctor, error) {
	var docs []models.Doctor
	err := r.db.
		Joins("JOIN doctor_symptoms ds ON ds.doctor_id = doctors.id").
		Joins("JOIN symptoms s ON s.id = ds.symptom_id").
		Where("s.name IN ?", symptomNames).
		Preload("Hospitals").Preload("Symptoms").
		Group("doctors.id").
		Order("doctors.rating DESC").
		Find(&docs).Error
	return docs, err
}

func (r *DoctorRepo) GetAppointments(doctorID uuid.UUID) ([]models.Appointment, error) {
	var appts []models.Appointment
	err := r.db.Where("doctor_id = ?", doctorID).
		Preload("Patient").Preload("Hospital").
		Order("scheduled_at DESC").
		Find(&appts).Error
	return appts, err
}

func (r *DoctorRepo) Update(doc *models.Doctor) error {
	return r.db.Save(doc).Error
}

func (r *DoctorRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Doctor{}, "id = ?", id).Error
}

func (r *DoctorRepo) AssignToHospital(dh *models.DoctorHospital) error {
	return r.db.Create(dh).Error
}

func (r *DoctorRepo) RemoveFromHospital(doctorID, hospitalID uuid.UUID) error {
	return r.db.Delete(&models.DoctorHospital{}, "doctor_id = ? AND hospital_id = ?", doctorID, hospitalID).Error
}
