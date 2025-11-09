from django.http import JsonResponse
from django.shortcuts import render
from django.conf import settings
# Create your views here.

def  api_root(request):
    context = {
        'api_root': settings.API_ROOT
    }
    return JsonResponse(context)
