package routes

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mid/backend/internal/handlers"
	"github.com/mid/backend/internal/middleware"
	"github.com/mid/backend/internal/services"
)

func Setup(
	authH *handlers.AuthHandler,
	doctorH *handlers.DoctorHandler,
	hospitalH *handlers.HospitalHandler,
	patientH *handlers.PatientHandler,
	appointmentH *handlers.AppointmentHandler,
	suggestionH *handlers.SuggestionHandler,
	medicineH *handlers.MedicineHandler,
	adminH *handlers.AdminHandler,
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

	// --- Auth (public) ---
	api.POST("/auth/register", authH.Register)
	api.POST("/auth/login", authH.Login)

	// --- Public read routes ---
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

	// --- Authenticated routes ---
	auth := api.Group("/")
	auth.Use(middleware.Auth(authSvc))

	// Patient routes
	patient := auth.Group("/patient")
	patient.Use(middleware.RequireRole(services.UserTypePatient))
	patient.GET("/profile", patientH.GetProfile)
	patient.PUT("/profile", patientH.UpdateProfile)
	patient.GET("/medical-history", patientH.GetMedicalHistory)
	patient.GET("/appointments", patientH.GetAppointments)
	patient.GET("/prescriptions", patientH.GetPrescriptions)
	patient.POST("/appointments", appointmentH.Book)
	patient.PATCH("/appointments/:id/status", appointmentH.UpdateStatus)

	// Doctor routes
	doctor := auth.Group("/doctor")
	doctor.Use(middleware.RequireRole(services.UserTypeDoctor))
	doctor.GET("/profile", doctorH.GetMyProfile)
	doctor.PUT("/profile", doctorH.UpdateMyProfile)
	doctor.GET("/appointments", doctorH.GetMyAppointments)
	doctor.PATCH("/appointments/:id/status", appointmentH.UpdateStatus)
	doctor.GET("/patient/:pmid", doctorH.LookupPatient)
	doctor.POST("/records", doctorH.AddMedicalRecord)
	doctor.POST("/prescriptions", doctorH.WritePrescription)
	doctor.GET("/prescriptions", doctorH.GetMyPrescriptions)

	// Hospital routes
	hospital := auth.Group("/hospital")
	hospital.Use(middleware.RequireRole(services.UserTypeHospital))
	hospital.GET("/profile", hospitalH.GetMyProfile)
	hospital.PUT("/profile", hospitalH.UpdateMyProfile)
	hospital.GET("/doctors", hospitalH.GetMyDoctors)
	hospital.POST("/doctors", hospitalH.AddDoctor)
	hospital.DELETE("/doctors/:doctor_id", hospitalH.RemoveDoctor)

	// Admin routes
	admin := auth.Group("/admin")
	admin.Use(middleware.RequireRole(services.UserTypeAdmin))
	admin.GET("/users", adminH.GetAllUsers)
	admin.GET("/stats", adminH.GetStats)
	admin.POST("/doctors", doctorH.Create)
	admin.PUT("/doctors/:id", doctorH.Update)
	admin.DELETE("/doctors/:id", doctorH.Delete)
	admin.POST("/hospitals", hospitalH.Create)
	admin.PUT("/hospitals/:id", hospitalH.Update)
	admin.DELETE("/hospitals/:id", hospitalH.Delete)
	admin.POST("/medicines", medicineH.Create)

	return r
}
