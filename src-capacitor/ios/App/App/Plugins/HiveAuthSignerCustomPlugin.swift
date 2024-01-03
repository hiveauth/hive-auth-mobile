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
            let challenge = call.getString("challenge"),
            let key = call.getString("key")
        else { return }

        if method != "getDeepLinkData" {
            pluginViewController?.handlers[callId] = { result in
                call.resolve([
                    "callId": callId,
                    "dataString": result
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
            OperationQueue.main.addOperation {
                self.pluginViewController?.webView?
                    .evaluateJavaScript("getProofOfKey('\(privateKey)','\(publicKey)','\(memo)', '\(callId)');")
            }
        } else if method == "signChallenge" {
            OperationQueue.main.addOperation {
                self.pluginViewController?.webView?
                    .evaluateJavaScript("signChallenge('\(challenge)','\(key)', '\(callId)');")
            }
        } else if method == "decrypt" {
            OperationQueue.main.addOperation {
                self.pluginViewController?.webView?
                    .evaluateJavaScript("decrypt('\(challenge)','\(privateKey)', '\(callId)');")
            }
        } else if method == "getPublicKey" {
            OperationQueue.main.addOperation {
                self.pluginViewController?.webView?
                    .evaluateJavaScript("getPublicKey('\(privateKey)', '\(callId)');")
            }
        }
    }
}
