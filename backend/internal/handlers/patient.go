package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/repository"
)

type PatientHandler struct {
	repo *repository.PatientRepo
}

func NewPatientHandler(repo *repository.PatientRepo) *PatientHandler {
	return &PatientHandler{repo: repo}
}

func (h *PatientHandler) GetProfile(c *gin.Context) {
	patientID := c.MustGet("user_id").(uuid.UUID)
	p, err := h.repo.GetByID(patientID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PatientHandler) UpdateProfile(c *gin.Context) {
	patientID := c.MustGet("user_id").(uuid.UUID)
	p, err := h.repo.GetByID(patientID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}
	if err := c.ShouldBindJSON(p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.ID = patientID
	if err := h.repo.Update(p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PatientHandler) GetMedicalHistory(c *gin.Context) {
	patientID := c.MustGet("user_id").(uuid.UUID)
	records, err := h.repo.GetMedicalHistory(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": records})
}

func (h *PatientHandler) GetAppointments(c *gin.Context) {
	patientID := c.MustGet("user_id").(uuid.UUID)
	appts, err := h.repo.GetAppointments(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": appts})
}

func (h *PatientHandler) GetPrescriptions(c *gin.Context) {
	patientID := c.MustGet("user_id").(uuid.UUID)
	_ = patientID
	// Prescriptions retrieval by patient
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}
