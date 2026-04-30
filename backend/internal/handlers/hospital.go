package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
)

type HospitalHandler struct {
	repo       *repository.HospitalRepo
	doctorRepo *repository.DoctorRepo
}

func NewHospitalHandler(repo *repository.HospitalRepo, doctorRepo *repository.DoctorRepo) *HospitalHandler {
	return &HospitalHandler{repo: repo, doctorRepo: doctorRepo}
}

func (h *HospitalHandler) Create(c *gin.Context) {
	var hospital models.Hospital
	if err := c.ShouldBindJSON(&hospital); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Create(&hospital); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, hospital)
}

func (h *HospitalHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	city := c.Query("city")
	hospitals, total, err := h.repo.List(page, limit, city)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": hospitals, "total": total, "page": page, "limit": limit})
}

func (h *HospitalHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	hospital, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hospital not found"})
		return
	}
	c.JSON(http.StatusOK, hospital)
}

func (h *HospitalHandler) GetByMID(c *gin.Context) {
	hospital, err := h.repo.GetByMID(c.Param("mid"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hospital not found"})
		return
	}
	c.JSON(http.StatusOK, hospital)
}

func (h *HospitalHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	hospital, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hospital not found"})
		return
	}
	if err := c.ShouldBindJSON(hospital); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hospital.ID = id
	if err := h.repo.Update(hospital); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, hospital)
}

func (h *HospitalHandler) Delete(c *gin.Context) {
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

func (h *HospitalHandler) GetMyProfile(c *gin.Context) {
	hospitalID := c.MustGet("user_id").(uuid.UUID)
	hospital, err := h.repo.GetByID(hospitalID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hospital not found"})
		return
	}
	c.JSON(http.StatusOK, hospital)
}

func (h *HospitalHandler) UpdateMyProfile(c *gin.Context) {
	hospitalID := c.MustGet("user_id").(uuid.UUID)
	hospital, err := h.repo.GetByID(hospitalID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hospital not found"})
		return
	}
	if err := c.ShouldBindJSON(hospital); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	hospital.ID = hospitalID
	if err := h.repo.Update(hospital); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, hospital)
}

func (h *HospitalHandler) GetMyDoctors(c *gin.Context) {
	hospitalID := c.MustGet("user_id").(uuid.UUID)
	doctors, err := h.repo.GetDoctors(hospitalID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": doctors})
}

func (h *HospitalHandler) AddDoctor(c *gin.Context) {
	hospitalID := c.MustGet("user_id").(uuid.UUID)
	var req struct {
		DoctorMID string `json:"doctor_mid" binding:"required"`
		Schedule  string `json:"schedule"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	doc, err := h.doctorRepo.GetByMID(req.DoctorMID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "doctor not found"})
		return
	}
	dh := &models.DoctorHospital{
		DoctorID:     doc.ID,
		HospitalID:   hospitalID,
		Schedule:     req.Schedule,
		IsAffiliated: true,
	}
	if err := h.doctorRepo.AssignToHospital(dh); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "doctor added to hospital", "doctor": doc})
}

func (h *HospitalHandler) RemoveDoctor(c *gin.Context) {
	hospitalID := c.MustGet("user_id").(uuid.UUID)
	doctorID, err := uuid.Parse(c.Param("doctor_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid doctor id"})
		return
	}
	if err := h.doctorRepo.RemoveFromHospital(doctorID, hospitalID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "doctor removed from hospital"})
}
