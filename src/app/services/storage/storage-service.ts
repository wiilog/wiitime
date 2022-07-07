import {Injectable} from '@angular/core';
import {Storage} from '@capacitor/storage';
import {from, Observable} from 'rxjs';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    public constructor() {}

    public setValue(key: StorageKeyEnum, value: any): Observable<void> {
        return from(Storage.set({
            key: key,
            value: value
        })) as Observable<void>;
    }
}
