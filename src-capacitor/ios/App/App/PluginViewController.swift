//
//  PluginViewController.swift
//  App
//
//  Created by Sagar on 16/11/23.
//

import UIKit
import WebKit

class PluginViewController: UIViewController {
    let app = "app"
    let config = WKWebViewConfiguration()
    let rect = CGRect(x: 0, y: 0, width: 10, height: 10)
    var webView: WKWebView?
    var didFinish = false
    var handlers: [String: ((String) -> Void)] = [: ]

//    var getProofOfKeyHandler: ((String) -> Void)? = nil
//    var decryptHandler: ((String) -> Void)? = nil
//    var encryptHandler: ((String) -> Void)? = nil
//    var getPublicKeyHandler: ((String) -> Void)? = nil
//    var signChallengeHandler: ((String) -> Void)? = nil
//    var validateHiveKeyHandler: ((String) -> Void)? = nil

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
    }

    func setupWebView() {
        config.userContentController.add(self, name: app)
        webView = WKWebView(frame: rect, configuration: config)
        webView?.navigationDelegate = self
//#if DEBUG
        if #available(iOS 16.4, *) {
            self.webView?.isInspectable = true
        }
//#endif
        guard
            let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "HiveAuth")
        else { return }
        let dir = url.deletingLastPathComponent()
        webView?.loadFileURL(url, allowingReadAccessTo: dir)
    }
}

extension PluginViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        didFinish = true
    }
}

extension PluginViewController: WKScriptMessageHandler {
    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == app else { return }
        guard let dict = message.body as? [String: AnyObject] else { return }
        guard let type = dict["type"] as? String else { return }
        guard let error = dict["error"] as? String else { return }
        guard let data = dict["data"] as? String else { return }
        guard let id = dict["id"] as? String else { return }
        guard let jsonData = try? JSONEncoder().encode([
            "error": error,
            "data": data,
            "type": type,
            "id": id,
        ]) else { return }
        guard let jsonString = String(data: jsonData, encoding: .utf8) else { return }
//        switch type {
//        case "getProofOfKey":
//            getProofOfKeyHandler?(jsonString)
//        case "decrypt":
//            decryptHandler?(jsonString)
//        case "encrypt":
//            encryptHandler?(jsonString)
//        case "getPublicKey":
//            getPublicKeyHandler?(jsonString)
//        case "signChallenge":
//            signChallengeHandler?(jsonString)
//        case "validateHiveKey":
//            validateHiveKeyHandler?(jsonString)
//        default:
//            debugPrint("Do Nothing")
//        }
        guard let handler = handlers[id] else { return }
        handler(jsonString)
        handlers[id] = nil
    }
}
