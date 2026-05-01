package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mid/backend/internal/services"
)

func Auth(authSvc *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		claims, err := authSvc.ValidateToken(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("user_id", claims.UserID)
		c.Set("mid", claims.MID)
		c.Set("user_type", string(claims.UserType))
		c.Next()
	}
}

func RequireRole(roles ...services.UserType) gin.HandlerFunc {
	return func(c *gin.Context) {
		userType := services.UserType(c.GetString("user_type"))
		for _, role := range roles {
			if userType == role {
				c.Next()
				return
			}
		}
		allowed := make([]string, len(roles))
		for i, r := range roles {
			allowed[i] = string(r)
		}
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error":    "forbidden: this action requires role " + allowed[0],
			"your_role": string(userType),
		})
	}
}
