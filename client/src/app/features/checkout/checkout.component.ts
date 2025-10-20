import { StripeService } from './../../core/services/stripe.service';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatStepper, MatStepperModule } from '@angular/material/stepper'
import { OrderSummaryComponent } from "../../shared/components/order-summary/order-summary.component";
import { Router, RouterLink } from "@angular/router";
import { MatButton } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCheckboxChange, MatCheckboxModule } from "@angular/material/checkbox";
import { ConfirmationToken, StripeAddressElement, StripeAddressElementChangeEvent, StripePaymentElement, StripePaymentElementChangeEvent } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Address } from '../../shared/models/user';
import { firstValueFrom } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { CheckoutDeliveryComponent } from "./checkout-delivery/checkout-delivery.component";
import { CheckoutReviewComponent } from "./checkout-review/checkout-review.component";
import { CartService } from '../../core/services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { OrderToCreate, ShippingAddress } from '../../shared/models/order';
import { OrderService } from '../../core/services/order.service';

@Component({
    selector: 'app-checkout',
    imports: [
        OrderSummaryComponent,
        MatStepperModule,
        RouterLink,
        MatButton,
        MatCheckboxModule,
        CheckoutDeliveryComponent,
        CheckoutReviewComponent,
        CurrencyPipe,
        MatProgressSpinnerModule
    ],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit, OnDestroy {
    private stripeService = inject(StripeService);
    private accountService = inject(AccountService);
    private orderService = inject(OrderService);
    private router = inject(Router);
    protected cartService = inject(CartService);
    private snackbar = inject(SnackbarService);
    protected addressElement?: StripeAddressElement;
    protected paymentElement?: StripePaymentElement;
    protected saveAddress = false;
    protected completionStatus = signal<{ address: boolean, card: boolean, delivery: boolean }>(
        { address: false, card: false, delivery: false }
    )
    protected confirmationToken?: ConfirmationToken;
    protected loading = false;

    async ngOnInit() {
        try {
            this.addressElement = await this.stripeService.createAddressElement();
            this.addressElement.mount('#address-element');
            this.addressElement.on('change', this.handleAddressChange);

            this.paymentElement = await this.stripeService.createPaymentElement();
            this.paymentElement.mount('#payment-element');
            this.paymentElement.on('change', this.handlePaymentChange);
        } catch (error: any) {
            this.snackbar.error(error.message)
        }
    }

    handleAddressChange = (event: StripeAddressElementChangeEvent) => {
        this.completionStatus.update(state => {
            state.address = event.complete;
            return state;
        })
    }

    handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
        this.completionStatus.update(state => {
            state.card = event.complete;
            return state;
        })
    }

    handleDeliveryChange(event: boolean) {
        this.completionStatus.update(state => {
            state.delivery = event;
            return state;
        })
    }

    async onStepChange(event: StepperSelectionEvent) {
        if (event.selectedIndex === 1) {
            if (this.saveAddress) {
                const address = await this.getAddressFromStripeAddress() as Address;
                address && firstValueFrom(this.accountService.updateAddress(address));
            }
        }
        if (event.selectedIndex === 2) {
            await firstValueFrom(this.stripeService.createOrUpdatePaymentIntent());
        }
        if (event.selectedIndex === 3) {
            await this.getConfirmationToken();
        }
    }

    async getConfirmationToken() {
        try {
            if (Object.values(this.completionStatus()).every(status => status === true)) {
                const result = await this.stripeService.createConfirmationToken();
                if (result.error) throw new Error(result.error.message);
                this.confirmationToken = result.confirmationToken;
                console.log(this.confirmationToken)
            }
        } catch (error: any) {
            this.snackbar.error(error.message)
        }
    }

    async confirmPayment(stepper: MatStepper) {
        this.loading = true;
        try {
            if (this.confirmationToken) {
                console.log("1")
                const result = await this.stripeService.confirmPayment(this.confirmationToken);

                if (result.paymentIntent?.status === 'succeeded') {
                    console.log("2")
                    const order = await this.createOrderModel();
                    const orderResult = await firstValueFrom(this.orderService.createOrder(order))
                    console.log("3")
                    if (orderResult) {
                        console.log("4")
                        this.cartService.deleteCart();
                        this.cartService.selectedDelivery.set(null);
                        this.router.navigateByUrl('/checkout/success');
                    } else {
                        console.log("5")
                        throw new Error('Order creation failed');
                    }
                } else if (result.error) {
                    console.log("6")
                    throw new Error(result.error.message);
                } else {
                    console.log("7")
                    throw new Error('Something went wrong');
                }
            }
        } catch (error: any) {
            this.snackbar.error(error.message || 'Something went wrong')
            stepper.previous();
        } finally {
            this.loading = false;
        }
    }

    private async createOrderModel(): Promise<OrderToCreate> {
        const cart = this.cartService.cart();
        const shippingAddress = await this.getAddressFromStripeAddress() as ShippingAddress;
        const card = this.confirmationToken?.payment_method_preview.card;

        if (!cart?.id || !cart?.deliveryMethodId || !card || !shippingAddress) throw new Error('Problem creating order');

        return {
            cartId: cart.id,
            paymentSummary: {
                last4: +card.last4,
                brand: card.brand,
                expMonth: card.exp_month,
                expYear: card.exp_year
            },
            deliveryMethodId: cart.deliveryMethodId,
            shippingAddress
        }
    }

    private async getAddressFromStripeAddress(): Promise<Address | ShippingAddress | null> {
        const result = await this.addressElement?.getValue();
        const address = result?.value.address;

        if (!address) return null;

        return {
            name: result.value.name,
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            country: address.country,
            state: address.state,
            postalCode: address.postal_code
        }
    }

    onSaveAddressCheckboxChange(event: MatCheckboxChange) {
        this.saveAddress = event.checked;
    }

    ngOnDestroy() {
        this.stripeService.disposeElements();
    }
}
