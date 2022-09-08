package io.ionic.starter.plugins.Sftp;

import android.Manifest;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.SftpException;


/**
 * Inspired by cordova-plugin-sftp-leapfroggr (https://github.com/moribaleta/cordova-plugin-sftp-leapfroggr)
 * and jjdltc-cordova-plugin-sftp (https://github.com/jjdltc/jjdltc-cordova-plugin-sftp)
 * <p>
 * used the JSch java library (http://www.jcraft.com/jsch/) and the following example (http://www.jcraft.com/jsch/examples/Sftp.java.html)
 * <p>
 * Does not handle multiple connection (close the previous one if a new one if open) and can only be used to upload file to remote server
 */
@CapacitorPlugin(
    name = "Sftp",
    permissions = {
        @Permission(
            alias = "storage",
            strings = {
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.WRITE_EXTERNAL_STORAGE
            }
        )
    }
)
public class SftpPlugin extends Plugin {

    private Sftp implementation;
    private PermCallbackStarter currentCallbackStarter;

    @Override
    public void load() {
        implementation = new Sftp();
    }

    @PluginMethod()
    public void connect(PluginCall call) {
        if (getPermissionState("storage") != PermissionState.GRANTED) {
            currentCallbackStarter = PermCallbackStarter.CONNECT;
            requestPermissionForAlias("storage", call, "storagePermsCallback");
        }
        continueConnect(call);
    }

    private void continueConnect(PluginCall call) {
        JSObject ret = new JSObject();
        String hostname = call.getString("hostname");
        String username = call.getString("username");
        String password = call.getString("password");
        int port = Integer.parseInt(call.getString("port", "22"));
        try {
            implementation.createConnexion(hostname, username, password, port);
        } catch (JSchException jSchException) {
            call.reject(jSchException.getLocalizedMessage(), null, jSchException);
        }
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void upload(PluginCall call) {
        JSObject ret = new JSObject();
        String localFile = call.getString("localFile");
        String remoteFile = call.getString("remoteFile");
        try {
            implementation.upload(localFile, remoteFile);
        } catch (SftpException | NotConnectedException e) {
            call.reject(e.getLocalizedMessage(), null, e);
        }
        ret.put("success", true);
        call.resolve(ret);
    }

    @PluginMethod()
    public void disconnect(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("success", implementation.disconnect());
        call.resolve(ret);
    }

    @PluginMethod()
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        PermissionState permissionState = getPermissionState("storage");
        ret.put("state", permissionState);
        call.resolve(ret);
    }

    @PluginMethod()
    public void requestPermissions(PluginCall call) {
        currentCallbackStarter = PermCallbackStarter.REQUEST_PERMISSIONS;
        requestPermissionForAlias("storage", call, "storagePermsCallback");
    }


    @PermissionCallback
    private void storagePermsCallback(PluginCall call) {
        PermissionState permissionState = getPermissionState("storage");
        if (permissionState == PermissionState.GRANTED) {
            if (currentCallbackStarter == PermCallbackStarter.CONNECT) {
                continueConnect(call);
            } else {
                JSObject ret = new JSObject();
                ret.put("state", permissionState);
                call.resolve(ret);
            }
        } else {
            call.reject("Permission is required to upload a file");
        }
    }
}
