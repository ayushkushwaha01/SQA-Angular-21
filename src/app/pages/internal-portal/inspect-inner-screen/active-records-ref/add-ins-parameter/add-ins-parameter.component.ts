import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LookupService } from 'src/app/pages/admin/lookup/lookup.service';

@Component({
  standalone: false,
  selector: 'app-add-ins-parameter',
  templateUrl: './add-ins-parameter.component.html',
  styleUrls: ['./add-ins-parameter.component.scss']
})
export class AddInsParameterComponent implements OnInit {

  isEditMode: boolean = false;
  localData: any = {}; 
    lookups: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddInsParameterComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private lookupService: LookupService
  ) { }

  ngOnInit() {
    if (this.data) {
      this.isEditMode = true;
      this.localData = { ...this.data }; // This clones the object including 'special' if passed from ActiveRecordsRefComponent
      if (this.localData.unitId === undefined) {
        this.localData.unitId = null;
      }
    } else {
      this.isEditMode = false;
      this.localData = {
        unitId: null
      }; 
    }
    this.getLookups()
  }


  getLookups() {
    this.lookupService.getLookups().subscribe((res: any) => {
      if (res.success) {
        this.lookups = res.data.filter((x: any) => x.codeId === 3);
        if (this.localData) {
          if (this.localData.unitId || this.localData.UnitId) {
            const uId = this.localData.unitId || this.localData.UnitId;
            this.localData.unitId = uId;
            this.localData.UnitId = uId;
          } else if (this.localData.unit) {
            const matched = this.lookups.find(x => x.lookupName.toLowerCase() === this.localData.unit.toLowerCase());
            if (matched) {
              this.localData.unitId = matched.lookupId;
              this.localData.UnitId = matched.lookupId;
            }
          }
        }
      }
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.localData.unitId) {
      const matched = this.lookups.find(x => x.lookupId == this.localData.unitId);
      if (matched) {
        this.localData.unit = matched.lookupName;
        this.localData.Unit = matched.lookupName;
        this.localData.UnitId = matched.lookupId;
        this.localData.unitId = matched.lookupId;
      }
    } else {
      this.localData.unit = null;
      this.localData.Unit = null;
      this.localData.unitId = null;
      this.localData.UnitId = null;
    }
    this.dialogRef.close(this.localData);
  }
}