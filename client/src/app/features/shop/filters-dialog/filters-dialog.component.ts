import { Component, inject } from '@angular/core';
import { ShopService } from '../../../core/services/shop.service';
import { MatDivider } from '@angular/material/divider'
import { MatSelectionList, MatListOption } from '@angular/material/list'
import { MatButton } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-filters-dialog',
    imports: [MatDivider, MatSelectionList, MatListOption, MatButton, FormsModule],
    templateUrl: './filters-dialog.component.html',
    styleUrl: './filters-dialog.component.scss'
})
export class FiltersDialogComponent {
    protected shopService = inject(ShopService)
    private dialogRef = inject(MatDialogRef<FiltersDialogComponent>)
    private data = inject(MAT_DIALOG_DATA)

    protected selectedBrands: string[] = this.data.selectedBrands;
    protected selectedTypes: string[] = this.data.selectedTypes;

    applyFilters() {
        this.dialogRef.close({
            selectedBrands: this.selectedBrands,
            selectedTypes: this.selectedTypes
        });
    }

    clearFilters() {
        this.selectedBrands = [];
        this.selectedTypes = [];
        this.applyFilters();
    }
}
