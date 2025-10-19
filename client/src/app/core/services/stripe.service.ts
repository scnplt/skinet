import { StripeAddressElementOptions } from './../../../../node_modules/@stripe/stripe-js/dist/stripe-js/elements/address.d';
import { CartService } from './cart.service';
import { inject, Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeAddressElement, StripeElements } from '@stripe/stripe-js'
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../../shared/models/cart';
import { firstValueFrom, map } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private baseUrl = environment.apiUrl;
    private cartService = inject(CartService);
    private accountService = inject(AccountService);
    private http = inject(HttpClient);
    private stripePromise: Promise<Stripe | null>;
    private elements?: StripeElements;
    private addressElement?: StripeAddressElement

    constructor() {
        this.stripePromise = loadStripe(environment.stripePublicKey);
    }

    getStripeInstance() {
        return this.stripePromise;
    }

    async initializeElements() {
        if (!this.elements) {
            const stripe = await this.getStripeInstance();
            if (!stripe) throw new Error('Stripe has not been loaded');

            const cart = await firstValueFrom(this.createOrUpdatePaymentIntent())
            this.elements = stripe.elements({
                clientSecret: cart.clientSecret,
                appearance: { labels: 'floating' }
            })
        }
        return this.elements;
    }

    async createAddressElement() {
        if (!this.addressElement) {
            const elements = await this.initializeElements();
            if (!elements) throw new Error('Elements instance has not been loaded')

            const user = this.accountService.currentUser();
            let defaultValues: StripeAddressElementOptions['defaultValues'] = {};

            if (user) defaultValues.name = user.firstName + ' ' + user.lastName;
            if (user?.address) defaultValues.address = {
                line1: user.address.line1,
                line2: user.address.line2,
                city: user.address.city,
                state: user.address.state,
                country: user.address.country,
                postal_code: user.address.postalCode
            }

            const options: StripeAddressElementOptions = { mode: 'shipping', defaultValues };
            this.addressElement = elements.create('address', options);
        }
        return this.addressElement;
    }

    createOrUpdatePaymentIntent() {
        const cart = this.cartService.cart();
        if (!cart) throw new Error('Problem with cart');
        return this.http.post<Cart>(this.baseUrl + 'payments/' + cart.id, {}).pipe(
            map(cart => {
                this.cartService.setCart(cart);
                return cart;
            })
        )
    }

    disposeElements() {
        this.elements = undefined;
        this.addressElement = undefined;
    }
}
