package io.ionic.starter.plugins.Sftp;

public class NotConnectedException extends Exception {

    public NotConnectedException(String errorMessage) {
        super(errorMessage);
    }
}
