import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-form-button',
    templateUrl: './form-button.component.html',
    styleUrls: ['./form-button.component.scss'],
})
export class FormButtonComponent implements OnInit {

    @Input()
    public buttonText: string;

    @Input()
    public iconPath: string;

    @Input()
    public isLarge: boolean;

    @Input()
    public stickToBottom: boolean;

    @Input()
    public fillScreenWidth: boolean;

    @Output()
    public buttonClickedEvent: EventEmitter<any>;

    constructor() {
        this.buttonClickedEvent = new EventEmitter<any>();
        //How do i set default value ?
    }

    ngOnInit() {
    }

    public buttonClicked() {
        this.buttonClickedEvent.emit();
    }

}
