package com.hiveauth.mobile;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

import java.net.URI;

public class MainActivity extends BridgeActivity {
  Uri deepLinkUri;
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    registerPlugin(HiveAuthSignerCustom.class);
    super.onCreate(savedInstanceState);
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    if (intent != null) {
      deepLinkUri = intent.getData();
    }
  }
}
