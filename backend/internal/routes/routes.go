package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mid/backend/internal/handlers"
	"github.com/mid/backend/internal/middleware"
	"github.com/mid/backend/internal/services"
)

func Setup(
	doctorH *handlers.DoctorHandler,
	hospitalH *handlers.HospitalHandler,
	patientH *handlers.PatientHandler,
	appointmentH *handlers.AppointmentHandler,
	suggestionH *handlers.SuggestionHandler,
	medicineH *handlers.MedicineHandler,
	authSvc *services.AuthService,
) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")

	// Public routes
	api.POST("/auth/register", patientH.Register)
	api.POST("/auth/login", patientH.Login)

	api.GET("/doctors", doctorH.List)
	api.GET("/doctors/:id", doctorH.GetByID)
	api.GET("/doctors/mid/:mid", doctorH.GetByMID)

	api.GET("/hospitals", hospitalH.List)
	api.GET("/hospitals/:id", hospitalH.GetByID)
	api.GET("/hospitals/mid/:mid", hospitalH.GetByMID)

	api.GET("/suggestions", suggestionH.Suggest)

	api.GET("/medicines", medicineH.List)
	api.GET("/medicines/:id", medicineH.GetByID)

	api.GET("/appointments/:id", appointmentH.GetByID)
	api.GET("/appointments/doctor/:doctor_id", appointmentH.GetDoctorSlots)

	// Protected routes
	auth := api.Group("/")
	auth.Use(middleware.Auth(authSvc))

	auth.GET("/profile", patientH.GetProfile)
	auth.PUT("/profile", patientH.UpdateProfile)
	auth.GET("/medical-history", patientH.GetMedicalHistory)
	auth.GET("/my-appointments", patientH.GetAppointments)

	auth.POST("/appointments", appointmentH.Book)
	auth.PATCH("/appointments/:id/status", appointmentH.UpdateStatus)

	auth.GET("/prescriptions", medicineH.GetPrescriptions)

	// Admin routes (doctor/hospital management)
	admin := api.Group("/admin")
	admin.POST("/doctors", doctorH.Create)
	admin.PUT("/doctors/:id", doctorH.Update)
	admin.DELETE("/doctors/:id", doctorH.Delete)

	admin.POST("/hospitals", hospitalH.Create)
	admin.PUT("/hospitals/:id", hospitalH.Update)
	admin.DELETE("/hospitals/:id", hospitalH.Delete)

	admin.POST("/medicines", medicineH.Create)

	return r
}
