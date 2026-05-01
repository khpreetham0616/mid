package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
)

type AppointmentHandler struct {
	repo *repository.AppointmentRepo
}

func NewAppointmentHandler(repo *repository.AppointmentRepo) *AppointmentHandler {
	return &AppointmentHandler{repo: repo}
}

func (h *AppointmentHandler) Book(c *gin.Context) {
	patientID := c.MustGet("user_id").(uuid.UUID)

	var req struct {
		DoctorID    uuid.UUID  `json:"doctor_id" binding:"required"`
		HospitalID  *uuid.UUID `json:"hospital_id"`
		ScheduledAt time.Time  `json:"scheduled_at" binding:"required"`
		Duration    int        `json:"duration_minutes"`
		Symptoms    string     `json:"symptoms"`
		Notes       string     `json:"notes"`
		ConsultFee  float64    `json:"consult_fee"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Duration == 0 {
		req.Duration = 30
	}

	// Treat zero UUID the same as absent
	if req.HospitalID != nil && *req.HospitalID == uuid.Nil {
		req.HospitalID = nil
	}

	conflict, err := h.repo.CheckConflict(req.DoctorID, req.ScheduledAt, req.Duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if conflict {
		c.JSON(http.StatusConflict, gin.H{"error": "time slot not available"})
		return
	}

	appt := &models.Appointment{
		PatientID:   patientID,
		DoctorID:    req.DoctorID,
		HospitalID:  req.HospitalID,
		ScheduledAt: req.ScheduledAt,
		Duration:    req.Duration,
		Symptoms:    req.Symptoms,
		Notes:       req.Notes,
		ConsultFee:  req.ConsultFee,
		Status:      models.StatusPending,
	}
	if err := h.repo.Create(appt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, appt)
}

func (h *AppointmentHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	appt, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "appointment not found"})
		return
	}
	c.JSON(http.StatusOK, appt)
}

func (h *AppointmentHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var req struct {
		Status      models.AppointmentStatus `json:"status" binding:"required"`
		DoctorNotes string                   `json:"doctor_notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.UpdateStatus(id, req.Status, req.DoctorNotes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

func (h *AppointmentHandler) GetDoctorSlots(c *gin.Context) {
	doctorID, err := uuid.Parse(c.Param("doctor_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctor_id"})
		return
	}
	dateStr := c.Query("date")
	var date *time.Time
	if dateStr != "" {
		t, err := time.Parse("2006-01-02", dateStr)
		if err == nil {
			date = &t
		}
	}
	appts, err := h.repo.GetByDoctor(doctorID, date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": appts})
}
