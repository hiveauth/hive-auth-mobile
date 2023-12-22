package com.hiveauth.mobile

import android.annotation.SuppressLint
import android.net.Uri
import android.util.Log
import android.view.View
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.webkit.WebViewAssetLoader
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.lang.Exception

@CapacitorPlugin(name = "HiveAuthSignerCustomPlugin")
class HiveAuthSignerCustom : Plugin() {
  private var webView: WebView? = null
  var mostRecentGetProofOfKeyCall: PluginCall? = null
  var mostRecentValidateHiveKeyCall: PluginCall? = null
  var mostRecentDecryptCall: PluginCall? = null
  var mostRecentEncryptCall: PluginCall? = null
  var mostRecentSignChallengeCall: PluginCall? = null
  var mostRecentGetDeepLinkDataCall: PluginCall? = null
  var mostRecentGetPublicKeyCall: PluginCall? = null

  @PluginMethod
  fun callPlugin(call: PluginCall) {
    if (webView == null) {
      setupWebView()
    }
    val method = call.getString("method")

    val publicKey = call.getString("publicKey")
    val privateKey = call.getString("privateKey")
    val accountName = call.getString("accountName")
    val data = call.getString("data")
    val key = call.getString("key")
    val challenge = call.getString("challenge")
    val userKey = call.getString("userKey")
    val memo = call.getString("memo")

    webView?.post {
      try {
        if (method == "getProofOfKey" && !publicKey.isNullOrEmpty() && !privateKey.isNullOrEmpty() && !memo.isNullOrEmpty()) {
          mostRecentGetProofOfKeyCall = call
          webView?.evaluateJavascript(
            "getProofOfKey('$privateKey', '$publicKey', '$memo');",
            null
          )
        } else if (method == "validateHiveKey" && !accountName.isNullOrEmpty() && !userKey.isNullOrEmpty()) {
          mostRecentValidateHiveKeyCall = call
          webView?.evaluateJavascript("validateHiveKey('$accountName', '$userKey');", null)
        } else if (method == "getPublicKey" && !key.isNullOrEmpty()) {
          mostRecentGetPublicKeyCall = call
          webView?.evaluateJavascript("getPublicKey('$key');", null)
        } else if (method == "decrypt" && !data.isNullOrEmpty() && !key.isNullOrEmpty()) {
          mostRecentDecryptCall = call
          webView?.evaluateJavascript("decrypt('$data', '$key');", null)
        } else if (method == "encrypt" && !data.isNullOrEmpty() && !key.isNullOrEmpty()) {
          mostRecentEncryptCall = call
          webView?.evaluateJavascript("encrypt('$data', '$key');", null)
        } else if (method == "signChallenge" && !challenge.isNullOrEmpty() && !key.isNullOrEmpty()) {
          mostRecentSignChallengeCall = call
          webView?.evaluateJavascript("signChallenge('$challenge', '$key');", null)
        } else if (method == "getDeepLinkData") {
          mostRecentGetDeepLinkDataCall = call
          val uri = (context as? MainActivity)?.deepLinkUri?.toString() ?: ""
          replyWith(uri, call)
          (context as? MainActivity)?.deepLinkUri = null
        } else {
          Log.d("Do", "Nothing");
        }
      } catch (e: Exception) {
        Log.d("error", "Error - $e")
      }
    }
  }

  fun replyWith(data: String, call: PluginCall) {
    val callId = call.getString("callId") ?: return
    val returnObject = JSObject()
    returnObject.put("dataString", data)
    val info = JSObject()
    info.put("callId", callId)
    returnObject.put("info", info)
    call.resolve(returnObject)
  }

  override fun load() {
    super.load()
    setupWebView()
  }

  @SuppressLint("SetJavaScriptEnabled")
  private fun setupWebView() {
    val params = FrameLayout.LayoutParams(0, 0)
    webView = WebView(activity)
    val decorView = activity.window.decorView as FrameLayout
    decorView.addView(webView, params)
    webView?.visibility = View.GONE
    webView?.settings?.javaScriptEnabled = true
    webView?.settings?.domStorageEnabled = true
//        webView?.webChromeClient = WebChromeClient()
    WebView.setWebContentsDebuggingEnabled(true)
    val assetLoader = WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(activity.baseContext))
      .build()
    val client: WebViewClient = object : WebViewClient() {
      override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest
      ): WebResourceResponse? {
        return assetLoader.shouldInterceptRequest(request.url)
      }

      override fun shouldInterceptRequest(
        view: WebView,
        url: String
      ): WebResourceResponse? {
        return assetLoader.shouldInterceptRequest(Uri.parse(url))
      }
    }
    webView?.webViewClient = client
    webView?.addJavascriptInterface(WebAppInterface(this), "Android")
    webView?.loadUrl("https://appassets.androidplatform.net/assets/other/index.html")
  }
}


class WebAppInterface(private val pluginHandler: HiveAuthSignerCustom) {
  @JavascriptInterface
  fun postMessage(message: String) {
    if (message.contains("validateHiveKey") && pluginHandler.mostRecentValidateHiveKeyCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentValidateHiveKeyCall as PluginCall)
    } else if (message.contains("getProofOfKey") && pluginHandler.mostRecentGetProofOfKeyCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentGetProofOfKeyCall as PluginCall)
    } else if (message.contains("decrypt") && pluginHandler.mostRecentDecryptCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentDecryptCall as PluginCall)
    } else if (message.contains("encrypt") && pluginHandler.mostRecentEncryptCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentEncryptCall as PluginCall)
    } else if (message.contains("signChallenge") && pluginHandler.mostRecentSignChallengeCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentSignChallengeCall as PluginCall)
    } else if (message.contains("getDeepLinkData") && pluginHandler.mostRecentGetDeepLinkDataCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentGetDeepLinkDataCall as PluginCall)
    } else if (message.contains("getPublicKey") && pluginHandler.mostRecentGetPublicKeyCall != null) {
      pluginHandler.replyWith(message, pluginHandler.mostRecentGetPublicKeyCall as PluginCall)
    }
  }
}
