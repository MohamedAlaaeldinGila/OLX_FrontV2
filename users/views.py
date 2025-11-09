from django.shortcuts import render

# Create your views here.

def user_login(request):
    """
    Render login page - authentication happens via JavaScript API calls
    """
    return render(request, 'users/login.html')

def home(request):
    return render(request, 'home.html')

def signup(request):
    return render(request, 'users/signup.html')

def ForgotPasswordAPIView(request):
    """
    Handle forgot password requests
    """
    return render(request, 'users/forgot_password.html')

def ResetPasswordAPIView(request):
    """
    Handle reset password requests
    """
    return render(request, 'users/reset_password.html')

def VerifyOTPView(request):
    """
    Handle OTP verification requests
    """
    return render(request, 'users/verify_otp.html')

def VerifyResetOTPView(request):
    """
    Handle OTP verification for password reset requests
    """
    return render(request, 'users/verify_reset_otp.html')