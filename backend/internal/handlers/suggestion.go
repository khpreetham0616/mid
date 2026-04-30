package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mid/backend/internal/services"
)

type SuggestionHandler struct {
	svc *services.SuggestionService
}

func NewSuggestionHandler(svc *services.SuggestionService) *SuggestionHandler {
	return &SuggestionHandler{svc: svc}
}

func (h *SuggestionHandler) Suggest(c *gin.Context) {
	symptomsParam := c.Query("symptoms")
	if symptomsParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "symptoms param required"})
		return
	}
	symptoms := strings.Split(symptomsParam, ",")
	for i, s := range symptoms {
		symptoms[i] = strings.TrimSpace(s)
	}

	result, err := h.svc.Suggest(symptoms)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}
