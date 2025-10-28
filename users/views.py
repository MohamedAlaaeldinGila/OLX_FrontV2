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