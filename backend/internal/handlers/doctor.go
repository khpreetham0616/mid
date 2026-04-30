package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
	"gorm.io/gorm"
)

type DoctorHandler struct {
	repo        *repository.DoctorRepo
	patientRepo *repository.PatientRepo
	db          *gorm.DB
}

func NewDoctorHandler(repo *repository.DoctorRepo, patientRepo *repository.PatientRepo, db *gorm.DB) *DoctorHandler {
	return &DoctorHandler{repo: repo, patientRepo: patientRepo, db: db}
}

func (h *DoctorHandler) Create(c *gin.Context) {
	var doc models.Doctor
	if err := c.ShouldBindJSON(&doc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Create(&doc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, doc)
}

func (h *DoctorHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	spec := c.Query("specialization")
	city := c.Query("city")

	if city != "" {
		docs, total, err := h.repo.ListByCity(page, limit, city, spec)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": docs, "total": total, "page": page, "limit": limit})
		return
	}

	docs, total, err := h.repo.List(page, limit, spec)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": docs, "total": total, "page": page, "limit": limit})
}

func (h *DoctorHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	doc, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		return
	}
	c.JSON(http.StatusOK, doc)
}

func (h *DoctorHandler) GetByMID(c *gin.Context) {
	doc, err := h.repo.GetByMID(c.Param("mid"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		return
	}
	c.JSON(http.StatusOK, doc)
}

func (h *DoctorHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	doc, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		return
	}
	if err := c.ShouldBindJSON(doc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	doc.ID = id
	if err := h.repo.Update(doc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, doc)
}

func (h *DoctorHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *DoctorHandler) GetMyProfile(c *gin.Context) {
	doctorID := c.MustGet("user_id").(uuid.UUID)
	doc, err := h.repo.GetByID(doctorID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		return
	}
	c.JSON(http.StatusOK, doc)
}

func (h *DoctorHandler) UpdateMyProfile(c *gin.Context) {
	doctorID := c.MustGet("user_id").(uuid.UUID)
	doc, err := h.repo.GetByID(doctorID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		return
	}
	if err := c.ShouldBindJSON(doc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	doc.ID = doctorID
	if err := h.repo.Update(doc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, doc)
}

func (h *DoctorHandler) GetMyAppointments(c *gin.Context) {
	doctorID := c.MustGet("user_id").(uuid.UUID)
	appts, err := h.repo.GetAppointments(doctorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": appts})
}

func (h *DoctorHandler) LookupPatient(c *gin.Context) {
	pmid := c.Param("pmid")
	patient, err := h.patientRepo.GetByMID(pmid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}
	records, _ := h.patientRepo.GetMedicalHistory(patient.ID)
	appts, _ := h.patientRepo.GetAppointments(patient.ID)
	c.JSON(http.StatusOK, gin.H{
		"patient":         patient,
		"medical_records": records,
		"appointments":    appts,
	})
}

func (h *DoctorHandler) AddMedicalRecord(c *gin.Context) {
	doctorID := c.MustGet("user_id").(uuid.UUID)

	var req struct {
		PatientMID     string     `json:"patient_mid" binding:"required"`
		RecordType     string     `json:"record_type"`
		Diagnosis      string     `json:"diagnosis" binding:"required"`
		Symptoms       string     `json:"symptoms"`
		Treatment      string     `json:"treatment"`
		Notes          string     `json:"notes"`
		Vitals         string     `json:"vitals"`
		LabReports     string     `json:"lab_reports"`
		SurgeryType    string     `json:"surgery_type"`
		AnesthesiaType string     `json:"anesthesia_type"`
		SurgeonNotes   string     `json:"surgeon_notes"`
		SurgeryDate    *time.Time `json:"surgery_date"`
		FollowUpDate   *time.Time `json:"follow_up_date"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient, err := h.patientRepo.GetByMID(req.PatientMID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}

	recordType := req.RecordType
	if recordType == "" {
		recordType = "consultation"
	}

	record := &models.MedicalRecord{
		PatientID:      patient.ID,
		DoctorID:       doctorID,
		RecordType:     recordType,
		Diagnosis:      req.Diagnosis,
		Symptoms:       req.Symptoms,
		Treatment:      req.Treatment,
		Notes:          req.Notes,
		Vitals:         req.Vitals,
		LabReports:     req.LabReports,
		SurgeryType:    req.SurgeryType,
		AnesthesiaType: req.AnesthesiaType,
		SurgeonNotes:   req.SurgeonNotes,
		SurgeryDate:    req.SurgeryDate,
		FollowUpDate:   req.FollowUpDate,
	}

	if err := h.db.Create(record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, record)
}

func (h *DoctorHandler) WritePrescription(c *gin.Context) {
	doctorID := c.MustGet("user_id").(uuid.UUID)

	var req struct {
		PatientMID   string     `json:"patient_mid" binding:"required"`
		RecordID     *uuid.UUID `json:"record_id"`
		MedicineName string     `json:"medicine_name" binding:"required"`
		Dosage       string     `json:"dosage"`
		Frequency    string     `json:"frequency"`
		Duration     string     `json:"duration"`
		Instructions string     `json:"instructions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient, err := h.patientRepo.GetByMID(req.PatientMID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
		return
	}

	rx := &models.Prescription{
		PatientID:    patient.ID,
		DoctorID:     doctorID,
		MedicineName: req.MedicineName,
		Dosage:       req.Dosage,
		Frequency:    req.Frequency,
		Duration:     req.Duration,
		Instructions: req.Instructions,
	}
	if req.RecordID != nil {
		rx.RecordID = *req.RecordID
	}

	if err := h.db.Create(rx).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, rx)
}

func (h *DoctorHandler) GetMyPrescriptions(c *gin.Context) {
	doctorID := c.MustGet("user_id").(uuid.UUID)
	var rxs []models.Prescription
	h.db.Where("doctor_id = ?", doctorID).Order("created_at DESC").Find(&rxs)
	c.JSON(http.StatusOK, gin.H{"data": rxs})
}
