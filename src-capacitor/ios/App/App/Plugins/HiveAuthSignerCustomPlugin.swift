//
//  HiveAuthSignerCustomPlugin.swift
//  App
//
//  Created by Sagar on 16/11/23.
//

import Foundation

import Capacitor

@objc(HiveAuthSignerCustomPlugin)
public class HiveAuthSignerCustomPlugin: CAPPlugin {

    var pluginViewController = UIStoryboard(
        name: "Main",
        bundle: nil
    ).instantiateViewController(
        withIdentifier: "PluginViewController"
    ) as? PluginViewController

    public override func load() {
        debugPrint("Plugin is loaded")
        super.load()
        pluginViewController?.viewDidLoad()
    }

    @objc func callPlugin(_ call: CAPPluginCall) {
        guard
            let callId = call.getString("callId"),
            let method = call.getString("method"),
            let privateKey = call.getString("privateKey"),
            let publicKey = call.getString("publicKey"),
            let memo = call.getString("memo"),
//            let accountName = call.getString("accountName"),
//            let userKey = call.getString("userKey"),
            let challenge = call.getString("challenge"),
            let key = call.getString("key")
        else { return }

        if method != "getDeepLinkData" {
            pluginViewController?.handlers[callId] = { result in
                call.resolve([
                    "callId": callId,
                    "info": [
                        "dataString": result
                    ]
                ])
            }
        } else {
            OperationQueue.main.addOperation {
                guard
                    let appDel = UIApplication.shared.delegate as? AppDelegate
                else {
                    call.resolve([
                        "callId": callId,
                        "dataString": ""
                    ])
                    return
                }
                call.resolve([
                    "callId": callId,
                    "dataString": appDel.deeplink ?? ""
                ])
                appDel.deeplink = nil
            }
        }

        if method == "getProofOfKey" {
            pluginViewController?.webView?
                .evaluateJavaScript("getProofOfKey('\(privateKey)','\(publicKey)','\(memo)');")
        } else if method == "signChallenge" {
            pluginViewController?.webView?
                .evaluateJavaScript("signChallenge('\(challenge)','\(key)');")
        } else if method == "decrypt" {
            pluginViewController?.webView?
                .evaluateJavaScript("decrypt('\(challenge)','\(privateKey)');")
        } else if method == "getPublicKey" {
            pluginViewController?.webView?
                .evaluateJavaScript("getPublicKey('\(privateKey)');")
        } 

//        else if method == "getDeepLinkData" {
//            // TO-DO: - How do we do this? 🤷‍♂️
//        }
    }
}
