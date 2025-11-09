from django.shortcuts import render

# Create your views here.
def product_detail(request, product_id):
    # Logic to retrieve product details based on product_id
    context = {
        'product_id': product_id,
        # Add other product details to context as needed
    }
    return render(request, 'products/productDetails.html', context)

def cart_view(request):
    # Logic to retrieve cart details
    context = {
        # Add cart details to context as needed
    }
    return render(request, 'products/cart.html', context)


def add_product(request):
    
    return render(request, 'products/addproduct.html')

def all_products(request):
    return render(request, 'products/allproducts.html')