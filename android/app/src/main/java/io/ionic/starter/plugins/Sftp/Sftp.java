package io.ionic.starter.plugins.Sftp;

import com.jcraft.jsch.*;

public class Sftp {

    private final int port = 22;
    private JSch jsch;
    private Session session;
    private ChannelSftp sftpChannel;

    public Sftp() {
    }

    public void createConnexion(String hostname, String username, String password) throws JSchException {
        if(session != null && sftpChannel != null) {
            disconnect();
        }
        jsch = new JSch();
        session = jsch.getSession(username, hostname, port);
        session.setPassword(password);
        session.setConfig("StrictHostKeyChecking", "no");
        session.connect();

        Channel tmp = session.openChannel("sftp");
        sftpChannel = (ChannelSftp) tmp;
        sftpChannel.connect();
    }

    public void upload(String localFile, String remoteFile) throws SftpException, NotConnectedException {
        if(session == null || sftpChannel == null) {
            throw new NotConnectedException("Cannot upload the given file since there is no ongoing connection");
        }
        if(sftpChannel.isClosed()) {
            sftpChannel = null;
            session = null;
            throw new NotConnectedException("Current connection has been closed, try to connect again");
        }
        sftpChannel.put(localFile, remoteFile, ChannelSftp.OVERWRITE);
    }

    public Boolean disconnect() {
        if(session == null || sftpChannel == null) {
            return false;
        }
        sftpChannel.exit();
        session.disconnect();
        sftpChannel = null;
        session = null;
        return true;
    }
}
