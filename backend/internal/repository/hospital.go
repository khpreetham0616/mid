package repository

import (
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"gorm.io/gorm"
)

type HospitalRepo struct {
	db *gorm.DB
}

func NewHospitalRepo(db *gorm.DB) *HospitalRepo {
	return &HospitalRepo{db: db}
}

func (r *HospitalRepo) Create(h *models.Hospital) error {
	return r.db.Create(h).Error
}

func (r *HospitalRepo) GetByID(id uuid.UUID) (*models.Hospital, error) {
	var h models.Hospital
	err := r.db.Preload("Doctors").Preload("Doctors.Symptoms").First(&h, "id = ?", id).Error
	return &h, err
}

func (r *HospitalRepo) GetByMID(mid string) (*models.Hospital, error) {
	var h models.Hospital
	err := r.db.Preload("Doctors").First(&h, "mid = ?", mid).Error
	return &h, err
}

func (r *HospitalRepo) GetByEmail(email string) (*models.Hospital, error) {
	var h models.Hospital
	err := r.db.First(&h, "email = ?", email).Error
	return &h, err
}

func (r *HospitalRepo) List(page, limit int, city string) ([]models.Hospital, int64, error) {
	var hospitals []models.Hospital
	var total int64
	q := r.db.Model(&models.Hospital{}).Where("is_active = ?", true)
	if city != "" {
		q = q.Where("city ILIKE ?", "%"+city+"%")
	}
	q.Count(&total)
	err := q.Preload("Doctors").
		Offset((page - 1) * limit).Limit(limit).
		Order("rating DESC").Find(&hospitals).Error
	return hospitals, total, err
}

func (r *HospitalRepo) SearchBySymptoms(symptomNames []string) ([]models.Hospital, error) {
	var hospitals []models.Hospital
	err := r.db.
		Joins("JOIN doctor_hospitals dh ON dh.hospital_id = hospitals.id").
		Joins("JOIN doctors d ON d.id = dh.doctor_id").
		Joins("JOIN doctor_symptoms ds ON ds.doctor_id = d.id").
		Joins("JOIN symptoms s ON s.id = ds.symptom_id").
		Where("s.name IN ?", symptomNames).
		Where("hospitals.is_active = ?", true).
		Preload("Doctors").
		Group("hospitals.id").
		Order("hospitals.rating DESC").
		Find(&hospitals).Error
	return hospitals, err
}

func (r *HospitalRepo) GetDoctors(hospitalID uuid.UUID) ([]models.Doctor, error) {
	var hospital models.Hospital
	err := r.db.Preload("Doctors").Preload("Doctors.Symptoms").First(&hospital, "id = ?", hospitalID).Error
	return hospital.Doctors, err
}

func (r *HospitalRepo) Update(h *models.Hospital) error {
	return r.db.Save(h).Error
}

func (r *HospitalRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Hospital{}, "id = ?", id).Error
}
