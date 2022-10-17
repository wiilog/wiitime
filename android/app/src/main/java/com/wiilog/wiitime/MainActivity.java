package com.wiilog.wiitime;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import com.wiilog.wiitime.plugins.Sftp.SftpPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SftpPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
