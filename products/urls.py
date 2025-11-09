from django.urls import path
from . import views

urlpatterns = [
    path('<int:product_id>/', views.product_detail, name='product_detail'),
    path('cart/', views.cart_view, name='cart'),
    path('add/', views.add_product, name='add_product'),
    path('all-products/', views.all_products, name='all_products'),
]