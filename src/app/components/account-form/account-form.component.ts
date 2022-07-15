import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnInit {

    @Output()
    public validSubmission: EventEmitter<any>;

    constructor() {
        this.validSubmission = new EventEmitter<any>();
    }

    ngOnInit() {
    }

    public formSubmitted(): void {
    }
}
