package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mid/backend/internal/models"
	"github.com/mid/backend/internal/services"
)

type AuthHandler struct {
	authSvc *services.AuthService
}

func NewAuthHandler(authSvc *services.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req struct {
		UserType string `json:"user_type" binding:"required"`
		Password string `json:"password" binding:"required"`

		// Patient fields
		FirstName       string `json:"first_name"`
		LastName        string `json:"last_name"`
		Email           string `json:"email"`
		Phone           string `json:"phone"`
		Gender          string `json:"gender"`
		BloodGroup      string `json:"blood_group"`
		City            string `json:"city"`
		Address         string `json:"address"`
		Allergies       string `json:"allergies"`
		ChronicDiseases string `json:"chronic_diseases"`

		// Doctor-specific
		Specialization string  `json:"specialization"`
		Qualification  string  `json:"qualification"`
		ExperienceYrs  int     `json:"experience_years"`
		Bio            string  `json:"bio"`
		ConsultFee     float64 `json:"consult_fee"`
		State          string  `json:"state"`

		// Hospital-specific
		Name        string `json:"name"`
		HospitalType string `json:"type"`
		Beds        int    `json:"beds"`
		Departments string `json:"departments"`
		Facilities  string `json:"facilities"`
		Pincode     string `json:"pincode"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	switch services.UserType(req.UserType) {
	case services.UserTypePatient:
		p := &models.Patient{
			FirstName:       req.FirstName,
			LastName:        req.LastName,
			Email:           req.Email,
			Phone:           req.Phone,
			Gender:          req.Gender,
			BloodGroup:      req.BloodGroup,
			City:            req.City,
			Address:         req.Address,
			Allergies:       req.Allergies,
			ChronicDiseases: req.ChronicDiseases,
		}
		if err := h.authSvc.RegisterPatient(p, req.Password); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"user_type": "patient", "mid": p.MID, "user": p})

	case services.UserTypeDoctor:
		d := &models.Doctor{
			FirstName:      req.FirstName,
			LastName:       req.LastName,
			Email:          req.Email,
			Phone:          req.Phone,
			Specialization: req.Specialization,
			Qualification:  req.Qualification,
			ExperienceYrs:  req.ExperienceYrs,
			Bio:            req.Bio,
			ConsultFee:     req.ConsultFee,
			City:           req.City,
			State:          req.State,
		}
		if err := h.authSvc.RegisterDoctor(d, req.Password); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"user_type": "doctor", "mid": d.MID, "user": d})

	case services.UserTypeHospital:
		hospitalType := req.HospitalType
		if hospitalType == "" {
			hospitalType = "General"
		}
		h2 := &models.Hospital{
			Name:        req.Name,
			Email:       req.Email,
			Phone:       req.Phone,
			Address:     req.Address,
			City:        req.City,
			State:       req.State,
			Pincode:     req.Pincode,
			Type:        hospitalType,
			Beds:        req.Beds,
			Departments: req.Departments,
			Facilities:  req.Facilities,
		}
		if err := h.authSvc.RegisterHospital(h2, req.Password); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"user_type": "hospital", "mid": h2.MID, "user": h2})

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_type, must be patient, doctor, or hospital"})
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		UserType string `json:"user_type" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	switch services.UserType(req.UserType) {
	case services.UserTypePatient:
		token, patient, err := h.authSvc.LoginPatient(req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": token, "user_type": "patient", "user": patient})

	case services.UserTypeDoctor:
		token, doctor, err := h.authSvc.LoginDoctor(req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": token, "user_type": "doctor", "user": doctor})

	case services.UserTypeHospital:
		token, hospital, err := h.authSvc.LoginHospital(req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"token": token, "user_type": "hospital", "user": hospital})

	case services.UserTypeAdmin:
		token, err := h.authSvc.LoginAdmin(req.Email, req.Password)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"token":     token,
			"user_type": "admin",
			"user":      gin.H{"email": req.Email, "name": "Super Admin", "mid": "ADMIN"},
		})

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_type"})
	}
}
