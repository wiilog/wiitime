import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-form-actionable',
    templateUrl: './form-actionable.component.html',
    styleUrls: ['./form-actionable.component.scss'],
})
export class FormActionableComponent implements OnInit {

    @Input()
    public fieldName: string;

    @Input()
    public imagePath: string;

    @Output()
    public fieldActioned: EventEmitter<any>;

    constructor() {
        this.fieldActioned = new EventEmitter<any>();
    }

    ngOnInit() {
    }

    public iconClicked() {
        this.fieldActioned.emit();
    }
}
