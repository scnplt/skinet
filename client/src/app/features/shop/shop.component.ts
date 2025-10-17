import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../shared/models/product';
import { ShopService } from '../../core/services/shop.service';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog'
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ShopParams } from '../../shared/models/shopParams';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrl: './shop.component.scss',
    imports: [
        ProductItemComponent,
        MatButton,
        MatIcon,
        MatMenu,
        MatSelectionList,
        MatListOption,
        MatMenuTrigger,
        MatPaginator,
        FormsModule
    ],
})
export class ShopComponent implements OnInit {
    private shopService = inject(ShopService)
    private dialogService = inject(MatDialog)

    protected shopParams = new ShopParams();
    protected products?: Pagination<Product>;
    protected pageSizeOptions = [5, 10, 15, 20];

    protected sortOptions = [
        { name: 'Alphabetical', value: 'name' },
        { name: 'Price: Low-High', value: 'priceAsc' },
        { name: 'Price: High-Low', value: 'priceDesc' }
    ]

    ngOnInit() {
        this.initializeShop();
    }

    initializeShop() {
        this.shopService.getBrands();
        this.shopService.getTypes();
        this.getProducts();
    }

    private getProducts() {
        this.shopService.getProducts(this.shopParams).subscribe({
            next: response => this.products = response,
            error: error => console.log(error)
        });
    }

    onSearchChange() {
        this.shopParams.pageNumber = 1;
        this.getProducts();
    }

    openFiltersDialog() {
        const dialogRef = this.dialogService.open(FiltersDialogComponent, {
            minWidth: '500px',
            data: {
                selectedBrands: this.shopParams.brands,
                selectedTypes: this.shopParams.types
            }
        });

        dialogRef.afterClosed().subscribe({
            next: result => {
                if (result) {
                    this.shopParams.brands = result.selectedBrands;
                    this.shopParams.types = result.selectedTypes;
                    this.shopParams.pageNumber = 1;
                    this.getProducts();
                }
            }
        });
    }

    onSortChange(event: MatSelectionListChange) {
        const selectedOption = event.options[0];
        if (selectedOption) {
            this.shopParams.sort = selectedOption.value;
            this.shopParams.pageNumber = 1;
            this.getProducts();
        }
    }

    handlePageEvent(event: PageEvent) {
        this.shopParams.pageNumber = event.pageIndex + 1;
        this.shopParams.pageSize = event.pageSize;
        this.getProducts();
    }
}
