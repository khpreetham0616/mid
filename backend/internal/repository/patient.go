package repository

import (
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"gorm.io/gorm"
)

type PatientRepo struct {
	db *gorm.DB
}

func NewPatientRepo(db *gorm.DB) *PatientRepo {
	return &PatientRepo{db: db}
}

func (r *PatientRepo) Create(p *models.Patient) error {
	return r.db.Create(p).Error
}

func (r *PatientRepo) GetByID(id uuid.UUID) (*models.Patient, error) {
	var p models.Patient
	err := r.db.First(&p, "id = ?", id).Error
	return &p, err
}

func (r *PatientRepo) GetByMID(mid string) (*models.Patient, error) {
	var p models.Patient
	err := r.db.First(&p, "mid = ?", mid).Error
	return &p, err
}

func (r *PatientRepo) GetByEmail(email string) (*models.Patient, error) {
	var p models.Patient
	err := r.db.First(&p, "email = ?", email).Error
	return &p, err
}

func (r *PatientRepo) Update(p *models.Patient) error {
	return r.db.Save(p).Error
}

func (r *PatientRepo) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Patient{}, "id = ?", id).Error
}

func (r *PatientRepo) GetMedicalHistory(patientID uuid.UUID) ([]models.MedicalRecord, error) {
	var records []models.MedicalRecord
	err := r.db.Where("patient_id = ?", patientID).
		Preload("Doctor").
		Order("created_at DESC").
		Find(&records).Error
	return records, err
}

func (r *PatientRepo) GetAppointments(patientID uuid.UUID) ([]models.Appointment, error) {
	var appts []models.Appointment
	err := r.db.Where("patient_id = ?", patientID).
		Preload("Doctor").
		Preload("Hospital").
		Order("scheduled_at DESC").
		Find(&appts).Error
	return appts, err
}
