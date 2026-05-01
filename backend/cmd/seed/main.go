package main

import (
	"fmt"
	"log"

	"github.com/mid/backend/internal/config"
	"github.com/mid/backend/internal/database"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/services"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func main() {
	cfg, _ := config.Load()
	db, err := database.InitPostgres(cfg)
	if err != nil {
		log.Fatal(err)
	}

	seedSymptoms(db)
	seedHospitals(db)
	seedDoctors(db)
	fmt.Println("Seed complete!")
}

func seedSymptoms(db *gorm.DB) {
	symptoms := []models.Symptom{
		{Name: "Chest Pain", Category: "Cardiology", Description: "Pain or pressure in the chest area"},
		{Name: "Shortness of Breath", Category: "Pulmonology", Description: "Difficulty breathing"},
		{Name: "Headache", Category: "Neurology", Description: "Pain in the head"},
		{Name: "Fever", Category: "General", Description: "Elevated body temperature"},
		{Name: "Back Pain", Category: "Orthopedic", Description: "Pain in the back region"},
		{Name: "Skin Rash", Category: "Dermatology", Description: "Skin inflammation or redness"},
		{Name: "Joint Pain", Category: "Orthopedic", Description: "Pain in joints"},
		{Name: "Stomach Ache", Category: "Gastroenterology", Description: "Abdominal pain"},
		{Name: "Cough", Category: "Pulmonology", Description: "Persistent coughing"},
		{Name: "Dizziness", Category: "Neurology", Description: "Feeling of unsteadiness"},
		{Name: "Eye Pain", Category: "Ophthalmology", Description: "Discomfort in the eye"},
		{Name: "Ear Pain", Category: "ENT", Description: "Pain in the ear"},
		{Name: "Depression", Category: "Psychiatry", Description: "Persistent sadness or low mood"},
		{Name: "Child Fever", Category: "Pediatrics", Description: "Fever in children"},
	}
	for _, s := range symptoms {
		db.Where("name = ?", s.Name).FirstOrCreate(&s)
	}
	fmt.Printf("Seeded %d symptoms\n", len(symptoms))
}

func seedHospitals(db *gorm.DB) {
	hospitals := []models.Hospital{
		{
			MID: services.GenerateMID(services.EntityHospital), Name: "Apollo Hospitals",
			Email: "apollo@example.com", Phone: "+91-9876543210",
			Address: "21, Greams Lane, Off Greams Road", City: "Chennai",
			State: "Tamil Nadu", Country: "India", Pincode: "600006",
			Type: "Multi-Specialty", Beds: 500,
			Departments: `["Cardiology","Neurology","Orthopedics","Oncology","Pediatrics"]`,
			Facilities:  `["ICU","NICU","Blood Bank","Pharmacy","Lab","24x7 Emergency"]`,
			Rating: 4.7, IsActive: true,
		},
		{
			MID: services.GenerateMID(services.EntityHospital), Name: "Fortis Healthcare",
			Email: "fortis@example.com", Phone: "+91-9876543211",
			Address: "Mulund Goregaon Link Road", City: "Mumbai",
			State: "Maharashtra", Country: "India", Pincode: "400078",
			Type: "Multi-Specialty", Beds: 400,
			Departments: `["Cardiology","Dermatology","ENT","Gynecology","Psychiatry"]`,
			Facilities:  `["ICU","Pharmacy","Lab","Radiology","24x7 Emergency"]`,
			Rating: 4.5, IsActive: true,
		},
		{
			MID: services.GenerateMID(services.EntityHospital), Name: "AIIMS Delhi",
			Email: "aiims@example.com", Phone: "+91-9876543212",
			Address: "Sri Aurobindo Marg, Ansari Nagar", City: "Delhi",
			State: "Delhi", Country: "India", Pincode: "110029",
			Type: "Government", Beds: 2000,
			Departments: `["Cardiology","Neurology","Oncology","Orthopedics","Pediatrics","Psychiatry"]`,
			Facilities:  `["ICU","NICU","Blood Bank","Pharmacy","Lab","Research Center"]`,
			Rating: 4.9, IsActive: true,
		},
	}
	for _, h := range hospitals {
		db.Where("name = ?", h.Name).FirstOrCreate(&h)
	}
	fmt.Printf("Seeded %d hospitals\n", len(hospitals))
}

func seedDoctors(db *gorm.DB) {
	hashed, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	doctors := []models.Doctor{
		{
			MID: services.GenerateMID(services.EntityDoctor), FirstName: "Rajesh", LastName: "Kumar",
			Email: "dr.rajesh@example.com", PasswordHash: string(hashed), Phone: "+91-9000000001",
			Specialization: "Cardiologist", Qualification: "MBBS, MD, DM (Cardiology)",
			ExperienceYrs: 15, ConsultFee: 800, Rating: 4.8, IsAvailable: true,
			Bio: "Senior cardiologist with 15 years of experience in interventional cardiology.",
		},
		{
			MID: services.GenerateMID(services.EntityDoctor), FirstName: "Priya", LastName: "Sharma",
			Email: "dr.priya@example.com", PasswordHash: string(hashed), Phone: "+91-9000000002",
			Specialization: "Neurologist", Qualification: "MBBS, MD, DM (Neurology)",
			ExperienceYrs: 12, ConsultFee: 900, Rating: 4.7, IsAvailable: true,
			Bio: "Expert neurologist specializing in epilepsy and stroke management.",
		},
		{
			MID: services.GenerateMID(services.EntityDoctor), FirstName: "Anil", LastName: "Verma",
			Email: "dr.anil@example.com", PasswordHash: string(hashed), Phone: "+91-9000000003",
			Specialization: "Orthopedic", Qualification: "MBBS, MS (Ortho)",
			ExperienceYrs: 18, ConsultFee: 700, Rating: 4.6, IsAvailable: true,
			Bio: "Orthopedic surgeon specializing in joint replacement and sports injuries.",
		},
		{
			MID: services.GenerateMID(services.EntityDoctor), FirstName: "Sunita", LastName: "Patel",
			Email: "dr.sunita@example.com", PasswordHash: string(hashed), Phone: "+91-9000000004",
			Specialization: "Dermatologist", Qualification: "MBBS, MD (Dermatology)",
			ExperienceYrs: 10, ConsultFee: 600, Rating: 4.5, IsAvailable: true,
			Bio: "Dermatologist with expertise in skin allergies and cosmetic dermatology.",
		},
		{
			MID: services.GenerateMID(services.EntityDoctor), FirstName: "Mohammed", LastName: "Ali",
			Email: "dr.mohammed@example.com", PasswordHash: string(hashed), Phone: "+91-9000000005",
			Specialization: "Pediatrician", Qualification: "MBBS, MD (Pediatrics)",
			ExperienceYrs: 8, ConsultFee: 500, Rating: 4.9, IsAvailable: true,
			Bio: "Child health specialist committed to providing compassionate pediatric care.",
		},
	}

	var symptoms []models.Symptom
	db.Find(&symptoms)
	symMap := map[string]models.Symptom{}
	for _, s := range symptoms {
		symMap[s.Name] = s
	}

	doctorSymptoms := map[string][]string{
		"Cardiologist":  {"Chest Pain", "Shortness of Breath", "Dizziness"},
		"Neurologist":   {"Headache", "Dizziness", "Back Pain"},
		"Orthopedic":    {"Back Pain", "Joint Pain"},
		"Dermatologist": {"Skin Rash"},
		"Pediatrician":  {"Fever", "Cough", "Child Fever"},
	}

	for i := range doctors {
		doc := doctors[i]
		if err := db.Where("email = ?", doc.Email).FirstOrCreate(&doc).Error; err == nil {
			if syms, ok := doctorSymptoms[doc.Specialization]; ok {
				for _, sn := range syms {
					if s, found := symMap[sn]; found {
						db.Model(&doc).Association("Symptoms").Append(&s)
					}
				}
			}
		}
	}
	fmt.Printf("Seeded %d doctors\n", len(doctors))
}
