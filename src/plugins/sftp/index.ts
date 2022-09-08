import {registerPlugin} from '@capacitor/core';
import {SftpPlugin} from './definitions';

const Sftp = registerPlugin<SftpPlugin>(
    'Sftp'
);

export * from './definitions';
export {Sftp};
