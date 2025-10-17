import { Component, Input } from '@angular/core';
import { Product } from '../../../shared/models/product';
import { MatCard, MatCardContent, MatCardActions } from "@angular/material/card"
import { CurrencyPipe } from '@angular/common';
import { MatIcon } from "@angular/material/icon";
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-product-item',
    imports: [
        MatCard,
        MatCardContent,
        CurrencyPipe,
        MatCardActions,
        MatIcon,
        MatButton,
        RouterLink,
    ],
    templateUrl: './product-item.component.html',
    styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
    @Input() product?: Product;
}
