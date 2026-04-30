package database

import (
	"log"

	"github.com/mid/backend/internal/config"
	"github.com/mid/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitPostgres(cfg *config.Config) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(cfg.PostgresDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)

	if err := autoMigrate(db); err != nil {
		return nil, err
	}

	DB = db
	log.Println("PostgreSQL connected and migrated")
	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Doctor{},
		&models.Hospital{},
		&models.Patient{},
		&models.Appointment{},
		&models.Medicine{},
		&models.MedicalRecord{},
		&models.DoctorHospital{},
		&models.Symptom{},
		&models.DoctorSymptom{},
		&models.Prescription{},
	)
}
