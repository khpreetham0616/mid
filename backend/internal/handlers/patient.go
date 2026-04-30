package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
	"github.com/mid/backend/internal/services"
)

type PatientHandler struct {
	repo     *repository.PatientRepo
	authSvc  *services.AuthService
}

func NewPatientHandler(repo *repository.PatientRepo, authSvc *services.AuthService) *PatientHandler {
	return &PatientHandler{repo: repo, authSvc: authSvc}
}

func (h *PatientHandler) Register(c *gin.Context) {
	var req struct {
		models.Patient
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.authSvc.Register(&req.Patient, req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.Patient.PasswordHash = ""
	c.JSON(http.StatusCreated, req.Patient)
}

func (h *PatientHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	token, patient, err := h.authSvc.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token, "patient": patient})
}

func (h *PatientHandler) GetProfile(c *gin.Context) {
	patientID := c.MustGet("patient_id").(uuid.UUID)
	p, err := h.repo.GetByID(patientID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *PatientHandler) UpdateProfile(c *gin.Context) {
	patientID := c.MustGet("patient_id").(uuid.UUID)
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
	patientID := c.MustGet("patient_id").(uuid.UUID)
	records, err := h.repo.GetMedicalHistory(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": records})
}

func (h *PatientHandler) GetAppointments(c *gin.Context) {
	patientID := c.MustGet("patient_id").(uuid.UUID)
	appts, err := h.repo.GetAppointments(patientID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": appts})
}
