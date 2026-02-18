// Gestion du panier avec localStorage
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
        this.renderCart();
    }

    loadCart() {
        const cartData = localStorage.getItem('etoilecanine_cart');
        return cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem('etoilecanine_cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.renderCart();
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => 
            item.id === (product.id || 'collier-led-1') &&
            item.color === (product.color || 'rouge') &&
            item.size === (product.size || 'M')
        );

        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cart.push({
                id: product.id || 'collier-led-1',
                name: product.name || 'Collier LED pour Chiens',
                price: product.price || 29,
                color: product.color || 'rouge',
                image: product.image || 'https://via.placeholder.com/100x100/1a1a2e/FFD700?text=Collier+LED',
                size: product.size || 'M',
                quantity: product.quantity || 1
            });
        }

        this.saveCart();
        this.showNotification('Produit ajouté au panier !');
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
    }

    updateQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(index);
            return;
        }
        this.cart[index].quantity = quantity;
        this.saveCart();
    }

    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateCartCount() {
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
            el.textContent = count;
        });
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            if (cartEmpty) {
                cartEmpty.style.display = 'block';
                cartItemsContainer.innerHTML = '';
                cartItemsContainer.appendChild(cartEmpty);
            }
            if (subtotalEl) subtotalEl.textContent = '0 €';
            if (totalEl) totalEl.textContent = '0 €';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        if (cartEmpty) {
            cartEmpty.style.display = 'none';
        }
        const total = this.getTotal();

        cartItemsContainer.innerHTML = this.cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-color">Couleur : ${item.color} | Taille : ${item.size || 'M'}</div>
                    <div class="cart-item-price">${item.price} €</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cartManager.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1"
                               onchange="cartManager.updateQuantity(${index}, parseInt(this.value))">
                        <button class="quantity-btn" onclick="cartManager.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                        <button class="remove-item" onclick="cartManager.removeFromCart(${index})">Supprimer</button>
                    </div>
                </div>
            </div>
        `).join('');

        if (subtotalEl) subtotalEl.textContent = `${total.toFixed(2)} €`;
        if (totalEl) totalEl.textContent = `${total.toFixed(2)} €`;
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    setupEventListeners() {
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const selectedColor = document.querySelector('.color-option.active')?.dataset.color || 'rouge';
                const selectedSize = document.querySelector('.size-option.active')?.dataset.size || 'M';
                const selectedImage = document.querySelector('.color-option.active')?.dataset.image || 
                    'https://via.placeholder.com/100x100/1a1a2e/FFD700?text=Collier+LED';
                
                this.addToCart({
                    name: `Collier LED (${selectedSize})`, // On ajoute la taille au nom
                    price: 29,
                    color: selectedColor,
                    image: selectedImage,
                    size: selectedSize // On stocke la taille
                });
            });
        }

        // Sélection des tailles
        const sizeOptions = document.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                sizeOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Bouton procéder au paiement
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                // Redirection vers Stripe Checkout
                window.location.href = 'https://buy.stripe.com/test_14A9AM1w13jF5tJ64U4F200';
            });
        }
    }

    showNotification(message) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: var(--color-gold);
            color: var(--color-dark-blue);
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Gestion des images produit
function setupProductImages() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');
    const colorOptions = document.querySelectorAll('.color-option');

    // Changement d'image via thumbnails
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            if (mainImage) {
                mainImage.src = thumbnail.dataset.image;
            }
        });
    });

    // Changement d'image via sélection de couleur
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            if (mainImage && option.dataset.image) {
                mainImage.src = option.dataset.image;
            }
        });
    });
}

// Menu mobile
function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        // Fermer le menu en cliquant sur un lien
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }
}

// Animation CSS pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
    setupProductImages();
    setupMobileMenu();
});
