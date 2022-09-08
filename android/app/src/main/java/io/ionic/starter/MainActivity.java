package io.ionic.starter;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import io.ionic.starter.plugins.Sftp.SftpPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SftpPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
