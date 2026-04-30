package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"gorm.io/gorm"
)

type MedicineHandler struct {
	db *gorm.DB
}

func NewMedicineHandler(db *gorm.DB) *MedicineHandler {
	return &MedicineHandler{db: db}
}

func (h *MedicineHandler) Create(c *gin.Context) {
	var med models.Medicine
	if err := c.ShouldBindJSON(&med); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.db.Create(&med).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, med)
}

func (h *MedicineHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	search := c.Query("search")

	var meds []models.Medicine
	var total int64
	q := h.db.Model(&models.Medicine{})
	if search != "" {
		q = q.Where("name ILIKE ? OR generic_name ILIKE ? OR category ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	q.Count(&total)
	q.Offset((page - 1) * limit).Limit(limit).Find(&meds)
	c.JSON(http.StatusOK, gin.H{"data": meds, "total": total})
}

func (h *MedicineHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var med models.Medicine
	if err := h.db.First(&med, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "medicine not found"})
		return
	}
	c.JSON(http.StatusOK, med)
}

func (h *MedicineHandler) GetPrescriptions(c *gin.Context) {
	patientID := c.MustGet("patient_id").(uuid.UUID)
	var prescriptions []models.Prescription
	h.db.Where("patient_id = ?", patientID).
		Preload("Medicine").
		Order("created_at DESC").
		Find(&prescriptions)
	c.JSON(http.StatusOK, gin.H{"data": prescriptions})
}
