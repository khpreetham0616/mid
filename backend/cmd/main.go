package main

import (
	"log"

	"github.com/mid/backend/internal/config"
	"github.com/mid/backend/internal/database"
	"github.com/mid/backend/internal/handlers"
	"github.com/mid/backend/internal/repository"
	"github.com/mid/backend/internal/routes"
	"github.com/mid/backend/internal/services"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	db, err := database.InitPostgres(cfg)
	if err != nil {
		log.Fatalf("postgres error: %v", err)
	}

	rdb, err := database.InitRedis(cfg)
	if err != nil {
		log.Printf("redis warning (continuing without cache): %v", err)
	}

	// Repositories
	doctorRepo := repository.NewDoctorRepo(db)
	hospitalRepo := repository.NewHospitalRepo(db)
	patientRepo := repository.NewPatientRepo(db)
	appointmentRepo := repository.NewAppointmentRepo(db)

	// Services
	authSvc := services.NewAuthService(patientRepo, cfg.JWTSecret)
	suggestionSvc := services.NewSuggestionService(doctorRepo, hospitalRepo, rdb)

	// Handlers
	doctorH := handlers.NewDoctorHandler(doctorRepo)
	hospitalH := handlers.NewHospitalHandler(hospitalRepo)
	patientH := handlers.NewPatientHandler(patientRepo, authSvc)
	appointmentH := handlers.NewAppointmentHandler(appointmentRepo)
	suggestionH := handlers.NewSuggestionHandler(suggestionSvc)
	medicineH := handlers.NewMedicineHandler(db)

	r := routes.Setup(doctorH, hospitalH, patientH, appointmentH, suggestionH, medicineH, authSvc)

	log.Printf("MID Server starting on :%s", cfg.ServerPort)
	if err := r.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
