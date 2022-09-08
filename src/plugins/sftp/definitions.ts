export interface SftpPlugin {

    /**
     * Try to establish a connection with the given sftp server. If a connection already exist, close it
     * Will ask the use for the storage permission
     *
     * @param connexionInfo an object containing the address of the server and the username and the password to use to connect to it
     * @return true, if the connection was successfully created or raise an exception
     */
    connect(connexionInfo: { hostname: string; username: string; password: string }): Promise<{success: boolean}>;

    /**
     * Upload the file at the given localPath to currently connected server at the given path
     *
     * @param uploadInfo an object containing the path of the file to upload and the path where the file should be uploaded on the server
     * @return true, if the upload operation succeed or raise an exception
     */
    upload(uploadInfo: { localFile: string; remoteFile: string }): Promise<{success: boolean}>;

    /**
     * If a connection is ongoing, close it
     *
     * @return true if a connection was closed, false otherwise
     */
    disconnect(): Promise<{success: boolean}>;

    checkPermissions(): Promise<PermissionStatus>;

    requestPermissions(): Promise<PermissionStatus>;
}

export interface PermissionStatus {
    storage: PermissionState;
}
