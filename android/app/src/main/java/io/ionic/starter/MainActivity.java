package io.ionic.starter;

import android.os.Bundle;
import android.os.StrictMode;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        /*
            Required as long as the sftp plugin work the way it does since it execute networking operation in the
            main thread which is forbidden by the strict mode policy.
            The solution is either making our own sftp plugin or waiting for the issue to be fixed on the
            official plugin (the one we are using: awesome-cordova-plugin/ftp).
        */
        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        super.onCreate(savedInstanceState);
    }
}
