package com.hiveauth.authsigner;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    registerPlugin(HiveAuthSignerCustom.class);
    super.onCreate(savedInstanceState);
  }
}
