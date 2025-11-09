from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.user_login, name='login'),
    path('home/', views.home, name='home'),
    path('signup/', views.signup, name='signup'),
    path('verify-otp/', views.VerifyOTPView, name='verify_otp'),
    path('forgot-password/', views.ForgotPasswordAPIView, name='forgot_password'),
    path('reset-password/', views.ResetPasswordAPIView, name='reset_password'),
    path('verify-reset-password-otp/', views.VerifyResetOTPView, name='verify_reset_password_otp'),
]