package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mid/backend/internal/models"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	userType := c.Query("type") // patient, doctor, hospital, or empty for all

	result := gin.H{}

	if userType == "" || userType == "patient" {
		var patients []models.Patient
		h.db.Order("created_at DESC").Find(&patients)
		result["patients"] = patients
	}
	if userType == "" || userType == "doctor" {
		var doctors []models.Doctor
		h.db.Order("created_at DESC").Find(&doctors)
		result["doctors"] = doctors
	}
	if userType == "" || userType == "hospital" {
		var hospitals []models.Hospital
		h.db.Order("created_at DESC").Find(&hospitals)
		result["hospitals"] = hospitals
	}

	c.JSON(http.StatusOK, result)
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	var patientCount, doctorCount, hospitalCount, appointmentCount, medicineCount int64
	h.db.Model(&models.Patient{}).Count(&patientCount)
	h.db.Model(&models.Doctor{}).Count(&doctorCount)
	h.db.Model(&models.Hospital{}).Count(&hospitalCount)
	h.db.Model(&models.Appointment{}).Count(&appointmentCount)
	h.db.Model(&models.Medicine{}).Count(&medicineCount)

	c.JSON(http.StatusOK, gin.H{
		"patients":     patientCount,
		"doctors":      doctorCount,
		"hospitals":    hospitalCount,
		"appointments": appointmentCount,
		"medicines":    medicineCount,
	})
}
