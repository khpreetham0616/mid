package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/repository"
	"github.com/mid/backend/internal/services"
)

type DoctorHandler struct {
	repo *repository.DoctorRepo
}

func NewDoctorHandler(repo *repository.DoctorRepo) *DoctorHandler {
	return &DoctorHandler{repo: repo}
}

func (h *DoctorHandler) Create(c *gin.Context) {
	var doc models.Doctor
	if err := c.ShouldBindJSON(&doc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	doc.MID = services.GenerateMID(services.EntityDoctor)
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
