import {Injectable} from '@angular/core';
import {StorageService} from '@app/services/storage/storage.service';
import {AudioAssetInfo} from '@app/services/audio/audio-asset-info';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {from, Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {NativeAudio} from '@capacitor-community/native-audio';

@Injectable({
    providedIn: 'root'
})
export class AudioService {

    private preloadedAudioId: Array<string>;

    public constructor(private storageService: StorageService) {
        this.preloadedAudioId = new Array<string>();
    }

    public preloadAudio(audioId: string, audioInfo: AudioAssetInfo): Observable<boolean> {
        if (this.preloadedAudioId.includes(audioId)) {
            return of(false);
        }

        return this.storageService.getValue(StorageKeyEnum.CLOCKING_SOUND_VOLUME)
            .pipe(
                mergeMap((clockingSoundVolume) =>
                    NativeAudio.preload({
                        assetId: audioId,
                        assetPath: audioInfo.assetPath,
                        //volume should be between 0 and 1 and value from storage is between 0 and 100
                        volume: Number(clockingSoundVolume) / 100,
                        audioChannelNum: 1,
                        isUrl: audioInfo.isPathUrl,
                    })
                ),
                map(() => {
                    this.preloadedAudioId.push(audioId);
                    console.log('load done');
                    return true;
                }),
                catchError((err) => {
                    console.error(err);
                    return of(false);
                }),
            );
    }

    /**
     * Play the audio file linked to the given id from start time second if it's loaded
     * Never await this function as NativeAudio.play will never finish
     *
     * @param audioId the id of the loaded audio that should be played
     * @param startTime the starting second of the audio file (should be inferior to the file length)
     */
    public playAudio(audioId: string, startTime: number): void {
        if (!this.preloadedAudioId.includes(audioId)) {
            return;
        }
        NativeAudio.getDuration({assetId: audioId})
            .then((soundDuration) => {
                if(startTime > soundDuration.duration) {
                    return;
                }
                NativeAudio.play({
                        assetId: audioId,
                        time: startTime
                    });
                }
            );
    }

    public unloadAudio(audioId: string): void {
        const index = this.preloadedAudioId.indexOf(audioId);
        if (index >= 0) {
            from(NativeAudio.unload({
                assetId: audioId
            })).subscribe(() => {
                this.preloadedAudioId.splice(index, 1);
                console.log('unload done');
            });
        }
    }
}
